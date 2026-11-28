# erxes core API. Build from the repository root:
#   docker build -f apps/api/Dockerfile -t erxes-api .
# Runs `node --import ./dist/instrumentation.js dist/main.js` (tracing loads
# first, so it can patch http, express and pg); operators also get
# dist/migrate.js, dist/grant.js and dist/plugin-role.js (see deploy/docker-compose.yml).
FROM node:26-bookworm-slim AS build
RUN npm install -g pnpm@11.5.2
# The root `prepare` script installs git hooks; the image has no git and never commits.
ENV VP_GIT_HOOKS=0
WORKDIR /repo
# Every dependency into pnpm's store, from the lockfile alone: a manifest change (a release's
# version bump) keeps this layer, so the install below links offline instead of downloading.
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
# pnpm applies these to dependencies on install (patchedDependencies).
COPY patches patches
RUN pnpm fetch
COPY package.json ./
# Every workspace manifest, so the frozen lockfile matches.
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/assistant-catalog/package.json packages/assistant-catalog/
COPY packages/contract/package.json packages/contract/
COPY packages/db/package.json packages/db/
COPY packages/integrations/package.json packages/integrations/
COPY packages/lint/package.json packages/lint/
COPY packages/plugin-sdk/package.json packages/plugin-sdk/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile --offline --filter @erxes/api...
COPY tsconfig.base.json ./
COPY packages/assistant-catalog packages/assistant-catalog
COPY packages/contract packages/contract
COPY packages/db packages/db
COPY packages/integrations packages/integrations
COPY packages/plugin-sdk packages/plugin-sdk
COPY apps/api apps/api
RUN pnpm --filter @erxes/api build \
 && pnpm --filter @erxes/api deploy --prod --legacy /out \
 && cp -r apps/api/dist /out/dist

FROM node:26-bookworm-slim
# The runtime only runs node; npm and corepack bring their own dependencies (and advisories).
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
# Debian's fixes the base image doesn't carry yet (PAM: CVE-2025-6020; zstd: CVE-2026-124851).
RUN apt-get update \
  && apt-get install -y --only-upgrade --no-install-recommends libpam-modules libpam-modules-bin libpam-runtime libpam0g libzstd1 \
  && rm -rf /var/lib/apt/lists/*
# The build this image is (CI passes its commit): what a self-hosted server tells erxes.io it runs.
ARG VERSION=dev
ENV NODE_ENV=production PORT=3400 VERSION=$VERSION
WORKDIR /app
COPY --from=build --chown=node:node /out/package.json ./
COPY --from=build --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /out/dist ./dist
RUN mkdir -p data && chown node:node data
USER node
EXPOSE 3400
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3400)+'/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "--enable-source-maps", "--import", "./dist/instrumentation.js", "dist/main.js"]
