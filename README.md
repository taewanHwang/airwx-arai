# ARAI (Always Ready, Always Informed)

## 프로젝트 소개

ARAI는 업무 컨텍스트를 효과적으로 관리하고 검색할 수 있는 React 기반 웹 애플리케이션입니다. Notion, 이메일, Teams 등 다양한 소스의 링크와 정보를 한 곳에서 체계적으로 관리할 수 있도록 도와줍니다.

### 주요 기능

- **링크 처리**: Notion, 이메일, Teams 링크를 입력하여 컨텍스트 자동 추출
- **캘린더 뷰**: 프로젝트별 색상 코딩이 적용된 월별 일정 관리
- **리스트 뷰**: 프로젝트별 필터링과 정렬이 가능한 테이블 형태의 컨텍스트 목록
- **AI 챗봇**: 한국어로 대화하며 잃어버린 컨텍스트를 찾을 수 있는 대화형 인터페이스
- **프로젝트 관리**: 다중 프로젝트 지원 및 색상 기반 구분

## 기술 스택

- **프레임워크**: React 18 + TypeScript
- **빌드 도구**: Vite (SWC 컴파일러)
- **UI 라이브러리**: shadcn/ui (Radix UI 기반)
- **스타일링**: Tailwind CSS + tailwindcss-animate
- **라우팅**: React Router v6
- **상태 관리**: TanStack Query (React Query)
- **폼 처리**: React Hook Form + Zod

## 프로젝트 구조

```
src/
├── components/           # 재사용 가능한 컴포넌트
│   ├── ui/              # shadcn/ui 컴포넌트 (50개 이상)
│   ├── CalendarView.tsx # 캘린더 뷰 컴포넌트
│   ├── ChatbotPanel.tsx # AI 챗봇 패널
│   └── ListView.tsx     # 리스트 뷰 컴포넌트
├── pages/               # 라우트 페이지 컴포넌트
│   ├── Index.tsx        # 메인 랜딩 페이지
│   ├── Dashboard.tsx    # 대시보드 페이지
│   └── NotFound.tsx     # 404 페이지
├── hooks/               # 커스텀 React 훅
├── lib/                 # 유틸리티 함수
├── types/               # TypeScript 타입 정의
└── data/                # 목업 데이터
```

## 개발 환경 설정

### 필수 요구사항

- Node.js 18+ & npm ([nvm으로 설치](https://github.com/nvm-sh/nvm#installing-and-updating))
- Docker & Docker Compose (프로덕션 배포용)
- Python 3.8+ (테스트 스크립트용, 선택사항)

### 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가:

```bash
# Notion API Configuration
NOTION_API_KEY=your_notion_api_key_here
NOTION_VERSION=2022-06-28

# Exaone LLM API Configuration
EXAONE_API_KEY=your_exaone_api_key_here
EXAONE_API_URL=https://api.lgresearch.ai

# Optional: Other LLM APIs
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone <repository-url>
cd airwx-arai

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행 (포트 8080)
npm run dev

# 4. 프로덕션 빌드
npm run build

# 5. 빌드된 앱 미리보기
npm run preview
```

### 개발 명령어

- `npm run dev` - 개발 서버 실행 (http://localhost:8080)
- `npm run build` - 프로덕션 빌드 생성
- `npm run lint` - ESLint 검사 실행
- `npm run preview` - 빌드된 앱 로컬 미리보기

## 배포

### Docker를 사용한 전체 시스템 배포

ARAI는 프론트엔드(포트 3000)와 백엔드 API(포트 3001)가 함께 실행되는 통합 시스템입니다.

#### 🚀 빠른 시작 (Docker Compose 권장)

```bash
# 1. 환경 변수 파일 확인 (.env 파일이 있어야 함)
cat .env

# 2. Docker Compose로 실행 (빌드 + 실행)
docker-compose up -d --build

# 3. 서비스 확인
# - 프론트엔드: http://localhost:3000
# - 백엔드 API: http://localhost:3001/api/health
```

#### 🔄 재시작 가이드

```bash
# 1. 기존 컨테이너 중지 및 제거
docker-compose down

# 2. 볼륨 데이터 유지하며 재시작
docker-compose up -d --build

# 3. 볼륨 데이터까지 완전 초기화 후 재시작 (주의!)
docker-compose down -v
docker-compose up -d --build
```

#### 수동 실행 (Docker run 사용)

```bash
# 1. Docker 이미지 빌드
docker build -t arai-app .

# 2. 컨테이너 실행 (환경변수 파일 포함, 두 포트 모두 매핑)
docker run -d \
  -p 3000:3000 \
  -p 3001:3001 \
  --name arai-container \
  --env-file .env \
  -v arai-data:/app/data \
  arai-app

# 3. 컨테이너 상태 확인
docker ps | grep arai-container
docker logs -f arai-container

# 4. 컨테이너 재시작
docker restart arai-container

# 5. 컨테이너 중지 및 제거
docker stop arai-container
docker rm arai-container
```

#### 🔍 문제 해결

```bash
# 로그 확인
docker logs -f arai-container

# API 서버 상태 확인
curl http://localhost:3001/api/health

# 프로세스 확인
docker exec arai-container ps aux | grep node

# 데이터베이스 파일 확인
docker exec arai-container ls -la /app/data/

# 환경 변수 확인
docker exec arai-container env | grep -E 'NOTION|EXAONE'
```

#### 📊 데이터 영속성

SQLite 데이터베이스는 Docker 볼륨 `arai-data`에 저장되어 컨테이너 재시작 시에도 유지됩니다:

```bash
# 볼륨 확인
docker volume ls | grep arai

# 볼륨 상세 정보
docker volume inspect arai-data

# 데이터 백업 (호스트로 복사)
docker cp arai-container:/app/data/arai.db ./backup-arai.db
```

#### 베타 테스터를 위한 다중 컨테이너 배포

여러 개의 독립적인 컨테이너를 다른 포트로 실행:

```bash
# 베타 테스터 1 (포트 3001)
docker run -d -p 3001:3000 --name arai-beta1 arai-app

# 베타 테스터 2 (포트 3002)
docker run -d -p 3002:3000 --name arai-beta2 arai-app

# 베타 테스터 3 (포트 3003)
docker run -d -p 3003:3000 --name arai-beta3 arai-app

# ... 최대 10개까지 포트를 변경하여 실행
```

또는 다중 컨테이너 스크립트 사용:

```bash
# deploy-beta.sh 스크립트 실행 (10개 컨테이너 자동 배포)
#!/bin/bash
for i in {1..10}; do
  port=$((3000 + i))
  docker run -d -p ${port}:3000 --name arai-beta${i} arai-app
  echo "베타 테스터 ${i} 컨테이너 시작 (포트: ${port})"
done
```

### Lovable을 통한 배포

1. [Lovable 프로젝트](https://lovable.dev/projects/d1ecdc9e-e497-48a1-b83d-e36fef5087f9) 접속
2. Share → Publish 클릭
3. 자동으로 배포 완료

### 커스텀 도메인 연결

1. Project > Settings > Domains 메뉴 이동
2. "Connect Domain" 클릭
3. 도메인 설정 안내에 따라 진행

자세한 내용: [커스텀 도메인 설정 문서](https://docs.lovable.dev/features/custom-domain#custom-domain)

### 수동 배포

빌드된 정적 파일을 원하는 호스팅 서비스에 배포:

```bash
# 빌드 생성
npm run build

# dist 폴더의 내용을 호스팅 서비스에 업로드
# 예: Vercel, Netlify, GitHub Pages 등
```

## 주요 파일 설명

### 프론트엔드
- `App.tsx` - 애플리케이션 라우팅 및 프로바이더 설정
- `vite.config.ts` - Vite 빌드 설정 (포트 8080)
- `tsconfig.json` - TypeScript 설정 (경로 별칭 `@/` 포함)
- `src/services/notion-api.ts` - Notion API 클라이언트
- `src/services/metadata-api.ts` - 메타데이터 추출 API 클라이언트
- `src/services/context-api.ts` - 컨텍스트 관리 API 클라이언트

### 백엔드
- `server/api.js` - Express.js 기반 백엔드 서버
- `server/database.js` - SQLite 데이터베이스 관리
- `data/arai.db` - SQLite 데이터베이스 파일 (자동 생성)

### 설정 및 문서
- `.env` - 환경 변수 설정 (API 키)
- `docker-compose.yml` - Docker Compose 설정
- `Dockerfile` - Docker 이미지 빌드 설정
- `CLAUDE.md` - Claude AI 코드 어시스턴트용 가이드라인
- `todo.md` - 프로젝트 개발 진행 상황

## 주요 기능 상태

### ✅ 구현 완료
- **Notion API 연동**: URL에서 페이지 컨텐츠 추출
- **Exaone AI 연동**: LLM을 통한 메타데이터 자동 추출
- **SQLite 데이터베이스**: 컨텍스트 저장 및 관리
- **백엔드 API 서버**: Express.js 기반 RESTful API
- **Docker 배포 환경**: 컨테이너 기반 배포
- **데이터 영속성**: Docker 볼륨을 통한 DB 유지

### 🚧 개발 중
- **대시보드 페이지**: 저장된 컨텍스트 목록 표시
- **검색 기능**: 컨텍스트 검색 및 필터링
- **AI 챗봇**: 컨텍스트 기반 질의응답

### ⏳ 계획 중
- **사용자 인증**: 다중 사용자 지원
- **팀 협업 기능**: 컨텍스트 공유
- **더 많은 소스 지원**: 이메일, Teams, Slack 등

## 라이선스

이 프로젝트는 Lovable.dev를 통해 생성되었습니다.

## 문의 및 지원

프로젝트 관련 문의사항은 이슈 트래커를 통해 등록해주세요.