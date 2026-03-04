# ─────────────────────────────────────────────────────────
# Stage 1: Build
# TypeScript → JavaScript 컴파일 (dist/ 생성)
# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────
# Stage 2: Runtime
# 보안 강화: non-root 사용자(appuser)로 실행
#
# 교육적 관점 (Security Best Practice):
# root로 실행하면 컨테이너 탈출 시 호스트에도 root 권한이 생긴다.
# non-root 사용자 실행은 컨테이너 보안의 핵심 원칙이다.
# --omit=dev 로 devDependencies 제외 → 이미지 크기 최소화
# ─────────────────────────────────────────────────────────
FROM node:20-alpine

# non-root 그룹/사용자 생성
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm ci --omit=dev

# 빌드 산출물만 복사
COPY --from=builder /app/dist ./dist

# non-root 사용자로 전환
USER appuser

EXPOSE 3001

CMD ["node", "dist/server.js"]
