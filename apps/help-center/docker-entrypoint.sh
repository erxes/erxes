#!/bin/sh

# Next inlines NEXT_PUBLIC_* into the client bundle at build time, which would
# tie an image to one gateway. Writing the values into a script the page loads
# first keeps them runtime settings instead, so the same image serves any
# deployment. Server components read the same variables from the environment.
#
# Paths are relative to the working directory the Dockerfile sets, which is the
# app root the standalone server runs from.

mkdir -p public/js

cat > public/js/env.js <<INNER
  window.env = {
      NEXT_PUBLIC_APP_VERSION: "$NEXT_PUBLIC_APP_VERSION",
      NEXT_PUBLIC_ERXES_API_URL: "$NEXT_PUBLIC_ERXES_API_URL",
  }
INNER

exec "$@"
