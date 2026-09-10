#!/bin/sh

mkdir -p public/js

cat > public/js/env.js <<INNER
  window.env = {
      NEXT_PUBLIC_ERXES_API_URL: "$NEXT_PUBLIC_ERXES_API_URL",
  }
INNER

exec "$@"
