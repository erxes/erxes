# Knowledge base portal — a Next.js app served by its own Node server.
#
# Unlike the rspack widgets, a Next build inlines every NEXT_PUBLIC_* value
# into the client bundle, so the gateway address is a build argument rather
# than a runtime one. Everything else the portal shows — its name, app token,
# knowledge base topic, ticket surfaces and appearance — is looked up at
# request time from the help center matching the domain the request arrived
# on, so one image serves any number of portals.
#
# Build from the repository root:
#   docker build -f apps/knowledge-base/Dockerfile \
#     --build-arg NEXT_PUBLIC_ERXES_API_URL=https://example.erxes.io/gateway \
#     -t erxes/knowledge-base .

FROM node:22-alpine AS deps
WORKDIR /app/apps/knowledge-base
COPY apps/knowledge-base/package.json apps/knowledge-base/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app

ARG NEXT_PUBLIC_ERXES_API_URL
ENV NEXT_PUBLIC_ERXES_API_URL=${NEXT_PUBLIC_ERXES_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/apps/knowledge-base/node_modules ./apps/knowledge-base/node_modules
COPY apps/knowledge-base ./apps/knowledge-base

# A developer's .env.local would otherwise be copied in above and read by
# `next build`, silently overriding the gateway this image is built for and
# baking that machine's app token into the bundle. The build takes its
# configuration from the build argument only.
RUN find ./apps/knowledge-base -maxdepth 1 -name '.env*' ! -name '.env.example' -delete

# A few form controls and the toaster compile from the erxes-ui source tree,
# reached through the `erxes-ui/*` tsconfig path and `externalDir`.
COPY frontend/libs/erxes-ui/src ./frontend/libs/erxes-ui/src

# Those sources resolve their own imports (clsx, radix-ui, the icon set) by
# walking up from frontend/libs, which in the pnpm workspace lands on the root
# node_modules. This image installs a single dependency set, so the same one
# is published at the root instead of being installed a second time.
RUN ln -s apps/knowledge-base/node_modules /app/node_modules

WORKDIR /app/apps/knowledge-base
RUN npx next build

# Final stage — only the traced standalone output, no full node_modules.
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3900
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# `outputFileTracingRoot` is the repository root, so the standalone bundle
# keeps the app under apps/knowledge-base and its server.js sits there.
COPY --from=build --chown=nextjs:nodejs /app/apps/knowledge-base/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/knowledge-base/.next/static ./apps/knowledge-base/.next/static

USER nextjs

EXPOSE 3900

WORKDIR /app/apps/knowledge-base

CMD ["node", "server.js"]
