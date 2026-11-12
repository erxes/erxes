#!/bin/sh
# First start of the bundled Postgres: the API's runtime role (no BYPASSRLS,
# no DDL). `node dist/migrate.js` grants it core's tables after migrating.
set -eu
psql -v ON_ERROR_STOP=1 -v pw="$DATA_APP_PASSWORD" --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
SELECT format('CREATE ROLE erxes_app LOGIN NOBYPASSRLS NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD %L', :'pw')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'erxes_app') \gexec
SQL
