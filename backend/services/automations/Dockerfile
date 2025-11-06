# Optimized multi-stage Dockerfile for automations service
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy root manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json nx.json ./

# Copy service-specific package.json files
COPY backend/services/automations/package.json backend/services/automations/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/

# Install pnpm and all dependencies (needed for build)
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY backend/services/automations backend/services/automations
COPY backend/erxes-api-shared backend/erxes-api-shared

# Build the service
WORKDIR /app/backend/services/automations
ENV NX_DAEMON=false
RUN npx nx build:packageJson automations-service
RUN npx nx build automations-service

# Production stage - optimized for size
FROM node:22-alpine AS runtime
WORKDIR /app

# Copy built application
COPY --from=build /app/backend/services/automations/dist /app/backend/services/automations/dist
COPY --from=build /app/backend/erxes-api-shared /app/backend/erxes-api-shared

# Copy only production dependencies
COPY --from=build /app/backend/services/automations/package.json /app/backend/services/automations/
COPY --from=build /app/backend/erxes-api-shared/package.json /app/backend/erxes-api-shared/

# Install pnpm and production dependencies only
RUN npm install -g pnpm
WORKDIR /app/backend/services/automations/dist
RUN pnpm install --prod --frozen-lockfile

# Environment & security
ENV NODE_ENV=production
USER 1000

# Start the application
CMD ["node", "src/main.js"]
