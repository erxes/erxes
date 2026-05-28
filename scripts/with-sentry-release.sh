#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -eq 0 ]; then
  printf 'usage: %s <command> [args...]\n' "$0" >&2
  exit 64
fi

if [ -z "${SENTRY_RELEASE:-}" ] || [[ "${SENTRY_RELEASE}" == *"<git-sha-or-version>"* ]]; then
  SENTRY_RELEASE="erxes-$(git rev-parse --short HEAD)"
  export SENTRY_RELEASE
fi

printf 'Using SENTRY_RELEASE=%s\n' "$SENTRY_RELEASE"
exec "$@"
