#!/usr/bin/env bash
# Whether a pull request changes any of a CI job's inputs: writes run=true or run=false to
# $GITHUB_OUTPUT. Pushes, the merge queue and manual runs always run: selection only narrows
# pull request feedback. A change to CI, the lockfile, Node, patches or the root config reaches
# every job. The pull request's checkout is its merge commit, fetched with depth 2: the first
# parent is the base it merges into.
# Usage: tools/pr-reaches.sh '<extended regex of the job's paths>'
set -euo pipefail

inputs="$1|^(\.github/|pnpm-lock\.yaml|pnpm-workspace\.yaml|\.node-version|patches/|package\.json|vite\.config\.ts|tools/pr-reaches\.sh)"
out="${GITHUB_OUTPUT:-/dev/stdout}"

if [ "${GITHUB_EVENT_NAME:-}" != pull_request ]; then
  echo run=true >> "$out"
  exit 0
fi

if hits="$(git diff --name-only HEAD^1 HEAD | grep -E "$inputs")"; then
  echo "Reached by: $(head -n 5 <<< "$hits" | tr '\n' ' ')"
  echo run=true >> "$out"
else
  echo "::notice::Nothing this pull request changes matches $1, so the job's steps are skipped. Pushes run them."
  echo run=false >> "$out"
fi
