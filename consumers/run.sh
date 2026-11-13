#!/usr/bin/env bash
# Installs each consumer outside the workspace from the packed tarballs only, so
# nothing resolves from the workspace's node_modules, and runs its `check` script.
# Usage: consumers/run.sh <directory with the `pnpm pack` tarballs>
set -euo pipefail

packs="$(realpath "$1")"
here="$(dirname "$(realpath "$0")")"
work="$(mktemp -d)"

mkdir "$work/packs"
for name in erxes-ui erxes-core-contract erxes-plugin-sdk; do
  cp "$packs/$name"-[0-9]*.tgz "$work/packs/$name.tgz"
done

for consumer in plugin-rsbuild sdk-node; do
  echo "::group::$consumer"
  cp -r "$here/$consumer" "$work/$consumer"
  (cd "$work/$consumer" && pnpm install --no-frozen-lockfile && pnpm run check)
  echo "::endgroup::"
done
