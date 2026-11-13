#!/usr/bin/env bash
# Regenerates the committed artifacts and fails if any differ: migrations
# (drizzle-kit, from packages/db/src/schema), the OpenAPI document and routes.json.
set -euo pipefail

cd "$(dirname "$0")/.."

generated=(packages/db/drizzle packages/contract/openapi.json packages/contract/routes.json)

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

echo 'Migration snapshots, openapi.json and routes.json match the schema and the contract.'
