# Base image
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# Dependencies (production only)
FROM base AS deps
# Copy root manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json nx.json ./
# Copy only the package.json files for selective deps resolution
COPY backend/plugins/sales_api/package.json backend/plugins/sales_api/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Runtime image
FROM base AS runtime
WORKDIR /app

# Copy built dist from CI (nx build already ran in workflow)
COPY backend/plugins/sales_api ./backend/plugins/sales_api
COPY backend/erxes-api-shared ./backend/erxes-api-shared

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/plugins/sales_api/node_modules ./backend/plugins/sales_api/node_modules
COPY --from=deps /app/backend/erxes-api-shared/node_modules ./backend/erxes-api-shared/node_modules

# Environment & security
ENV NODE_ENV=production
USER 1000

# Run app
CMD ["node", "backend/plugins/sales_api/dist/src/main.js"]