#!/bin/sh
echo "window.env = `jo \`env | grep REACT_APP_\``" > /usr/share/nginx/html/js/env.js
sed -i 's/${NGINX_HOST}/'"$NGINX_HOST"'/' /etc/nginx/conf.d/default.conf
sed -i 's/${NGINX_PORT}/'"$NGINX_PORT"'/' /etc/nginx/conf.d/default.conf

# Sub-path hosting (e.g. /widgets behind a prefix-stripping ingress): assets
# and env.js are relative, so only <base href> needs the prefix.
BASE_PATH=$(echo "${REACT_APP_WIDGETS_BASE_PATH:-}" | sed 's:/*$::')
sed -i 's#<base href="[^"]*">#<base href="'"$BASE_PATH"'/">#' /usr/share/nginx/html/index.html

# Add env.js script after <base> (relative URLs resolve against it)
if ! grep -q "js/env.js" /usr/share/nginx/html/index.html; then
    sed -i '/<base href=/a \    <script src="js/env.js"></script>' /usr/share/nginx/html/index.html
fi

exec "$@"
