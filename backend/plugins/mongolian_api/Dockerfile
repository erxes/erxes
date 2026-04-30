# Stage 1: install production deps as flat real directories (no pnpm virtual store)
FROM node:22-alpine3.22 AS installer
WORKDIR /app
RUN npm install -g pnpm@9

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY backend/plugins/mongolian_api/package.json backend/plugins/mongolian_api/
COPY backend/erxes-api-shared/package.json backend/erxes-api-shared/
RUN pnpm --filter ./backend/plugins/mongolian_api --filter erxes-api-shared --filter '!.' --filter '!erxes-next' install --prod --shamefully-hoist \
    && find node_modules -type f \( \
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
       \) -prune -exec rm -rf {} \; 2>/dev/null || true

# Stage 2: minimal runtime
FROM node:22-alpine3.22
WORKDIR /app

COPY --from=installer /app/node_modules ./node_modules

RUN rm -rf ./node_modules/erxes-api-shared
COPY backend/erxes-api-shared/dist ./node_modules/erxes-api-shared/dist
COPY backend/erxes-api-shared/utils ./node_modules/erxes-api-shared/utils
COPY backend/erxes-api-shared/core-types ./node_modules/erxes-api-shared/core-types
COPY backend/erxes-api-shared/core-modules ./node_modules/erxes-api-shared/core-modules
COPY backend/erxes-api-shared/package.json ./node_modules/erxes-api-shared/

COPY backend/plugins/mongolian_api/dist ./dist

ENV NODE_ENV=production
USER 1000
CMD ["node", "dist/src/main.js"]
