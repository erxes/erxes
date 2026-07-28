# Image for the one-off SaaS cross-tenant data migrations.
#
# Build from the repo root (the build context must include backend/saas-migrations):
#   docker build -f backend/saas-migrations/Dockerfile -t erxes/saas-migrations:<tag> .
#
# The scripts only need a Mongo client + tsx; they talk to MongoDB directly and
# do not touch Elasticsearch/Redis/RabbitMQ. Connection string and the
# SOURCE_SUBDOMAIN/TARGET_SUBDOMAIN params are injected at run time (see the
# Kubernetes Job in infra/kubernetes/erxes-saas/migrations-job.ts).
FROM node:22-alpine3.22
WORKDIR /app

RUN npm install -g pnpm@9

# Runtime deps for the migration scripts. Versions pinned to the repo root
# package.json (mongodb / dotenv / tsx).
RUN printf '%s' '{"name":"saas-migrations-runtime","private":true,"dependencies":{"mongodb":"^6.18.0","dotenv":"^16.4.7","tsx":"^4.19.3"}}' > package.json \
    && pnpm install --prod --shamefully-hoist --no-frozen-lockfile

COPY backend/saas-migrations ./saas-migrations

ENV NODE_ENV=production
# Safe by default: do nothing destructive unless explicitly overridden to "0".
ENV DRY_RUN=1

USER 1000

# Default: run every migration (core first, then the rest). Override the args to
# scope to specific domains, e.g. ["saas-migrations/run.ts","core","frontline"].
ENTRYPOINT ["node", "--import", "tsx", "saas-migrations/run.ts"]
