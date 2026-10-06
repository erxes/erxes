# Base image
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@9

# Dependencies (production only)
FROM base AS deps
# Copy lockfile and package manifests
COPY pnpm-lock.yaml ./
# Copy only the package.json files for selective deps resolution
COPY backend/services/logs/package.json backend/services/logs/

# Install only production dependencies
RUN node -e "\
const fs = require('fs'); \
const service = require('./backend/services/logs/package.json'); \
const dependencies = { \
  ...(service.dependencies || {}), \
}; \
fs.writeFileSync( \
  'package.json', \
  JSON.stringify( \
    { name: 'runtime-deps', version: '1.0.0', private: true, dependencies }, \
    null, \
    2, \
  ), \
); \
" \
    && pnpm install --prod --shamefully-hoist --no-frozen-lockfile

# Runtime image
FROM base AS runtime
WORKDIR /app

# Copy built dist from CI (nx build already ran in workflow)
COPY backend/services/logs ./backend/services/logs

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Environment & security
ENV NODE_ENV=production
USER 1000

# Run app
CMD ["node", "backend/services/logs/dist/src/main.js"]
