#!/bin/sh

ENV="$(cat <<EOF
  window.env = {
      REACT_APP_DOMAIN: "$REACT_APP_DOMAIN",
      REACT_APP_SUBSCRIPTION_URL: "$REACT_APP_SUBSCRIPTION_URL",
  }
EOF
)"

echo $ENV > /client-portal/static/js/env.js

exec "$@"