# erxes core API. Build from the repository root:
#   docker build -f apps/core-api/Dockerfile -t erxes-core-api .
# Runs `node dist/main.js`; operators also get dist/migrate.js, dist/grant.js
# and dist/plugin-role.js (see deploy/docker-compose.yml).
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
RUN pnpm install --frozen-lockfile --filter @erxes/core-api...
COPY tsconfig.base.json ./
COPY packages/contract packages/contract
COPY packages/db packages/db
COPY packages/payment-gateways packages/payment-gateways
COPY packages/plugin-sdk packages/plugin-sdk
COPY apps/core-api apps/core-api
RUN pnpm --filter @erxes/core-api build \
 && pnpm --filter @erxes/core-api deploy --prod /out \
 && cp -r apps/core-api/dist /out/dist

FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=3400
WORKDIR /app
COPY --from=build --chown=node:node /out/package.json ./
COPY --from=build --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /out/dist ./dist
RUN mkdir -p data && chown node:node data
USER node
EXPOSE 3400
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3400)+'/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "--enable-source-maps", "dist/main.js"]
