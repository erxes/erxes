#!/usr/bin/env bash
# Migrates a throwaway database on DATA_TEST_URL's server, runs the tenancy
# guard (tools/check-rls.sql) on it and fails on any problem it lists.
set -euo pipefail

cd "$(dirname "$0")/.."

server=${DATA_TEST_URL:?Set DATA_TEST_URL to a superuser URL, e.g. postgres://erxes:erxes_local_dev@127.0.0.1:5434/erxes}
name="core_rls_check_$$"
# The same server and options, another database (a dbname option would override the path).
url=$(node -e 'const u = new URL(process.argv[1]); u.pathname = `/${process.argv[2]}`; u.searchParams.delete("dbname"); process.stdout.write(u.href)' "$server" "$name")

psql "$server" -qX -v ON_ERROR_STOP=1 -c "CREATE DATABASE $name"
trap 'psql "$server" -qX -c "DROP DATABASE IF EXISTS $name WITH (FORCE)"' EXIT

# Set here, blanks included, so a local .env can't point the migration at another database
# or role: the environment wins over .env, and a blank setting counts as unset.
DATA_URL="$url" DATA_MIGRATION_URL="$url" DATA_URL_FILE='' DATA_MIGRATION_URL_FILE='' \
  DATA_RUNTIME_ROLE='' pnpm --silent db:migrate > /dev/null

problems=$(psql "$url" -qXAt -v ON_ERROR_STOP=1 -f tools/check-rls.sql)

if [ -n "$problems" ]; then
  echo "$problems"
  echo 'Tenancy guard failed (tools/check-rls.sql).'
  exit 1
fi

echo 'Every org_id table has forced row level security and a policy, every other table is listed, every name starts with core_.'
