#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -eq 0 ]; then
  printf 'usage: %s <command> [args...]\n' "$0" >&2
  exit 64
fi

if [ -z "${RELEASE_VERSION:-}" ] || [[ "${RELEASE_VERSION}" == *"<git-sha-or-version>"* ]]; then
  if GIT_SHA="$(git rev-parse --short HEAD 2>/dev/null)"; then
    RELEASE_VERSION="erxes-${GIT_SHA}"
    export RELEASE_VERSION
  else
    printf 'warning: unable to auto-generate RELEASE_VERSION from git; continuing without setting it\n' >&2
    unset RELEASE_VERSION
  fi
fi

if [ -n "${RELEASE_VERSION:-}" ]; then
  printf 'Using RELEASE_VERSION=%s\n' "$RELEASE_VERSION"
fi
exec "$@"
