# Node.js 18 Alpine 이미지 사용 (경량화)
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 모든 의존성 설치 (빌드에 필요한 dev dependencies 포함)
RUN npm ci

# 애플리케이션 소스 복사
COPY . .

# 환경변수를 빌드 시점에 설정
ENV VITE_API_URL=http://10.4.45.130:3001

# 프로덕션 빌드 생성
RUN npm run build

# 실행 스테이지
FROM node:18-alpine

WORKDIR /app

# 백엔드 의존성을 위한 package.json 복사
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# 서버 파일 복사
COPY --from=builder /app/server ./server

# 빌드된 프론트엔드 파일 복사
COPY --from=builder /app/dist ./dist

# 포트 노출 (3000: 프론트엔드, 3001: API)
EXPOSE 3000 3001

# 시작 스크립트 생성
RUN echo '#!/bin/sh' > start.sh && \
    echo 'node server/api.js &' >> start.sh && \
    echo 'npx serve -s dist -l 3000' >> start.sh && \
    chmod +x start.sh

# 프론트엔드와 백엔드 동시 실행
CMD ["./start.sh"]