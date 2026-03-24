# ═══════════════════════════════════════════════════════════
# Stage 1: Build TypeScript source
# Needs devDeps (nx, tsc) — this stage is fully discarded
# ═══════════════════════════════════════════════════════════
FROM --platform=linux/amd64 node:22-bookworm-slim AS builder
WORKDIR /app
RUN npm install -g pnpm@9

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
# Stage 2: Apollo tools + flat production node_modules
# Rover only runs here (build-time) — NOT included in runtime
# ═══════════════════════════════════════════════════════════
FROM --platform=linux/amd64 node:22-bookworm-slim AS deployer
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@9

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/gateway/package.json backend/gateway/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/

# --shamefully-hoist: all deps as real directories (no .pnpm virtual store)
RUN pnpm install --prod --shamefully-hoist \
    && find node_modules -type f \( \
         -name "*.d.ts" -o -name "*.map" -o -name "*.md" \
         -o -name "LICENSE*" -o -name "LICENCE*" \
         -o -name "CHANGELOG*" -o -name "README*" \
         -o -name "CONTRIBUTING*" -o -name "AUTHORS*" \
         -o -name ".npmignore" -o -name ".eslintrc*" -o -name "Makefile" \
       \) -delete \
    && find node_modules -mindepth 2 -maxdepth 3 -type d \( \
         -name "test" -o -name "tests" -o -name "__tests__" -o -name "spec" \
         -o -name "docs" -o -name "doc" -o -name "examples" -o -name "example" \
         -o -name ".github" -o -name "coverage" \
       \) -prune -exec rm -rf {} \; 2>/dev/null || true

# Run rover supergraph compose (build-time only — Rover not needed at runtime)
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm add -g @apollo/rover@0.22.0 \
    && rover supergraph compose \
         --config /app/backend/gateway/dist/src/apollo-router/dummy/supergraph.yaml \
         --elv2-license=accept \
    && pnpm remove -g @apollo/rover \
    && pnpm store prune

# Download Apollo Router binary (needed at runtime — started as subprocess)
RUN mkdir -p /app/backend/gateway/dist/src/apollo-router/temp \
    && cd /app/backend/gateway/dist/src/apollo-router/temp \
    && curl -sSL https://router.apollo.dev/download/nix/v1.59.2 | sh

# ═══════════════════════════════════════════════════════════
# Stage 3: Minimal runtime
# No pnpm, no Rover, no source files, no devDeps, no frontend
# ═══════════════════════════════════════════════════════════
FROM --platform=linux/amd64 node:22-bookworm-slim
WORKDIR /app

# All prod deps as real directories
COPY --from=deployer /app/node_modules ./node_modules

# Replace erxes-api-shared workspace symlink with actual built package
RUN rm -rf ./node_modules/erxes-api-shared
COPY backend/erxes-api-shared/dist ./node_modules/erxes-api-shared/dist
COPY backend/erxes-api-shared/utils ./node_modules/erxes-api-shared/utils
COPY backend/erxes-api-shared/core-types ./node_modules/erxes-api-shared/core-types
COPY backend/erxes-api-shared/core-modules ./node_modules/erxes-api-shared/core-modules
COPY backend/erxes-api-shared/package.json ./node_modules/erxes-api-shared/

# Compiled gateway dist (includes apollo-router configs + Router binary)
COPY --from=deployer /app/backend/gateway/dist ./dist

ENV NODE_ENV=production

WORKDIR /app/dist
CMD ["node", "src/main.js"]
