# Deploying erxes core

CI (`.github/workflows/ci.yml`) runs on every push and pull request to `postgre`:

| Job      | What it checks                                                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| check    | `pnpm typecheck`, `pnpm db:check` (schema = migrations), applied migrations unchanged (`scripts/check-migrations.mjs`), no critical advisories (`pnpm audit --prod`) |
| test-api | every API test on Postgres 16, acting as a role without BYPASSRLS                                                                                                    |
| test-ui  | UI and package tests, `pnpm build`                                                                                                                                   |
| images   | builds `erxes-core-api` and `erxes-core-ui`, starts this folder's stack and runs `smoke.sh`; on `postgre` pushes them to GHCR as `sha-<12 chars>` and `postgre`      |

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
  and grants `erxes_app` (the API's role, no BYPASSRLS) core's tables.
- Put TLS in front of the `ui` container (port 8080); it serves the UI and
  forwards `/core` to the API, live updates included.
- Plugin database roles: `docker compose … run --rm migrate node dist/plugin-role.js <plugin>`.
- Managed Postgres (Supabase, RDS): drop the `postgres` service and point
  `DATA_URL` / `DATA_MIGRATION_URL` at it, with `DATA_SSL=true` and its CA.

## Automatic deploys

In the repository's `production` environment set the variables
`DEPLOY_ENABLED=true`, `DEPLOY_URL` and `DEPLOY_PATH`, and the secrets
`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` and `DEPLOY_KNOWN_HOSTS`. Add
required reviewers to make each deploy wait for approval. The server keeps
its own `deploy/.env` and `deploy/secrets`.
