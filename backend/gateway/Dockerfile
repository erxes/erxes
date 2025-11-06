# Base image for building
FROM node:22-alpine AS build

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy root files
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./tsconfig.base.json ./nx.json /app/

# Copy service-specific package.json files
COPY ./backend/gateway/package.json /app/backend/gateway/
COPY ./backend/erxes-api-shared/package.json /app/backend/erxes-api-shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY ./backend/gateway /app/backend/gateway
COPY ./backend/erxes-api-shared /app/backend/erxes-api-shared

WORKDIR /app/backend/gateway

# Disable Nx daemon (not needed in CI/builds)
ENV NX_DAEMON=false

# Build project
RUN npx nx build:packageJson gateway
RUN npx nx build gateway

# Production dependencies stage
FROM node:22-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm

# Copy root manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json nx.json ./
COPY backend/gateway/package.json backend/gateway/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Final runtime image
FROM node:22-alpine AS runtime

WORKDIR /app

# Install required packages for runtime
RUN apk add --no-cache curl ca-certificates

# Copy built app from build stage
COPY --from=build /app/backend/gateway/dist /app/backend/gateway/dist
COPY --from=build /app/backend/erxes-api-shared /app/backend/erxes-api-shared

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/backend/gateway/node_modules /app/backend/gateway/node_modules
COPY --from=deps /app/backend/erxes-api-shared/node_modules /app/backend/erxes-api-shared/node_modules

# Install pnpm for runtime
RUN npm install -g pnpm

# Set PNPM env
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install Rover CLI for composing supergraph
RUN pnpm add -g @apollo/rover@0.22.0 \
    && pnpm cache clean \
    && rover supergraph compose --config /app/backend/gateway/src/apollo-router/dummy/supergraph.yaml --elv2-license=accept

# Create Apollo Router folder
RUN mkdir -p /app/backend/gateway/dist/src/apollo-router/temp 

# Download Apollo Router binary safely
RUN cd /app/backend/gateway/dist/src/apollo-router/temp \
    && export VERSION=v1.59.2 \
    && curl -sSL https://router.apollo.dev/download/nix/v1.59.2 | sh

WORKDIR /app/backend/gateway/dist

# Environment & security
ENV NODE_ENV=production
USER 1000

# Start app
CMD ["node", "src/main.js"]