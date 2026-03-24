# ═══════════════════════════════════════════════════════════
# Stage 1: Build TypeScript source
# Needs devDeps (nx, tsc) — this stage is fully discarded
# ═══════════════════════════════════════════════════════════
FROM --platform=linux/amd64 node:22-bookworm-slim AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/gateway/package.json backend/gateway/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/
# Full install (devDeps needed for nx + tsc)
RUN pnpm install

# Copy only what's needed to compile
COPY backend/gateway backend/gateway
COPY backend/erxes-api-shared backend/erxes-api-shared

# Build: compiles TS → dist/, also runs copy-files.js which copies
# apollo-router/dummy/ and apollo-router/rhai/ into dist/
ENV NX_DAEMON=false
RUN npx nx build:packageJson gateway && npx nx build gateway

# ═══════════════════════════════════════════════════════════
# Stage 2: Apollo tools + isolated production deployment
# Rover only runs here (build-time) — NOT included in runtime
# ═══════════════════════════════════════════════════════════
FROM --platform=linux/amd64 node:22-bookworm-slim AS deployer
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm

# Minimal root — prevents installing frontend/build-tool deps
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
RUN echo '{"name":"erxes","version":"1.0.0","private":true}' > package.json
COPY backend/gateway/package.json backend/gateway/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/

# Copy compiled dist from builder (includes dummy/ and rhai/ copied by copy-files.js)
COPY --from=builder /app/backend/gateway/dist backend/gateway/dist
COPY backend/erxes-api-shared/dist backend/erxes-api-shared/dist
COPY backend/erxes-api-shared/utils backend/erxes-api-shared/utils
COPY backend/erxes-api-shared/core-types backend/erxes-api-shared/core-types
COPY backend/erxes-api-shared/core-modules backend/erxes-api-shared/core-modules

# Install only gateway's production deps (~25 from erxes-api-shared, not 159 from root)
RUN pnpm install --prod

# Run rover supergraph compose (build-time only — generates initial supergraph SDL)
# Rover is removed after use so it doesn't bloat the deployment
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm add -g @apollo/rover@0.22.0 \
    && rover supergraph compose \
         --config /app/backend/gateway/dist/src/apollo-router/dummy/supergraph.yaml \
         --elv2-license=accept \
    && pnpm remove -g @apollo/rover \
    && pnpm store prune

# Download Apollo Router binary into dist/ (needed at runtime — started as subprocess)
RUN mkdir -p /app/backend/gateway/dist/src/apollo-router/temp \
    && cd /app/backend/gateway/dist/src/apollo-router/temp \
    && curl -sSL https://router.apollo.dev/download/nix/v1.59.2 | sh

# Create isolated deployment:
# /app/release/ = dist/ + node_modules/ (only ~25 prod deps, erxes-api-shared bundled in)
# The Apollo Router binary in dist/src/apollo-router/temp/ is included automatically
RUN pnpm --filter=./backend/gateway deploy --prod /app/release

# ═══════════════════════════════════════════════════════════
# Stage 3: Minimal runtime
# No pnpm, no Rover, no source files, no devDeps, no frontend
# ═══════════════════════════════════════════════════════════
FROM --platform=linux/amd64 node:22-bookworm-slim
WORKDIR /app

COPY --from=deployer /app/release .

ENV NODE_ENV=production

WORKDIR /app/dist
CMD ["node", "src/main.js"]
