import { readFileSync } from 'fs';
import { join } from 'path';

// 프롬프트 파일을 동적으로 로드하는 유틸리티
// 브라우저 환경에서는 fetch를 사용하고, Node.js 환경에서는 fs를 사용

export class PromptLoader {
  private static prompts: Map<string, string> = new Map();
  private static basePath = '/src/prompts/';

  // 프롬프트 타입 정의
  static readonly PROMPT_TYPES = {
    SYSTEM: 'system-prompt.txt',
    METADATA_EXTRACTION: 'metadata-extraction.txt',
    SUMMARY_GENERATION: 'summary-generation.txt',
  } as const;

  // 브라우저 환경에서 프롬프트 로드
  private static async loadPromptInBrowser(fileName: string): Promise<string> {
    try {
      const response = await fetch(`${this.basePath}${fileName}`);
      if (!response.ok) {
        throw new Error(`Failed to load prompt: ${fileName}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Error loading prompt ${fileName}:`, error);
      return this.getDefaultPrompt(fileName);
    }
  }

  // 프롬프트 가져오기 (캐싱 포함)
  static async getPrompt(promptType: string): Promise<string> {
    // 캐시 확인
    if (this.prompts.has(promptType)) {
      return this.prompts.get(promptType)!;
    }

    // 브라우저 환경에서 로드
    const prompt = await this.loadPromptInBrowser(promptType);
    
    // 캐시에 저장
    this.prompts.set(promptType, prompt);
    
    return prompt;
  }

  // 기본 프롬프트 (파일을 로드할 수 없는 경우)
  private static getDefaultPrompt(fileName: string): string {
    const defaults: Record<string, string> = {
      'system-prompt.txt': `당신은 업무 문서 분석 전문가입니다. 문서 내용을 분석하여 핵심 정보를 추출하고 체계적으로 정리합니다.`,
      
      'metadata-extraction.txt': `문서에서 다음 정보를 추출하여 JSON으로 반환하세요:
- projectName: 프로젝트명
- summary: 2-3문장 요약
- topics: 주요 주제 (최대 5개)
- nextActions: 다음 액션
- dateRange: 날짜 범위
- stakeholders: 관련자`,
      
      'summary-generation.txt': `문서를 분석하여 다음 구조로 요약하세요:
- 한 줄 요약
- 주요 내용
- 일정 및 마일스톤
- 주요 이슈
- 다음 단계
- 추가 고려사항`,
    };

    return defaults[fileName] || '문서를 분석하여 요약해주세요.';
  }

  // 모든 프롬프트 프리로드 (선택적)
  static async preloadAllPrompts(): Promise<void> {
    const loadPromises = Object.values(this.PROMPT_TYPES).map(type => 
      this.getPrompt(type)
    );
    await Promise.all(loadPromises);
    console.log('✅ 모든 프롬프트 로드 완료');
  }

  // 프롬프트에 변수 삽입
  static formatPrompt(template: string, variables: Record<string, string>): string {
    let formatted = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      formatted = formatted.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return formatted;
  }

  // 캐시 초기화
  static clearCache(): void {
    this.prompts.clear();
  }
}

// 프롬프트 관련 타입 정의
export interface MetadataExtractionResult {
  projectName: string;
  summary: string;
  topics: string[];
  nextActions: string[];
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  stakeholders: string[];
}

export interface SummaryGenerationResult {
  oneLiner: string;
  mainPoints: string[];
  milestones: string[];
  issues: string[];
  nextSteps: string[];
  considerations: string;
}

// 하드코딩된 프롬프트 (백업용)
export const HARDCODED_PROMPTS = {
  SYSTEM: `당신은 업무 문서 분석 전문가입니다. 사용자가 제공한 Notion 페이지 또는 문서 내용을 분석하여 핵심 정보를 추출하고 체계적으로 정리하는 역할을 합니다.

분석 시 다음 사항을 준수하세요:
1. 문서의 주요 목적과 맥락을 파악합니다
2. 프로젝트명, 일정, 담당자 등 메타 정보를 추출합니다
3. 핵심 내용을 간결하게 요약합니다
4. 중요한 액션 아이템이나 다음 단계를 식별합니다
5. 기술적인 내용은 정확성을 유지하면서 이해하기 쉽게 설명합니다

응답은 한국어로 작성하며, 전문적이면서도 명확한 톤을 유지합니다.`,

  METADATA_EXTRACTION: `다음 문서에서 메타데이터를 추출하여 JSON 형식으로 반환해주세요.

추출할 정보:
1. projectName: 문서와 관련된 프로젝트명 (없으면 "일반")
2. summary: 문서 내용을 2-3문장으로 요약
3. topics: 주요 주제나 키워드 (최대 5개)
4. nextActions: 다음에 해야 할 작업이나 액션 아이템 (있는 경우)
5. dateRange: 문서에서 언급된 날짜 범위 (시작일과 종료일)
6. stakeholders: 언급된 담당자나 관련자 (있는 경우)

JSON 응답 형식:
{
  "projectName": "프로젝트명",
  "summary": "요약 내용",
  "topics": ["주제1", "주제2", "주제3"],
  "nextActions": ["액션1", "액션2"],
  "dateRange": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "stakeholders": ["담당자1", "담당자2"]
}`,

  SUMMARY_GENERATION: `다음 문서를 분석하여 구조화된 요약을 작성해주세요.

요약 구조:

## 📋 한 줄 요약
[문서의 핵심을 한 문장으로 요약]

## 🎯 주요 내용
- [핵심 포인트 1]
- [핵심 포인트 2]
- [핵심 포인트 3]

## 📅 일정 및 마일스톤
- [중요 날짜나 데드라인]

## ⚡ 주요 이슈 및 리스크
- [확인된 문제점이나 위험 요소]

## ✅ 다음 단계
- [즉시 처리해야 할 사항]
- [후속 조치 필요 사항]

## 💡 추가 고려사항
[기타 중요한 정보나 제안사항]`,
};