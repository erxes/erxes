#!/usr/bin/env bash
# Regenerates the committed artifacts and fails if any differ: migrations
# (drizzle-kit, from packages/db/src/schema) and the OpenAPI document.
# drizzle-kit compares the schema with the migration snapshots, not the SQL:
# apps/core-api/src/__tests__/migrations.test.ts checks what the SQL builds.
set -euo pipefail

cd "$(dirname "$0")/.."

generated=(packages/db/drizzle packages/contract/openapi.json)

pnpm --silent db:check
pnpm --silent db:generate
pnpm --silent openapi

# Changed against the index, or untracked: a new migration counts as drift.
# Staged regenerated files pass, so this works before a commit too.
drift=$(
  git diff --name-only -- "${generated[@]}"
  git ls-files --others --exclude-standard -- "${generated[@]}"
)

if [ -n "$drift" ]; then
  echo "$drift"
  echo 'Generated files are out of date. Run pnpm db:generate and pnpm openapi, then commit the result.'
  exit 1
fi

echo 'Migration snapshots and openapi.json match the schema and the contract.'
