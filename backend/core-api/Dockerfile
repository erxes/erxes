# Optimized multi-stage Dockerfile for core-api service
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy root manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json nx.json ./

# Copy service-specific package.json files
COPY backend/core-api/package.json backend/core-api/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/

# Install pnpm and all dependencies (needed for build)
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY backend/core-api backend/core-api
COPY backend/erxes-api-shared backend/erxes-api-shared

# Build the service
WORKDIR /app/backend/core-api
ENV NX_DAEMON=false
RUN npx nx build:packageJson core-api
RUN npx nx build core-api

# Production stage - optimized for size
FROM node:22-alpine AS runtime
WORKDIR /app

# Copy built application
COPY --from=build /app/backend/core-api/dist /app/backend/core-api/dist
COPY --from=build /app/backend/erxes-api-shared /app/backend/erxes-api-shared

# Copy only production dependencies
COPY --from=build /app/backend/core-api/package.json /app/backend/core-api/
COPY --from=build /app/backend/erxes-api-shared/package.json /app/backend/erxes-api-shared/

# Install pnpm and production dependencies only
RUN npm install -g pnpm
WORKDIR /app/backend/core-api/dist
RUN pnpm install --prod --frozen-lockfile

# Environment & security
ENV NODE_ENV=production
USER 1000

# Start the application
CMD ["node", "src/main.js"]
