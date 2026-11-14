# erxes core UI, served by nginx, which also forwards /core to the API so the
# session cookie stays first-party. Build from the repository root:
#   docker build -f apps/web/Dockerfile -t erxes-web .
# Runtime: CORE_API_URL (default http://api:3400).
FROM node:26-bookworm-slim AS build
RUN npm install -g pnpm@11.5.2
# The root `prepare` script installs git hooks; the image has no git and never commits.
ENV VP_GIT_HOOKS=0
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# pnpm applies these to dependencies on install (patchedDependencies).
COPY patches patches
# Every workspace manifest, so the frozen lockfile matches.
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/contract/package.json packages/contract/
COPY packages/db/package.json packages/db/
COPY packages/payment-gateways/package.json packages/payment-gateways/
COPY packages/plugin-sdk/package.json packages/plugin-sdk/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile --filter @erxes/web...
COPY tsconfig.base.json ./
COPY packages/contract packages/contract
# The contract builds its schemas from the table definitions (@erxes/core-db/schema).
COPY packages/db/src packages/db/src
COPY packages/ui packages/ui
COPY apps/web apps/web
RUN pnpm --filter @erxes/web build

FROM nginx:1.30-alpine
# Alpine fixes reach the package repository before the nginx image is rebuilt.
RUN apk upgrade --no-cache
ENV CORE_API_URL=http://api:3400
COPY apps/web/deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
