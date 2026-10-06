# Base image for building
FROM --platform=linux/amd64 node:22-bookworm AS build

WORKDIR /app

# Copy root files
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./tsconfig.base.json ./nx.json ./jest.preset.js /app/

# Copy service-specific package.json files
COPY ./backend/gateway/package.json /app/backend/gateway/

# Install pnpm and dependencies
RUN npm install -g pnpm@9 \
    && pnpm install

# Copy source files
COPY ./backend/gateway /app/backend/gateway

WORKDIR /app/backend/gateway

# Disable Nx daemon (not needed in CI/builds)
ENV NX_DAEMON=false

# Build project
RUN npx nx build:packageJson gateway \
    && npx nx build gateway

# Production dependencies only
FROM --platform=linux/amd64 node:22-bookworm AS prod-deps

WORKDIR /app

COPY ./pnpm-lock.yaml /app/
COPY ./backend/gateway/package.json /app/backend/gateway/

RUN node -e "\
const fs = require('fs'); \
const service = require('./backend/gateway/package.json'); \
const dependencies = { \
  ...(service.dependencies || {}), \
}; \
fs.writeFileSync( \
  'package.json', \
  JSON.stringify( \
    { name: 'gateway-runtime-deps', version: '1.0.0', private: true, dependencies }, \
    null, \
    2, \
  ), \
); \
" \
    && npm install -g pnpm@9 \
    && pnpm install --prod --shamefully-hoist --no-frozen-lockfile

# Final image
FROM --platform=linux/amd64 node:22-bookworm AS gateway

WORKDIR /app

# Install required packages
RUN apt-get update \
    && apt-get install -y curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy production dependencies and built app only
COPY --chown=root:root --chmod=0555 --from=prod-deps /app/node_modules ./node_modules

COPY --chown=root:root --chmod=0555 --from=build /app/backend/gateway/dist ./backend/gateway/dist

# Install pnpm
RUN npm install -g pnpm@9

# Set PNPM env
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install Rover CLI for composing supergraph
RUN pnpm add -g @apollo/rover@0.22.0 \
    && pnpm cache clean \
    && rover supergraph compose \
      --config /app/backend/gateway/dist/src/apollo-router/dummy/supergraph.yaml \
      --elv2-license=accept \
    && mkdir -p /app/backend/gateway/dist/src/apollo-router/temp \
    && cd /app/backend/gateway/dist/src/apollo-router/temp \
    && export VERSION=v1.59.2 \
    && curl -sSL https://router.apollo.dev/download/nix/v1.59.2 | sh

WORKDIR /app/backend/gateway/dist

ENV NODE_ENV=production

# Start app
CMD ["node", "src/main.js"]
