# Base image
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# Dependencies (production only)
FROM base AS deps
# Copy lockfile and package manifests
COPY pnpm-lock.yaml ./
# Copy only the package.json files for selective deps resolution
COPY backend/services/logs/package.json backend/services/logs/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/

# Install only production dependencies
RUN node -e "\
const fs = require('fs'); \
const shared = require('./backend/erxes-api-shared/package.json'); \
const service = require('./backend/services/logs/package.json'); \
const dependencies = { \
  ...(shared.dependencies || {}), \
  ...(service.dependencies || {}), \
}; \
delete dependencies['erxes-api-shared']; \
fs.writeFileSync( \
  'package.json', \
  JSON.stringify( \
    { name: 'runtime-deps', version: '1.0.0', private: true, dependencies }, \
    null, \
    2, \
  ), \
); \
" \
    && pnpm install --prod --no-frozen-lockfile

# Runtime image
FROM base AS runtime
WORKDIR /app

# Copy built dist from CI (nx build already ran in workflow)
COPY backend/services/logs ./backend/services/logs
COPY backend/erxes-api-shared ./backend/erxes-api-shared

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
RUN rm -rf ./node_modules/erxes-api-shared
COPY backend/erxes-api-shared/dist ./node_modules/erxes-api-shared/dist
COPY backend/erxes-api-shared/utils ./node_modules/erxes-api-shared/utils
COPY backend/erxes-api-shared/core-types ./node_modules/erxes-api-shared/core-types
COPY backend/erxes-api-shared/core-modules ./node_modules/erxes-api-shared/core-modules
COPY backend/erxes-api-shared/package.json ./node_modules/erxes-api-shared/

# Environment & security
ENV NODE_ENV=production
USER 1000

# Run app
CMD ["node", "backend/services/logs/dist/src/main.js"]
