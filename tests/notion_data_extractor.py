#!/usr/bin/env python3
"""
Notion 데이터 추출기
- Notion 링크에서 콘텐츠 추출
- JSON 파일로 저장
- 샘플 데이터 생성용
"""

import os
import json
import requests
import re
from datetime import datetime
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

class NotionDataExtractor:
    def __init__(self):
        # API 설정
        self.notion_token = os.getenv('NOTION_TOKEN')
        self.backend_url = os.getenv('VITE_API_URL', 'http://localhost:3001')
        
        self.headers = {
            "Content-Type": "application/json",
        }
        
        print(f"🔧 Notion Token: {'설정됨' if self.notion_token else '❌ 미설정'}")
        print(f"🔧 Backend URL: {self.backend_url}")

    def extract_page_id_from_url(self, notion_url: str) -> str:
        """Notion URL에서 페이지 ID 추출"""
        print(f"\n🔍 URL에서 페이지 ID 추출: {notion_url}")
        
        # Notion URL 패턴들
        patterns = [
            r'notion\.so/([a-f0-9]{32})',
            r'notion\.so/.+-([a-f0-9]{32})',
            r'notion\.so/.*-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})',
            r'([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})',
            r'([a-f0-9]{32})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, notion_url)
            if match:
                page_id = match.group(1)
                # 하이픈 제거 후 표준 형식으로 변환
                page_id = page_id.replace('-', '')
                formatted_id = f"{page_id[:8]}-{page_id[8:12]}-{page_id[12:16]}-{page_id[16:20]}-{page_id[20:]}"
                print(f"✅ 추출된 페이지 ID: {formatted_id}")
                return formatted_id
        
        raise ValueError(f"유효하지 않은 Notion URL: {notion_url}")

    def fetch_notion_content_direct(self, page_id: str) -> dict:
        """Notion API 직접 호출로 콘텐츠 가져오기"""
        print(f"\n🔍 Notion API 직접 호출: {page_id}")
        
        if not self.notion_token:
            print("❌ NOTION_TOKEN이 설정되지 않았습니다.")
            return None
        
        notion_headers = {
            "Authorization": f"Bearer {self.notion_token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        
        try:
            # 페이지 정보 가져오기
            page_url = f"https://api.notion.com/v1/pages/{page_id}"
            page_response = requests.get(page_url, headers=notion_headers, timeout=30)
            
            if page_response.status_code != 200:
                print(f"❌ 페이지 정보 가져오기 실패: {page_response.status_code}")
                try:
                    error = page_response.json()
                    print(f"📄 오류: {json.dumps(error, indent=2, ensure_ascii=False)}")
                except:
                    print(f"📄 응답: {page_response.text}")
                return None
            
            page_data = page_response.json()
            print(f"✅ 페이지 정보 가져오기 성공!")
            
            # 블록 내용 가져오기
            blocks_url = f"https://api.notion.com/v1/blocks/{page_id}/children"
            blocks_response = requests.get(blocks_url, headers=notion_headers, timeout=30)
            
            if blocks_response.status_code != 200:
                print(f"❌ 블록 내용 가져오기 실패: {blocks_response.status_code}")
                return None
            
            blocks_data = blocks_response.json()
            print(f"✅ 블록 내용 가져오기 성공! ({len(blocks_data.get('results', []))} 블록)")
            
            # 텍스트 콘텐츠 추출
            content = self.extract_text_from_blocks(blocks_data.get('results', []))
            
            result = {
                "page_id": page_id,
                "page_info": page_data,
                "blocks": blocks_data,
                "content": content,
                "extracted_at": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            print(f"❌ Notion API 호출 오류: {e}")
            return None

    def extract_text_from_blocks(self, blocks: list) -> str:
        """블록에서 텍스트 추출"""
        content_parts = []
        
        for block in blocks:
            block_type = block.get('type', '')
            
            if block_type == 'paragraph':
                text = self.extract_rich_text(block.get('paragraph', {}).get('rich_text', []))
                if text:
                    content_parts.append(text)
            
            elif block_type == 'heading_1':
                text = self.extract_rich_text(block.get('heading_1', {}).get('rich_text', []))
                if text:
                    content_parts.append(f"# {text}")
            
            elif block_type == 'heading_2':
                text = self.extract_rich_text(block.get('heading_2', {}).get('rich_text', []))
                if text:
                    content_parts.append(f"## {text}")
            
            elif block_type == 'heading_3':
                text = self.extract_rich_text(block.get('heading_3', {}).get('rich_text', []))
                if text:
                    content_parts.append(f"### {text}")
            
            elif block_type == 'bulleted_list_item':
                text = self.extract_rich_text(block.get('bulleted_list_item', {}).get('rich_text', []))
                if text:
                    content_parts.append(f"- {text}")
            
            elif block_type == 'numbered_list_item':
                text = self.extract_rich_text(block.get('numbered_list_item', {}).get('rich_text', []))
                if text:
                    content_parts.append(f"1. {text}")
            
            elif block_type == 'code':
                text = self.extract_rich_text(block.get('code', {}).get('rich_text', []))
                language = block.get('code', {}).get('language', '')
                if text:
                    content_parts.append(f"```{language}\n{text}\n```")
            
            elif block_type == 'quote':
                text = self.extract_rich_text(block.get('quote', {}).get('rich_text', []))
                if text:
                    content_parts.append(f"> {text}")
        
        return '\n\n'.join(content_parts)

    def extract_rich_text(self, rich_text_list: list) -> str:
        """리치 텍스트에서 일반 텍스트 추출"""
        text_parts = []
        for item in rich_text_list:
            if 'text' in item:
                text_parts.append(item['text']['content'])
        return ''.join(text_parts)

    def save_notion_data(self, data: dict, url: str) -> str:
        """Notion 데이터를 파일로 저장"""
        if not data:
            print("❌ 저장할 데이터가 없습니다.")
            return None
        
        # 파일명 생성 (타임스탬프 + 페이지ID)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        page_id = data.get('page_id', 'unknown')[:8]
        filename = f"notion_data_{timestamp}_{page_id}.json"
        
        # 데이터에 원본 URL 추가
        data['original_url'] = url
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"💾 Notion 데이터가 저장되었습니다: {filename}")
            print(f"📊 저장된 데이터:")
            print(f"   - 페이지 ID: {data.get('page_id')}")
            print(f"   - 콘텐츠 길이: {len(data.get('content', ''))} 문자")
            print(f"   - 블록 수: {len(data.get('blocks', {}).get('results', []))} 개")
            print(f"   - 추출 시간: {data.get('extracted_at')}")
            
            return filename
            
        except Exception as e:
            print(f"❌ 파일 저장 오류: {e}")
            return None

    def create_sample_data(self, content: str = None) -> str:
        """샘플 데이터 생성"""
        if not content:
            content = """# Exaone 개발 노트

## 프로젝트 개요
EXAONE은 LG AI Research에서 개발한 초거대 AI 모델입니다. 이 문서는 EXAONE API를 활용한 ARAI 프로젝트 개발 과정을 기록합니다.

## 주요 기능

### 1. Text Generation API
- 모델: 32B 파라미터  
- 엔드포인트: `/v1/chatexaone/text-generation`
- 기능: 텍스트 생성, 요약, 메타데이터 추출

### 2. Chat Completion API
- 엔드포인트: `/v1/chatexaone/chat-completion`
- 기능: 대화형 AI, 웹검색, 문서 QA

### 3. 주요 특징
- 스트리밍 응답 지원
- 한국어 특화 모델
- 멀티턴 대화 지원
- Intent 자동 분류 (chitchat, web_search, document_answer 등)

## 개발 진행사항

### 완료된 작업
1. ✅ API 인증 및 연결 테스트
2. ✅ Text Generation 엔드포인트 검증
3. ✅ 메타데이터 추출 프롬프트 설계
4. ✅ Notion API 통합 준비

### 진행 중인 작업
- 🔄 Notion + Exaone API 통합 테스트
- 🔄 메타데이터 추출 프롬프트 최적화
- 🔄 백엔드 API 개발

### 예정된 작업
- ⏳ Flow2: DB 생성 및 메타데이터 저장
- ⏳ Flow3: Query with prompts 구현
- ⏳ Docker 컨테이너화
- ⏳ 베타 테스트 환경 구축

## 기술 스택
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **AI**: EXAONE 32B API
- **Integration**: Notion API
- **Deployment**: Docker

## 참고사항
- API Rate Limit: 일 5000회, 분당 60회
- 모델 파라미터: `model: "32b"` 필수
- Temperature 권장값: 0.1-0.8 (용도에 따라 조절)
- 최대 토큰 제한 고려 필요

## 다음 단계
1. Notion 페이지 콘텐츠 자동 추출 완성
2. 메타데이터 DB 스키마 설계  
3. 사용자 쿼리 시스템 구현
4. 성능 최적화 및 테스트

## 태그
#EXAONE #AI #LLM #API #Notion #ARAI #개발노트 #메타데이터"""

        sample_data = {
            "page_id": "sample-data-" + datetime.now().strftime("%Y%m%d%H%M%S"),
            "page_info": {
                "object": "page",
                "properties": {
                    "title": {
                        "title": [{"text": {"content": "Exaone 개발 노트"}}]
                    }
                }
            },
            "content": content,
            "original_url": "sample://notion-data",
            "extracted_at": datetime.now().isoformat(),
            "data_type": "sample"
        }
        
        filename = self.save_notion_data(sample_data, "sample://notion-data")
        return filename

    def extract_from_url(self, notion_url: str) -> str:
        """Notion URL에서 데이터 추출 및 저장"""
        print(f"🚀 Notion 데이터 추출 시작")
        print(f"📝 URL: {notion_url}")
        print("=" * 60)
        
        try:
            # 1. 페이지 ID 추출
            page_id = self.extract_page_id_from_url(notion_url)
            
            # 2. Notion 콘텐츠 가져오기
            notion_data = self.fetch_notion_content_direct(page_id)
            
            if not notion_data:
                print("❌ Notion 데이터를 가져올 수 없습니다.")
                print("💡 샘플 데이터를 생성합니다...")
                return self.create_sample_data()
            
            # 3. 파일로 저장
            filename = self.save_notion_data(notion_data, notion_url)
            
            if filename:
                print(f"\n🎉 성공적으로 완료되었습니다!")
                print(f"📁 저장된 파일: {filename}")
                return filename
            else:
                print("❌ 파일 저장에 실패했습니다.")
                return None
                
        except Exception as e:
            print(f"❌ 추출 과정에서 오류 발생: {e}")
            print("💡 샘플 데이터를 생성합니다...")
            return self.create_sample_data()

def main():
    """메인 함수"""
    # 테스트할 Notion URL
    test_url = "https://www.notion.so/exaone-note-2771e9a4b5fb803dbca8f9d6af48b7ce?source=copy_link"
    
    try:
        extractor = NotionDataExtractor()
        
        # 데이터 추출 및 저장
        filename = extractor.extract_from_url(test_url)
        
        if filename:
            print(f"\n✅ 처리 완료!")
            print(f"📁 생성된 파일: {filename}")
            print(f"💡 이 파일을 샘플 데이터로 사용할 수 있습니다.")
        else:
            print("❌ 처리 실패")
        
    except Exception as e:
        print(f"❌ 실행 중 오류: {e}")

if __name__ == "__main__":
    main()