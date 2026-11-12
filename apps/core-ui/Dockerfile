# erxes core UI, served by nginx, which also forwards /core to the API so the
# session cookie stays first-party. Build from the repository root:
#   docker build -f apps/core-ui/Dockerfile -t erxes-core-ui .
# Runtime: CORE_API_URL (default http://api:3400).
FROM node:22-bookworm-slim AS build
RUN npm install -g pnpm@9.12.3
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Every workspace manifest, so the frozen lockfile matches.
COPY apps/core-api/package.json apps/core-api/
COPY apps/core-ui/package.json apps/core-ui/
COPY packages/contract/package.json packages/contract/
COPY packages/db/package.json packages/db/
COPY packages/payment-gateways/package.json packages/payment-gateways/
COPY packages/plugin-sdk/package.json packages/plugin-sdk/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile --filter @erxes/core-ui...
COPY tsconfig.base.json ./
COPY packages/contract packages/contract
COPY packages/ui packages/ui
COPY apps/core-ui apps/core-ui
RUN pnpm --filter @erxes/core-ui build

FROM nginx:1.27-alpine
ENV CORE_API_URL=http://api:3400
COPY apps/core-ui/deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /repo/apps/core-ui/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
