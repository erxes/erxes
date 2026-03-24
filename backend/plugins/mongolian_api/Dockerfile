# Stage 1: install only this plugin's production deps
FROM node:22-alpine3.22 AS installer
WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
# Minimal root — prevents installing frontend/build-tool deps (React, Nx, Webpack, etc.)
RUN echo '{"name":"erxes","version":"1.0.0","private":true}' > package.json
COPY backend/plugins/mongolian_api/package.json backend/plugins/mongolian_api/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/
# Installs only ~25 prod deps (erxes-api-shared's deps), not the 159 in root
RUN pnpm install --prod

# Stage 2: bundle into a self-contained deployment directory
FROM installer AS deployer
# Copy compiled artifacts (built by CI before docker build)
COPY backend/plugins/mongolian_api/dist backend/plugins/mongolian_api/dist
COPY backend/erxes-api-shared/dist backend/erxes-api-shared/dist
COPY backend/erxes-api-shared/utils backend/erxes-api-shared/utils
COPY backend/erxes-api-shared/core-types backend/erxes-api-shared/core-types
COPY backend/erxes-api-shared/core-modules backend/erxes-api-shared/core-modules
# Creates /app/release with: dist/ + node_modules/ (prod deps only, erxes-api-shared bundled in)
RUN pnpm --filter=./backend/plugins/mongolian_api deploy --prod /app/release

# Stage 3: minimal runtime — no pnpm, no source files, no unused deps
FROM node:22-alpine3.22
WORKDIR /app
COPY --from=deployer /app/release .
ENV NODE_ENV=production
USER 1000
CMD ["node", "dist/src/main.js"]
