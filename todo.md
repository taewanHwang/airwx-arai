# ARAI 개발 TODO 리스트

## ✅ 완료된 작업

### Docker 컨테이너화
- [x] Dockerfile 작성 (Node.js Alpine 기반)
- [x] docker-compose.yml 작성 (포트 설정 가능)
- [x] .dockerignore 파일 생성
- [x] deploy-beta.sh 스크립트 작성 (10개 베타 컨테이너 관리)
- [x] README.md에 Docker 배포 방법 문서화

## 🚀 진행 예정 작업

### Flow1: URL Input (Notion 연동)

#### 1단계: Notion API 설정
- [ ] Notion API 의존성 설치 (`@notionhq/client`)
- [ ] 환경 변수 설정 구조 생성 (.env.example)
  - NOTION_API_KEY
  - NOTION_VERSION
- [ ] Notion API 클라이언트 초기화 모듈 생성

#### 2단계: 인증 처리
- [ ] Notion OAuth 2.0 인증 플로우 구현
  - [ ] 인증 URL 생성
  - [ ] 콜백 처리
  - [ ] 액세스 토큰 저장
- [ ] API 키 기반 인증 대체 방안 구현

#### 3단계: URL 처리 및 컨텐츠 가져오기
- [ ] URL 유효성 검증 로직
  - [ ] Notion URL 패턴 검증 (page, database)
  - [ ] 페이지/데이터베이스 ID 추출
- [ ] Notion API 호출 서비스 구현
  - [ ] 페이지 컨텐츠 가져오기
  - [ ] 블록 컨텐츠 재귀적 파싱
  - [ ] 데이터베이스 항목 가져오기
- [ ] 에러 처리 (권한 없음, 페이지 없음 등)

#### 4단계: UI 연결
- [ ] Index.tsx 수정
  - [ ] URL 입력 폼 실제 구현
  - [ ] 제출 시 Notion API 호출
  - [ ] 로딩 상태 표시
  - [ ] 디버그 콘솔 출력 구현
- [ ] 가져온 컨텐츠 표시 컴포넌트

### Flow2: 데이터베이스 및 메타데이터 관리

#### 1단계: 시스템 프롬프트 관리
- [ ] `/prompts` 디렉토리 생성
- [ ] 시스템 프롬프트 파일 구조
  - [ ] `system-prompt.txt` (기본 시스템 프롬프트)
  - [ ] `metadata-extraction.txt` (메타데이터 추출용)
  - [ ] `summary-generation.txt` (요약 생성용)
- [ ] 프롬프트 로더 유틸리티 함수

#### 2단계: LLM 연동
- [ ] LLM API 클라이언트 설정 (OpenAI/Claude)
- [ ] 메타데이터 추출 서비스
  - [ ] 프로젝트명 추출
  - [ ] 요약 생성
  - [ ] 주요 주제 태깅
  - [ ] 다음 할 일 추출
- [ ] 응답 파싱 및 검증

#### 3단계: 데이터베이스 설계
- [ ] 데이터 스키마 정의
  ```typescript
  interface ContextEntry {
    id: string;
    projectName: string;
    createdAt: Date;
    submittedAt: Date;
    summary: string;
    originalUrl: string;
    notionContent: string;
    metadata: {
      topics: string[];
      nextActions: string[];
      aiSummary: string;
    };
  }
  ```
- [ ] 로컬 스토리지 기반 임시 DB 구현
- [ ] IndexedDB 마이그레이션 (추후)

#### 4단계: 데이터 영속성
- [ ] Context 저장 서비스
- [ ] Context 조회 서비스
- [ ] Context 업데이트 서비스
- [ ] Context 삭제 서비스

### Flow3: 챗봇 질의 (추후 구현)
- [ ] 컨텍스트 기반 검색
- [ ] 의미 기반 검색
- [ ] 대화 히스토리 관리

## 📋 추가 고려사항

### 성능 최적화
- [ ] Notion API 호출 캐싱
- [ ] 대용량 페이지 처리 (페이지네이션)
- [ ] 비동기 처리 최적화

### 보안
- [ ] API 키 안전한 관리
- [ ] CORS 설정
- [ ] Rate limiting 구현

### 사용자 경험
- [ ] 에러 메시지 한국어화
- [ ] 토스트 알림 개선
- [ ] 프로그레스 바 구현

## 🔄 진행 상태

현재 진행 중: **Flow1 - Notion API 연동 계획 수립**

다음 작업: Notion API 의존성 설치 및 기본 설정