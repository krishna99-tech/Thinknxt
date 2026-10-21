# syntax=docker/dockerfile:1
# =========================================================================
# Stage 1: Dependencies Cache
# =========================================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install

# =========================================================================
# Stage 2: Builder
# =========================================================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Arguments for client-side environment variables and internal backend proxy
ARG INTERNAL_BACKEND_URL=http://thingsnxt-backend:8000
ARG NEXT_PUBLIC_API_BASE=/api
ARG NEXT_PUBLIC_WS_URL=/ws
ENV INTERNAL_BACKEND_URL=$INTERNAL_BACKEND_URL
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Ensure public folder exists for copy stage
RUN mkdir -p public

RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# =========================================================================
# Stage 3: Runner
# =========================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV INTERNAL_BACKEND_URL="http://thingsnxt-backend:8000"

# Non-root user for container security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone server output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3001/ || exit 1

STOPSIGNAL SIGTERM

CMD ["node", "server.js"]

