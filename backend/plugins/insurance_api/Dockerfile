# Stage 1: install production deps as flat real directories (no pnpm virtual store)
# Note: Chromium required for puppeteer PDF generation
FROM node:22-alpine3.22 AS installer
WORKDIR /app
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont \
    && npm install -g pnpm@9

COPY pnpm-lock.yaml ./
COPY backend/plugins/insurance_api/package.json backend/plugins/insurance_api/
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN node -e "\
const fs = require('fs'); \
const service = require('./backend/plugins/insurance_api/package.json'); \
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
    && pnpm install --prod --shamefully-hoist --no-frozen-lockfile \
    && test -d node_modules \
    && { { find node_modules -type f \( \
         -name "*.d.ts" -o -name "*.map" -o -name "*.md" \
         -o -name "LICENSE*" -o -name "LICENCE*" \
         -o -name "CHANGELOG*" -o -name "README*" \
         -o -name "CONTRIBUTING*" -o -name "AUTHORS*" \
         -o -name ".npmignore" -o -name ".eslintrc*" -o -name "Makefile" \
       \) -delete \
    && find node_modules -mindepth 2 -maxdepth 3 -type d \( \
         -name "test" -o -name "tests" -o -name "__tests__" -o -name "spec" \
         -o -name "docs" -o -name "doc" -o -name "examples" -o -name "example" \
         -o -name ".github" -o -name "coverage" \
       \) -prune -exec rm -rf {} \; ; } 2>/dev/null || true; }

# Stage 2: runtime with system Chromium
FROM node:22-alpine3.22
WORKDIR /app
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

COPY --from=installer /app/node_modules ./node_modules

COPY backend/plugins/insurance_api/dist ./dist

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
USER 1000
CMD ["node", "dist/src/main.js"]
