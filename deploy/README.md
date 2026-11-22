# Deploying erxes core

CI (`.github/workflows/ci.yml`) runs on every pull request and every push to `postgre`. The first three jobs run side by side:

| Job         | What it checks                                                                                                                                                                                                                                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| static      | `vp run check`, `pnpm check:generated` (migrations, `routes.json` and the cn tables), applied migrations unchanged, the lint plugin tests, no critical advisories (`pnpm audit --prod`), that `docker-compose.yml` publishes no Postgres port to the host, then `pnpm build`                                                                            |
| integration | every test on Postgres 18, split over two runners (API test files in parallel, each on its own database as a role without BYPASSRLS)                                                                                                                                                                                                                    |
| images      | builds `erxes-api` and `erxes-web` once, fails on HIGH or CRITICAL vulnerabilities that have a fix (Trivy), starts two copies of this folder's stack, runs `smoke.sh` on one, `web-proxy-test.sh` on the web image and the daily flows (`e2e/`, Chromium with axe) on the other. Only branch runs write the layer cache; pull requests read `postgre`'s |
| Check       | passes only when every job above passed; the one to require in branch protection                                                                                                                                                                                                                                                                        |
| push        | on `postgre` only, after Check: pushes both images to GHCR and Docker Hub (`erxes/core-api`, `erxes/core-web`) as `sha-<12 chars>` and `postgre`                                                                                                                                                                                                        |

CodeQL (`codeql.yml`) scans weekly and on changes. `deploy.yml` deploys after a
green CI run on `postgre` (or by hand with an image tag) once the `production`
environment is configured. It is off until then.

## One server

```sh
cp deploy/.env.example deploy/.env   # passwords, APP_URL, image tags
deploy/make-secrets.sh               # signing key, JWT secret, encryption key
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d
deploy/smoke.sh http://localhost:8080   # on an empty install only (it runs setup)
```

- `migrate` runs `node dist/migrate.js` as the owner before the API starts,
  and grants `erxes_app` (the API's role, no BYPASSRLS) core's tables and the right to
  act as `erxes_core_system`, the BYPASSRLS role background jobs run as, and as
  `erxes_core_keyed`, the role an API key with row limits runs as.
- Put TLS in front of the `ui` container (port 8080); it serves the UI and
  forwards `/core` to the API, live updates included. It looks the API's address up
  every 10 s, so a recreated `api` container needs no `ui` restart. `CORE_API_URL` is
  scheme, host and port with no path; in Kubernetes the host is the full service name
  (`core-api.erxes.svc.cluster.local`), as nginx doesn't use resolv.conf's search domains.
- Plugin database roles: `docker compose … run --rm migrate node dist/plugin-role.js <plugin>`.
  It sets a new password and prints it once. When the logins and their passwords are made
  elsewhere (Ansible, a secret store), `node dist/plugin-role.js <plugin>... --keep-password`
  only grants, so a deploy can run it every time.
- Postgres is 18. Its image keeps data in `/var/lib/postgresql/18/docker` and the
  volume mounts at `/var/lib/postgresql`. A volume written by Postgres 16 does not
  start under 18: `pg_dumpall` it on 16 and restore into the new volume.
- Managed Postgres (Supabase, RDS): drop the `postgres` service and point
  `DATA_URL` / `DATA_MIGRATION_URL` at it, with `DATA_SSL=true` and its CA. The
  owner in `DATA_MIGRATION_URL` must be able to create a BYPASSRLS role. Without a
  superuser, `pnpm db:migrate` can't mark `lower`, `LIKE` and `ILIKE` LEAKPROOF, so
  search, "contains" filters and email lookups read every row (the API warns at
  start): run `ALTER FUNCTION lower(text) LEAKPROOF` and the same for
  `textlike(text,text)` and `texticlike(text,text)` as a superuser where the host has one.

## Updating

Pin `API_IMAGE` and `WEB_IMAGE` in `deploy/.env` to a `sha-<commit>` tag; `postgre`
moves with every push. Then:

```sh
C="docker compose -f deploy/docker-compose.yml --env-file deploy/.env"
$C exec -T postgres pg_dump -U erxes -Fc erxes > erxes-$(date +%F-%H%M).dump
$C pull
$C run --rm migrate      # prints "applied: …" or "up to date"
$C up -d api ui
```

- `migrate` applies everything in one transaction under an advisory lock, so a second
  copy waits, and a failed migration changes nothing. It works through PgBouncer or
  Supavisor in transaction mode.
- Run `node dist/plugin-role.js <plugin>... --keep-password` and each plugin's own
  migration on every deploy, before you restart the plugins.
- Leave `DATA_MIGRATE_ON_START` off in production. Several API replicas would each
  try to migrate, and a separate job shows its result in one place.
- Rolling back means the previous image tag. Migrations have no down step, so
  restore the dump when a release must be undone past a schema change.
- In Kubernetes, `migrate` is a Job (or a Helm pre-upgrade hook) that runs before
  the `api` Deployment rolls.

## Writing migrations for a live database

Old API containers keep serving while the new schema applies.

- Expand, then contract: add the new column and write both, stop reading the old one
  in the next release, drop it in the one after.
- Never edit an applied migration; add a new one (CI fails on a changed one).
- On a large table, build an index with `CREATE INDEX CONCURRENTLY` by hand before the
  deploy. It can't run inside the migration transaction. Add `NOT NULL` as a
  `CHECK … NOT VALID` constraint, then `VALIDATE` it in the next migration.
- Backfill in batches of a few thousand rows, not one `UPDATE` over the table.
- Start a migration that takes strong locks with `SET LOCAL lock_timeout = '5s'`, so
  it fails fast instead of making every request wait behind it.

## Postgres settings

`docker-compose.yml` sizes the bundled Postgres for 4 GB of RAM and an SSD. Each
request already turns JIT off for its transaction. On a larger host or a managed
database, start from these (8 GB RAM, 4 vCPU, SSD) and scale them:

```conf
shared_buffers = 2GB                  # about 25% of RAM
effective_cache_size = 6GB            # about 75% of RAM
work_mem = 16MB
maintenance_work_mem = 512MB
random_page_cost = 1.1
effective_io_concurrency = 200
max_wal_size = 4GB
checkpoint_completion_target = 0.9
wal_compression = zstd
max_parallel_workers_per_gather = 2
autovacuum_vacuum_scale_factor = 0.05 # jobs, events, audit and notifications churn
autovacuum_analyze_scale_factor = 0.02
autovacuum_vacuum_cost_limit = 2000
idle_in_transaction_session_timeout = '60s'
shared_preload_libraries = 'pg_stat_statements'
log_min_duration_statement = '500ms'
log_lock_waits = on
track_io_timing = on
```

Connections: each API process opens up to `DATA_POOL_MAX` (10), and each plugin has
its own pool. Keep the sum across replicas under about 80% of `max_connections`.
With more than a few replicas, put PgBouncer in transaction mode in front of
`DATA_URL`; `DATA_LISTEN_URL` (live updates) and `DATA_MIGRATION_URL` need a direct or
session-mode connection. `DATA_STATEMENT_TIMEOUT_MS` (15 s) caps each statement.

Once a week, list the slowest queries in `pg_stat_statements` by `total_exec_time`.
A list that is slow under row level security usually needs an index that starts
with `org_id`.

## SaaS and self-hosted

|            | SaaS                                                                  | Self-hosted                                                        |
| ---------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Database   | Managed Postgres 18 or Patroni: a primary, one standby, PgBouncer     | The bundled `postgres` service, or the customer's own              |
| Tenancy    | One database for all organisations, split by row level security       | Usually one organisation                                           |
| Backups    | Point-in-time recovery (WAL archive, 7–30 days); restore one monthly  | A nightly `pg_dump -Fc` copied off the host, plus volume snapshots |
| Updates    | CI, staging restored from production, migrate Job, rolling deploy     | Pinned tags and the steps under Updating                           |
| Monitoring | `postgres_exporter`: connections, replication lag, bloat, disk        | Slow-query log and a disk-full alert                               |
| Major PG   | `pg_upgrade --link` on a replica, or logical replication, then switch | `pg_dumpall`, then restore into a new volume                       |

## Automatic deploys

In the repository's `production` environment set the variables
`DEPLOY_ENABLED=true`, `DEPLOY_URL` and `DEPLOY_PATH`, and the secrets
`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` and `DEPLOY_KNOWN_HOSTS`. Add
required reviewers to make each deploy wait for approval. The server keeps
its own `deploy/.env` and `deploy/secrets`.
