#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -eq 0 ]; then
  printf 'usage: %s <command> [args...]\n' "$0" >&2
  exit 64
fi

if [ -z "${SENTRY_RELEASE:-}" ] || [[ "${SENTRY_RELEASE}" == *"<git-sha-or-version>"* ]]; then
  if GIT_SHA="$(git rev-parse --short HEAD 2>/dev/null)"; then
    SENTRY_RELEASE="erxes-${GIT_SHA}"
    export SENTRY_RELEASE
  else
    printf 'warning: unable to auto-generate SENTRY_RELEASE from git; continuing without setting it\n' >&2
    unset SENTRY_RELEASE
  fi
fi

if [ -n "${SENTRY_RELEASE:-}" ]; then
  printf 'Using SENTRY_RELEASE=%s\n' "$SENTRY_RELEASE"
fi
exec "$@"
