# Stage 1: install only this service's production deps
FROM node:22-alpine3.22 AS installer
WORKDIR /app
RUN npm install -g pnpm

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
# Minimal root — prevents installing frontend/build-tool deps (React, Nx, Webpack, etc.)
RUN echo '{"name":"erxes","version":"1.0.0","private":true}' > package.json
COPY backend/services/automations/package.json backend/services/automations/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/
# Installs only automations' prod deps (nodemailer, aws-sdk, bullmq, etc. + erxes-api-shared's ~25 deps)
RUN pnpm install --prod

# Stage 2: bundle into a self-contained deployment directory
FROM installer AS deployer
# Copy compiled artifacts (built by CI before docker build)
COPY backend/services/automations/dist backend/services/automations/dist
COPY backend/erxes-api-shared/dist backend/erxes-api-shared/dist
COPY backend/erxes-api-shared/utils backend/erxes-api-shared/utils
COPY backend/erxes-api-shared/core-types backend/erxes-api-shared/core-types
COPY backend/erxes-api-shared/core-modules backend/erxes-api-shared/core-modules
# Creates /app/release with: dist/ + node_modules/ (prod deps only, erxes-api-shared bundled in)
RUN pnpm --filter=./backend/services/automations deploy --prod /app/release

# Stage 3: minimal runtime — no pnpm, no source files, no unused deps
FROM node:22-alpine3.22
WORKDIR /app
COPY --from=deployer /app/release .
ENV NODE_ENV=production
USER 1000
CMD ["node", "dist/src/main.js"]
