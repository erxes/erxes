#!/bin/sh

ENV="$(cat <<EOF
  window.env = {
      REACT_APP_DOMAIN: "$REACT_APP_DOMAIN",
      REACT_APP_SUBSCRIPTION_URL: "$REACT_APP_SUBSCRIPTION_URL",
      REACT_APP_TOKEN: "$REACT_APP_TOKEN",
  }
EOF
)"

echo $ENV > /client-portal/static/js/env.js

exec "$@"