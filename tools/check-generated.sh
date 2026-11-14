#!/usr/bin/env bash
# Regenerates the committed artifacts and fails if any differ: migrations
# (drizzle-kit, from packages/db/src/schema), routes.json,
# erxes-ui's class merge tables (cn build, from the theme's @theme scales) and
# erxes-ui's exports.txt (its exports and SHARED, what plugin UIs depend on).
set -euo pipefail

cd "$(dirname "$0")/.."

generated=(
  packages/db/drizzle
  packages/contract/routes.json
  packages/ui/src/lib/cn-tables.ts
  packages/ui/exports.txt
)

pnpm --silent db:check
pnpm --silent db:generate
pnpm --silent openapi
pnpm --silent --filter @erxes/ui cn:tables
node tools/ui-exports.ts

# Changed against the index, or untracked: a new migration counts as drift.
# Staged regenerated files pass, so this works before a commit too.
drift=$(
  git diff --name-only -- "${generated[@]}"
  git ls-files --others --exclude-standard -- "${generated[@]}"
)

if [ -n "$drift" ]; then
  echo "$drift"
  echo 'Generated files are out of date. Run pnpm db:generate, pnpm openapi,'
  echo 'pnpm --filter @erxes/ui cn:tables and node tools/ui-exports.ts, then commit the result.'
  exit 1
fi

echo 'Migration snapshots, routes.json, the cn tables and exports.txt match their sources.'
