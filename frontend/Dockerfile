# ─────────────────────────────────────────────────────────
# Stage 1: Build
# node:20-alpine으로 React 앱 빌드
#
# 교육적 관점 (Docker Best Practice):
# package*.json 먼저 COPY 후 npm ci → 소스 변경 시에도
# 의존성 레이어가 캐시되어 재빌드 속도가 크게 향상된다.
# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성만 먼저 복사 (레이어 캐시 최적화)
# build context가 루트(.)이므로 frontend/ 경로 명시
COPY frontend/package*.json ./
RUN npm ci

# 소스 복사 및 프로덕션 빌드 (dist/ 생성)
COPY frontend/ .
RUN npm run build

# ─────────────────────────────────────────────────────────
# Stage 2: Serve
# nginx:alpine으로 정적 파일 서빙
#
# node_modules (~300MB)가 최종 이미지에 포함되지 않음 → 이미지 경량화
# ─────────────────────────────────────────────────────────
FROM nginx:alpine

# 빌드 산출물만 복사 (node_modules 제외)
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA 라우팅 + /api 프록시 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
