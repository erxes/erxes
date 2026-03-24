# Stage 1: install only this plugin's production deps
# Note: puppeteer downloads Chromium (~170MB) — this is required for PDF generation
FROM node:22-alpine3.22 AS installer
WORKDIR /app
# Chromium dependencies required by puppeteer on Alpine
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont
RUN npm install -g pnpm

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
# Minimal root — prevents installing frontend/build-tool deps (React, Nx, Webpack, etc.)
RUN echo '{"name":"erxes","version":"1.0.0","private":true}' > package.json
COPY backend/plugins/insurance_api/package.json backend/plugins/insurance_api/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/
# Use system Chromium instead of downloading bundled one
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
RUN pnpm install --prod

# Stage 2: bundle into a self-contained deployment directory
FROM installer AS deployer
# Copy compiled artifacts (built by CI before docker build)
COPY backend/plugins/insurance_api/dist backend/plugins/insurance_api/dist
COPY backend/erxes-api-shared/dist backend/erxes-api-shared/dist
COPY backend/erxes-api-shared/utils backend/erxes-api-shared/utils
COPY backend/erxes-api-shared/core-types backend/erxes-api-shared/core-types
COPY backend/erxes-api-shared/core-modules backend/erxes-api-shared/core-modules
# Creates /app/release with: dist/ + node_modules/ (prod deps only, erxes-api-shared bundled in)
RUN pnpm --filter=./backend/plugins/insurance_api deploy --prod /app/release

# Stage 3: runtime with system Chromium (no bundled Chromium download)
FROM node:22-alpine3.22
WORKDIR /app
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont
COPY --from=deployer /app/release .
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
USER 1000
CMD ["node", "dist/src/main.js"]
