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

- Node.js & npm ([nvm으로 설치](https://github.com/nvm-sh/nvm#installing-and-updating))

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone <repository-url>
cd airwx-arai

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행 (포트 8081)
npm run dev

# 4. 프로덕션 빌드
npm run build

# 5. 빌드된 앱 미리보기
npm run preview
```

### 개발 명령어

- `npm run dev` - 개발 서버 실행 (http://localhost:8081)
- `npm run build` - 프로덕션 빌드 생성
- `npm run lint` - ESLint 검사 실행
- `npm run preview` - 빌드된 앱 로컬 미리보기

## 배포

### Docker를 사용한 배포

#### 단일 컨테이너 실행

```bash
# 1. Docker 이미지 빌드
docker build -t arai-app .

# 2. 컨테이너 실행 (포트 3000)
docker run -d -p 3000:3000 --name arai-container arai-app

# 3. 컨테이너 중지
docker stop arai-container

# 4. 컨테이너 삭제
docker rm arai-container
```

#### Docker Compose 사용

```bash
# 1. 컨테이너 빌드 및 실행
docker-compose up -d

# 2. 다른 포트로 실행 (예: 3001)
PORT=3001 docker-compose up -d

# 3. 컨테이너 중지
docker-compose down
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

- `App.tsx` - 애플리케이션 라우팅 및 프로바이더 설정
- `vite.config.ts` - Vite 빌드 설정 (포트 8081)
- `tsconfig.json` - TypeScript 설정 (경로 별칭 `@/` 포함)
- `CLAUDE.md` - Claude AI 코드 어시스턴트용 가이드라인
- `task.md` - 프로젝트 작업 계획 문서

## 현재 제한사항

- 백엔드 통합 없음 (모든 데이터는 목업)
- 실제 API 호출 없음 (컨텍스트 처리는 시뮬레이션)
- 챗봇 기능 제한 (사전 프로그래밍된 응답만 제공)
- 사용자 인증 없음
- 데이터 영속성 없음 (새로고침 시 초기화)

## 라이선스

이 프로젝트는 Lovable.dev를 통해 생성되었습니다.

## 문의 및 지원

프로젝트 관련 문의사항은 이슈 트래커를 통해 등록해주세요.