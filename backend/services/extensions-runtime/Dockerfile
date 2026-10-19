# Stage 1: install production deps as flat real directories (no pnpm virtual store)
FROM node:24-bookworm-slim AS installer
WORKDIR /app
RUN npm install -g pnpm@9

COPY pnpm-lock.yaml ./
COPY backend/services/extensions-runtime/package.json backend/services/extensions-runtime/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/
RUN node -e "\
const fs = require('fs'); \
const shared = require('./backend/erxes-api-shared/package.json'); \
const service = require('./backend/services/extensions-runtime/package.json'); \
const dependencies = { \
  ...(shared.dependencies || {}), \
  ...(service.dependencies || {}), \
}; \
delete dependencies['erxes-api-shared']; \
delete dependencies['erxes-sdk']; \
fs.writeFileSync( \
  'package.json', \
  JSON.stringify( \
    { name: 'runtime-deps', version: '1.0.0', private: true, dependencies }, \
    null, \
    2, \
  ), \
); \
" \
    && pnpm install --prod --shamefully-hoist --no-frozen-lockfile \
    && find node_modules -type f \( \
         -name "*.d.ts" -o -name "*.map" -o -name "*.md" \
         -o -name "LICENSE*" -o -name "LICENCE*" \
         -o -name "CHANGELOG*" -o -name "README*" \
         -o -name "CONTRIBUTING*" -o -name "AUTHORS*" \
         -o -name ".npmignore" -o -name ".eslintrc*" -o -name "Makefile" \
       \) -delete \
    && (find node_modules -mindepth 2 -maxdepth 3 -type d \( \
         -name "test" -o -name "tests" -o -name "__tests__" -o -name "spec" \
         -o -name "docs" -o -name "doc" -o -name "examples" -o -name "example" \
         -o -name ".github" -o -name "coverage" \
       \) -prune -exec rm -rf {} \; 2>/dev/null || true)
# Stage 2: minimal runtime. Debian, not Alpine: the workerd binary needs glibc.
FROM node:24-bookworm-slim
WORKDIR /app
# workerd refuses to start without system CA certificates.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=installer /app/node_modules ./node_modules

RUN rm -rf ./node_modules/erxes-api-shared
COPY backend/erxes-api-shared/dist ./node_modules/erxes-api-shared/dist
COPY backend/erxes-api-shared/utils ./node_modules/erxes-api-shared/utils
COPY backend/erxes-api-shared/core-types ./node_modules/erxes-api-shared/core-types
COPY backend/erxes-api-shared/core-modules ./node_modules/erxes-api-shared/core-modules
COPY backend/erxes-api-shared/package.json ./node_modules/erxes-api-shared/

# The runtime loads the SDK's host contracts. Its package points at TypeScript
# source for authors, so the image gets the compiled entry instead.
COPY packages/sdk/dist ./node_modules/erxes-sdk/
RUN echo '{"name":"erxes-sdk","main":"index.js"}' > ./node_modules/erxes-sdk/package.json

COPY backend/services/extensions-runtime/dist ./dist

ENV NODE_ENV=production
# Reach the runtime only on the internal network, from the gateway and
# core-api; never publish its ports.
# workerd writes its generated config to the OS temp dir: run with a tmpfs on
# /tmp and a read-only root filesystem. Set EXT_RUNTIME_HOSTNAME=0.0.0.0 and
# EXT_RUNTIME_ADDRESS to this container's address so the gateway can reach it.
USER 1000
CMD ["node", "dist/src/main.js"]
