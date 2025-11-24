# Base image for building
FROM --platform=linux/amd64 node:22-bookworm AS build

WORKDIR /app

# Copy root files
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./tsconfig.base.json ./nx.json /app/

# Copy service-specific package.json files
COPY ./backend/gateway/package.json /app/backend/gateway/
COPY ./backend/erxes-api-shared/package.json /app/backend/erxes-api-shared/

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source files
COPY ./backend/gateway /app/backend/gateway
COPY ./backend/erxes-api-shared /app/backend/erxes-api-shared

WORKDIR /app/backend/gateway

# Disable Nx daemon (not needed in CI/builds)
ENV NX_DAEMON=false

# Build project
RUN npx nx build:packageJson gateway
RUN npx nx build gateway

# Final image
FROM --platform=linux/amd64 node:22-bookworm AS gateway

WORKDIR /app

# Install required packages
RUN apt-get update && apt-get install -y curl ca-certificates

# Copy built app from build stage
COPY --chown=1000:1000 --from=build /app /app

# Install pnpm
RUN npm install -g pnpm

# Set PNPM env
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install Rover CLI for composing supergraph
RUN apt-get update -y \
    && apt-get install -y curl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && pnpm add -g @apollo/rover@0.22.0 \
    && pnpm cache clean \
    && rover supergraph compose --config /app/backend/gateway/src/apollo-router/dummy/supergraph.yaml --elv2-license=accept

# Create Apollo Router folder
RUN mkdir -p /app/backend/gateway/dist/src/apollo-router/temp 

# Download Apollo Router binary safely
RUN cd /app/backend/gateway/dist/src/apollo-router/temp \
    && export VERSION=v1.59.2 \
    && curl -sSL https://router.apollo.dev/download/nix/v1.59.2 | sh

WORKDIR /app/backend/gateway/dist

ENV NODE_ENV=production

# Start app
CMD ["node", "src/main.js"]