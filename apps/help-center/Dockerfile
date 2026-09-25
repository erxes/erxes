
FROM node:22-alpine AS deps
WORKDIR /app/apps/help-center
COPY apps/help-center/package.json apps/help-center/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/apps/help-center/node_modules ./apps/help-center/node_modules
COPY apps/help-center ./apps/help-center
RUN find ./apps/help-center -maxdepth 1 -name '.env*' ! -name '.env.example' -delete
COPY frontend/libs/erxes-ui/src ./frontend/libs/erxes-ui/src


RUN ln -s apps/help-center/node_modules /app/node_modules

WORKDIR /app/apps/help-center
RUN npx next build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3900
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/apps/help-center/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/help-center/.next/static ./apps/help-center/.next/static
COPY --chown=nextjs:nodejs apps/help-center/docker-entrypoint.sh ./

RUN mkdir -p /app/apps/help-center/public/js && \
    chown -R nextjs:nodejs /app/apps/help-center/public

USER nextjs

EXPOSE 3900

WORKDIR /app/apps/help-center

ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
