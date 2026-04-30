# Base image for building
FROM --platform=linux/amd64 node:22-bookworm AS build

WORKDIR /app

# Copy root files
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./tsconfig.base.json ./nx.json /app/

# Copy service-specific package.json files
COPY ./backend/gateway/package.json /app/backend/gateway/
COPY ./backend/erxes-api-shared/package.json /app/backend/erxes-api-shared/

# Install pnpm and dependencies
RUN npm install -g pnpm \
    && pnpm install

# Copy source files
COPY ./backend/gateway /app/backend/gateway
COPY ./backend/erxes-api-shared /app/backend/erxes-api-shared

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
COPY ./backend/erxes-api-shared/package.json /app/backend/erxes-api-shared/

RUN node -e "\
const fs = require('fs'); \
const shared = require('./backend/erxes-api-shared/package.json'); \
const service = require('./backend/gateway/package.json'); \
const dependencies = { \
  ...(shared.dependencies || {}), \
  ...(service.dependencies || {}), \
}; \
delete dependencies['erxes-api-shared']; \
fs.writeFileSync( \
  'package.json', \
  JSON.stringify( \
    { name: 'gateway-runtime-deps', version: '1.0.0', private: true, dependencies }, \
    null, \
    2, \
  ), \
); \
" \
    && npm install -g pnpm \
    && pnpm install --prod --shamefully-hoist --no-frozen-lockfile

# Final image
FROM --platform=linux/amd64 node:22-bookworm AS gateway

WORKDIR /app

# Install required packages
RUN apt-get update \
    && apt-get install -y curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy production dependencies and built app only
COPY --chown=1000:1000 --chmod=0555 --from=prod-deps /app/node_modules ./node_modules
RUN rm -rf ./node_modules/erxes-api-shared
COPY --chown=1000:1000 --chmod=0555 --from=build /app/backend/erxes-api-shared/dist ./node_modules/erxes-api-shared/dist
COPY --chown=1000:1000 --chmod=0555 --from=build /app/backend/erxes-api-shared/utils ./node_modules/erxes-api-shared/utils
COPY --chown=1000:1000 --chmod=0555 --from=build /app/backend/erxes-api-shared/core-types ./node_modules/erxes-api-shared/core-types
COPY --chown=1000:1000 --chmod=0555 --from=build /app/backend/erxes-api-shared/core-modules ./node_modules/erxes-api-shared/core-modules
COPY --chown=1000:1000 --chmod=0444 --from=build /app/backend/erxes-api-shared/package.json ./node_modules/erxes-api-shared/
COPY --chown=1000:1000 --chmod=0555 --from=build /app/backend/gateway/dist ./backend/gateway/dist

# Install pnpm
RUN npm install -g pnpm

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
