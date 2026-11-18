#!/bin/sh
# The web image's proxy to the API: paths, queries and headers arrive as sent, and a
# recreated API container is reached at its new address without restarting the web one.
# It starts its own network and containers (an nginx stand-in for the API) and removes them.
#   deploy/web-proxy-test.sh erxes-web:local
set -eu
IMAGE="${1:-erxes-web:local}"
NAME=erxes-web-proxy-test
SUBNET_PREFIX="${SUBNET_PREFIX:-10.250.250}"
PORT="${PORT:-18989}"
BASE="http://127.0.0.1:$PORT"

fail() { echo "FAIL: $*" >&2; exit 1; }

cleanup() {
  docker rm -f "$NAME-web" "$NAME-api-1" "$NAME-api-2" >/dev/null 2>&1 || true
  docker network rm "$NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT
cleanup

# An API stand-in on a fixed address that answers with its name and what it was sent.
api() {
  docker run -d --name "$NAME-api-$1" --hostname "api-$1" --network "$NAME" \
    --ip "$SUBNET_PREFIX.1$1" --network-alias api --entrypoint sh "$IMAGE" -c '
      printf "%s\n" "server { listen 3400; location / { default_type text/plain;" \
        "return 200 \"\$hostname \$request_uri xfp=\$http_x_forwarded_proto\\n\"; } }" \
        > /etc/nginx/conf.d/default.conf
      exec nginx -g "daemon off;"' >/dev/null
}

docker network create --subnet "$SUBNET_PREFIX.0/24" "$NAME" >/dev/null
api 1
docker run -d --name "$NAME-web" --network "$NAME" -p "127.0.0.1:$PORT:8080" "$IMAGE" >/dev/null

i=0
until curl -fsS "$BASE/healthz" >/dev/null 2>&1; do
  i=$((i + 1)); [ "$i" -gt 30 ] && fail "the web container did not start"
  sleep 1
done

echo "== the API gets the path and query as sent"
curl -fsS "$BASE/core/v1/customers?limit=2&q=a%20b" | grep -qx 'api-1 /core/v1/customers?limit=2&q=a%20b xfp=http' ||
  fail "$(curl -sS "$BASE/core/v1/customers?limit=2&q=a%20b")"
curl -fsS "$BASE/gateway/pl:core/core-login?token=t" | grep -qx 'api-1 /gateway/pl:core/core-login?token=t xfp=http' ||
  fail "erxes.io's login link"
curl -fsS "$BASE/core/v1/stream" | grep -q '^api-1 /core/v1/stream' || fail "the live stream"

echo "== the API is replaced by a container on another address"
docker rm -f "$NAME-api-1" >/dev/null
api 2

i=0
until curl -fsS "$BASE/core/v1/setup" 2>/dev/null | grep -q '^api-2 '; do
  i=$((i + 1)); [ "$i" -gt 20 ] && fail "still proxying to the old address after 20 s"
  sleep 1
done

printf '\nweb proxy test passed\n'
