# Multi-stage Dockerfile template for backend services
# Usage: Replace backend/services/logs and logs-service with actual values

# Base image
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# Dependencies (production only)
FROM base AS deps
# Copy root manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json nx.json ./
# Copy only the package.json files for selective deps resolution
COPY backend/services/logs/package.json backend/services/logs/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Build stage
FROM base AS build
# Copy root manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json nx.json ./
# Copy service-specific package.json files
COPY backend/services/logs/package.json backend/services/logs/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/

# Install all dependencies for building
RUN pnpm install --frozen-lockfile

# Copy source files
COPY backend/services/logs backend/services/logs
COPY backend/erxes-api-shared backend/erxes-api-shared

WORKDIR /app/backend/services/logs

# Disable Nx daemon (not needed in CI/builds)
ENV NX_DAEMON=false

# Build project
RUN npx nx build:packageJson logs-service
RUN npx nx build logs-service

# Runtime image
FROM base AS runtime
WORKDIR /app

# Copy built dist from build stage
COPY --from=build /app/backend/services/logs/dist /app/backend/services/logs/dist
COPY --from=build /app/backend/erxes-api-shared /app/backend/erxes-api-shared

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/backend/services/logs/node_modules /app/backend/services/logs/node_modules
COPY --from=deps /app/backend/erxes-api-shared/node_modules /app/backend/erxes-api-shared/node_modules

# Environment & security
ENV NODE_ENV=production
USER 1000

# Run app
CMD ["node", "backend/services/logs/dist/src/main.js"]
