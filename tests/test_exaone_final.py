#!/usr/bin/env python3
"""
최종 Exaone API 메타데이터 추출 테스트
- 개선된 프롬프트 사용
- 실제 분석 결과 추출
"""

import os
import json
import requests
import re
import glob
from dotenv import load_dotenv

load_dotenv()

def parse_llm_response(response_text):
    """LLM 응답에서 JSON 형식의 메타데이터만 엄격하게 파싱"""
    # JSON 패턴 찾기
    json_matches = re.findall(r'\{[^{}]*(?:"[^"]*"[^{}]*)*\}', response_text)
    
    if not json_matches:
        raise ValueError("응답에서 JSON 형식을 찾을 수 없습니다.")
    
    # 첫 번째 JSON 시도
    for json_str in json_matches:
        try:
            parsed = json.loads(json_str)
            
            # 필수 필드 검증
            required_fields = ['title', 'summary', 'topics']
            for field in required_fields:
                if field not in parsed:
                    raise ValueError(f"필수 필드 '{field}'가 JSON에 없습니다.")
            
            # topics가 배열인지 확인
            if not isinstance(parsed['topics'], list):
                raise ValueError("'topics' 필드는 배열이어야 합니다.")
            
            return parsed
            
        except json.JSONDecodeError as e:
            continue  # 다음 JSON 시도
    
    # 모든 JSON이 실패한 경우
    raise ValueError(f"유효한 JSON을 파싱할 수 없습니다. 발견된 JSON 후보: {json_matches}")

def test_final_exaone():
    # API 설정
    api_key = os.getenv('EXAONE_API_KEY')
    api_url = os.getenv('EXAONE_API_URL', 'https://api.lgresearch.ai')
    
    headers = {
        "Content-Type": "application/json; charset=utf-8",
        "x-api-key": api_key,
    }
    
    # 저장된 데이터 로드
    # files = glob.glob("tests/data/notion_sample_short.json")
    files = glob.glob("tests/data/notion_sample_full.json")
    if not files:
        print("❌ Notion 데이터 파일이 없습니다.")
        return
    
    filename = max(files, key=os.path.getctime)
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    content = data.get('content', '')[:1500]  # 처음 1500자
    
    # 개선된 프롬프트 - 더 구체적이고 길게 응답하도록 유도
    prompt = f"""다음 문서를 자세히 분석하여 완전한 JSON 형식으로 메타데이터를 추출해주세요.

문서 내용:
{content}

위 문서를 분석하여 다음 JSON 형식으로 응답해주세요. 반드시 완전한 JSON만 출력하고, 다른 설명은 포함하지 마세요:

{{
  "title": "문서의 정확한 제목 (예: Exaone 개발 노트)",
  "summary": "문서의 주요 내용을 2-3문장으로 상세히 요약",
  "topics": ["주제1", "주제2", "주제3"]
}}

중요: 반드시 완전한 JSON 형식으로만 응답하세요."""

    payload = {
        "model": "32b",
        "query": prompt,
        "temperature": 0.1,
        "max_tokens": 500,
        "top_p": 0.9
    }
    
    print("🚀 최종 Exaone API 메타데이터 추출 테스트")
    print(f"📝 프롬프트 길이: {len(prompt)} 문자")
    print(f"📄 콘텐츠 길이: {len(content)} 문자")
    print("-" * 60)
    
    try:
        url = f"{api_url}/v1/chatexaone/text-generation"
        response = requests.post(url=url, json=payload, headers=headers, stream=True)
        
        print(f"📊 응답 상태: {response.status_code}")
        
        if response.status_code == 200:
            # 스트리밍 응답에서 answer 필드만 추출하여 결합
            full_answer = ""
            for stream in response.iter_lines():
                if stream:
                    line = stream.decode("utf-8")
                    # 한 라인에 여러 JSON이 붙어있을 수 있으므로 }{ 패턴으로 분리
                    json_parts = line.replace('}{', '}|||{').split('|||')
                    
                    for json_str in json_parts:
                        try:
                            data = json.loads(json_str)
                            if data.get('result_code') == 200:
                                answer = data.get('data', {}).get('answer', '')
                                if answer:
                                    full_answer += answer
                        except json.JSONDecodeError:
                            continue
            
            print("✅ 최종 결과:")
            print("-" * 40)
            print(full_answer)
            print("-" * 40)
            
            # 답변에서 메타데이터 파싱 시도 (엄격한 JSON 파싱)
            try:
                extracted_metadata = parse_llm_response(full_answer)
                
                print(f"\n📊 LLM 응답 파싱 결과:")
                print("=" * 40)
                print(f"제목: {extracted_metadata.get('title', 'N/A')}")
                print(f"요약: {extracted_metadata.get('summary', 'N/A')}")
                print(f"주제: {extracted_metadata.get('topics', 'N/A')}")
                print("=" * 40)
                
                final_metadata = extracted_metadata
                
            except ValueError as e:
                print(f"\n❌ JSON 파싱 오류: {e}")
                print("응답에서 유효한 JSON을 찾을 수 없거나 필수 필드가 누락되었습니다.")
                final_metadata = None
            
            # 결과 저장
            if final_metadata:
                result_file = f"extracted_metadata_{data.get('page_id', 'unknown')[:8]}.json"
                with open(result_file, 'w', encoding='utf-8') as f:
                    json.dump({
                        "source_file": filename,
                        "extracted_metadata": final_metadata,
                        "full_response": full_answer,
                        "timestamp": "2025-10-21"
                    }, f, indent=2, ensure_ascii=False)
                print(f"\n💾 메타데이터가 저장되었습니다: {result_file}")
        else:
            print(f"❌ 실패: {response.status_code}")
            print(f"📄 응답: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ 오류: {e}")

if __name__ == "__main__":
    test_final_exaone()