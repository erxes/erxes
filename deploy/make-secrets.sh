#!/bin/sh
# Creates deploy/secrets (once): core's ES256 signing key and random secrets.
# Keep these files out of git and back them up: losing the encryption key
# loses sealed webhook and gateway secrets.
set -eu
dir="$(dirname "$0")/secrets"
mkdir -p "$dir" && chmod 700 "$dir"
[ -f "$dir/core_signing_key.pem" ] || openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out "$dir/core_signing_key.pem"
[ -f "$dir/core_jwt_secret" ] || openssl rand -base64 48 | tr -d '\n' > "$dir/core_jwt_secret"
[ -f "$dir/core_encryption_key" ] || openssl rand -base64 32 | tr -d '\n' > "$dir/core_encryption_key"
chmod 644 "$dir"/*  # read by the container's `node` user
echo "secrets in $dir"
