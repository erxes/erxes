# Base image
FROM node:22-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Fix pnpm global bin issue
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# Dependencies (production only)
FROM base AS deps
# Copy root manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json nx.json ./
# Copy only the package.json files for selective deps resolution
COPY backend/gateway/package.json backend/gateway/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Runtime image
FROM base AS runtime
WORKDIR /app

# Copy built dist from CI (nx build already ran in workflow)
COPY backend/gateway ./backend/gateway
COPY backend/erxes-api-shared ./backend/erxes-api-shared

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/gateway/node_modules ./backend/gateway/node_modules
COPY --from=deps /app/backend/erxes-api-shared/node_modules ./backend/erxes-api-shared/node_modules

# ---- Apollo Router setup ----
RUN apk add --no-cache curl ca-certificates

# Install Rover CLI for supergraph composition
RUN pnpm add -g @apollo/rover@0.22.0 && pnpm cache clean

# Run a dummy composition (optional, can remove if CI already does this)
RUN rover supergraph compose \
    --config /app/backend/gateway/src/apollo-router/dummy/supergraph.yaml \
    --elv2-license=accept || true

# Create temp folder for Apollo Router binary
RUN mkdir -p /app/backend/gateway/dist/src/apollo-router/temp 

# Download Apollo Router binary
RUN cd /app/backend/gateway/dist/src/apollo-router/temp \
    && export VERSION=v1.59.2 \
    && curl -sSL https://router.apollo.dev/download/nix/$VERSION | sh

# ---- Environment & security ----
ENV NODE_ENV=production
USER 1000

# Run app
CMD ["node", "backend/gateway/dist/src/main.js"]
