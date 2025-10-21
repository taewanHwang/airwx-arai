# ARAI 개발 TODO 리스트

## ✅ 완료된 작업

### Docker 컨테이너화
- [x] Dockerfile 작성 (Node.js Alpine 기반)
- [x] docker-compose.yml 작성 (포트 설정 가능)
- [x] .dockerignore 파일 생성
- [x] deploy-beta.sh 스크립트 작성 (10개 베타 컨테이너 관리)
- [x] README.md에 Docker 배포 방법 문서화

### 백엔드 API 서버 구현
- [x] Express.js 기반 API 서버 구축 (`server/api.js`)
- [x] CORS 설정 및 미들웨어 구성
- [x] 클라이언트 로깅 엔드포인트 (`/api/logs`)
- [x] 헬스체크 엔드포인트 (`/api/health`)

### Notion API 연동 완료
- [x] Notion API 클라이언트 설정 (`@notionhq/client`)
- [x] 환경 변수 설정 (.env 지원)
  - NOTION_API_KEY
  - EXAONE_API_KEY, EXAONE_API_URL
- [x] URL 처리 및 페이지 ID 추출 (`/api/notion/extract-id`)
- [x] Notion 페이지 컨텐츠 가져오기 (`/api/notion/page`)
- [x] 블록 컨텐츠 텍스트 변환 (Rich Text 파싱)
- [x] 페이지네이션 처리 (대용량 페이지 지원)
- [x] 에러 처리 (권한 없음, 페이지 없음, Rate limit 등)

### Exaone API 연동 완료
- [x] Exaone Text Generation API 연동
- [x] 스트리밍 응답 처리 (Node.js 환경 대응)
- [x] 메타데이터 추출 엔드포인트 (`/api/metadata/extract`)
- [x] JSON 파싱 및 검증 (제목, 요약, 주제 추출)
- [x] 프롬프트 최적화 및 매개변수 튜닝

### 프론트엔드 UI 구현
- [x] Index.tsx 메타데이터 추출 기능 구현
- [x] Notion URL 입력 폼 및 유효성 검증
- [x] 로딩 상태 및 에러 처리 UI
- [x] AI 생성 메타데이터 표시 (제목, 요약, 주제 태그)
- [x] metadata-api.ts 서비스 클라이언트 구현

### 테스트 환경 구축
- [x] Python 테스트 스크립트 작성 (`tests/`)
  - `test_exaone_final.py` - Exaone API 단독 테스트
  - `notion_data_extractor.py` - Notion 데이터 추출 도구
- [x] 테스트 데이터 관리 (`tests/data/`)
- [x] 가상 환경 설정 및 requirements.txt
- [x] .gitignore 업데이트 (venv, 테스트 데이터 제외)

## 🚀 진행 예정 작업

### 다음 단계: 데이터 영속성 및 컨텍스트 관리

#### 1단계: 데이터베이스 설계 및 구현
- [ ] 컨텍스트 엔트리 스키마 정의
  ```typescript
  interface ContextEntry {
    id: string;
    projectName: string;
    originalUrl: string;
    extractedAt: Date;
    metadata: {
      title: string;
      summary: string;
      topics: string[];
    };
    notionContent: string;
    processingTime: number;
  }
  ```
- [ ] 로컬 스토리지 기반 데이터 저장 구현
- [ ] 컨텍스트 CRUD API 엔드포인트 추가
  - `/api/context/save` - 컨텍스트 저장
  - `/api/context/list` - 컨텍스트 목록 조회
  - `/api/context/get/:id` - 특정 컨텍스트 조회
  - `/api/context/delete/:id` - 컨텍스트 삭제

#### 2단계: 대시보드 페이지 구현
- [ ] 대시보드 레이아웃 설계
- [ ] 저장된 컨텍스트 목록 표시
- [ ] 컨텍스트 검색 및 필터링
- [ ] 컨텍스트 상세 보기 모달
- [ ] 컨텍스트 편집/삭제 기능

### 3단계: 챗봇 및 컨텍스트 질의 기능

#### AI 챗봇 구현
- [ ] 컨텍스트 기반 질의응답 시스템
  - [ ] 저장된 컨텍스트를 기반으로 한 지능형 검색
  - [ ] Exaone API를 활용한 컨텍스트 인식 대화
  - [ ] 관련 문서 및 정보 추천
- [ ] 챗봇 UI 컴포넌트 (`ChatbotPanel.tsx`)
  - [ ] 실시간 대화 인터페이스
  - [ ] 컨텍스트 참조 표시
  - [ ] 대화 히스토리 관리

#### 검색 및 필터링 고도화
- [ ] 의미 기반 검색 (Semantic Search)
- [ ] 태그 기반 필터링
- [ ] 날짜 범위 검색
- [ ] 전문 검색 (Full-text Search)

## 📋 기술적 개선사항

### 성능 최적화
- [ ] Notion API 응답 캐싱 구현
- [ ] 대용량 콘텐츠 청킹 및 배치 처리
- [ ] Exaone API 호출 최적화 (토큰 사용량 관리)
- [ ] 프론트엔드 코드 분할 및 레이지 로딩

### 보안 강화
- [x] API 키 환경변수 관리
- [x] CORS 설정 완료
- [ ] Rate limiting 구현 (Notion/Exaone API)
- [ ] 입력 데이터 검증 및 새니타이징
- [ ] 로그 보안 (민감정보 마스킹)

### 사용자 경험 개선
- [x] 한국어 에러 메시지
- [x] 로딩 상태 UI
- [ ] 토스트 알림 시스템 구현
- [ ] 프로그레스 바 (단계별 진행 표시)
- [ ] 오프라인 모드 지원
- [ ] 다크 모드 지원

### 모니터링 및 디버깅
- [x] 클라이언트/서버 로깅 시스템
- [ ] 성능 메트릭 수집
- [ ] 에러 트래킹 및 알림
- [ ] API 사용량 모니터링

## 🔄 현재 상태

**현재 완료된 MVP 기능:**
- ✅ Notion URL → AI 메타데이터 추출 파이프라인 완성
- ✅ Exaone API 연동 및 실시간 스트리밍 처리
- ✅ 기본 웹 UI 및 Docker 배포 환경

**다음 우선순위:**
1. **컨텍스트 저장 및 관리** - 추출한 메타데이터를 저장하고 관리하는 시스템
2. **대시보드 구현** - 저장된 컨텍스트들을 보기 좋게 표시하는 UI
3. **AI 챗봇 질의** - 저장된 컨텍스트를 바탕으로 한 지능형 질의응답

**핵심 MVP 달성률: 80%** 🎉