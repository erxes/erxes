#!/bin/sh
# Smoke test against a running stack (CI runs it on deploy/docker-compose.yml):
# the UI serves, the API is ready through the UI's proxy, first-run setup signs
# in, and a customer round-trips through Postgres as the runtime role.
#   deploy/smoke.sh http://localhost:8080
set -eu
command -v jq >/dev/null || { echo 'needs jq' >&2; exit 1; }
BASE="${1:-http://localhost:8080}"
JAR="$(mktemp)"
trap 'rm -f "$JAR"' EXIT
H='sec-fetch-site: same-origin'

step() { printf '\n== %s\n' "$*"; }
fail() { echo "FAIL: $*" >&2; exit 1; }

step "waiting for $BASE"
i=0
until curl -fsS "$BASE/core/v1/setup" >/dev/null 2>&1; do
  i=$((i + 1)); [ "$i" -gt 60 ] && fail "API not reachable through the UI after 120s"
  sleep 2
done

step "UI serves index.html and SPA routes"
curl -fsS "$BASE/" | grep -q '<div id="root"' || fail "index.html"
curl -fsS "$BASE/contacts/customers" | grep -q '<div id="root"' || fail "SPA fallback"

step "setup required"
curl -fsS "$BASE/core/v1/setup" | grep -q '"required":true' || fail "a fresh install should need setup"

step "first-run setup signs in"
curl -fsS -c "$JAR" -H "$H" -H 'content-type: application/json' "$BASE/core/v1/setup" \
  -d '{"organizationName":"Smoke","firstName":"Smoke","email":"smoke@example.com","password":"Smoke-test-1"}' >/dev/null || fail "setup"
curl -fsS -b "$JAR" "$BASE/core/v1/auth/me" | grep -q 'smoke@example.com' || fail "session"

step "customer round-trip"
id="$(curl -fsS -b "$JAR" -H "$H" -H 'content-type: application/json' "$BASE/core/v1/customers" \
  -d '{"firstName":"Ada","primaryEmail":"ada@example.com"}' | jq -r .id)"
[ -n "$id" ] && [ "$id" != null ] || fail "create customer"
curl -fsS -b "$JAR" "$BASE/core/v1/customers/$id" | grep -q 'ada@example.com' || fail "read customer"

step "cross-site write is refused"
code="$(curl -s -o /dev/null -w '%{http_code}' -b "$JAR" -H 'sec-fetch-site: cross-site' -H 'content-type: application/json' \
  "$BASE/core/v1/customers" -d '{"firstName":"Eve"}')"
[ "$code" = 403 ] || fail "cross-site write returned $code"

step "JWKS published"
curl -fsS "$BASE/core/v1/.well-known/jwks.json" | grep -q '"kty":"EC"' || fail "jwks"

printf '\nsmoke test passed\n'
