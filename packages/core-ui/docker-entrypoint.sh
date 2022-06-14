#!/bin/sh
echo "window.env = `jo \`env | grep REACT_APP_\``" > /usr/share/nginx/html/js/env.js
sed -i 's/${NGINX_HOST}/'"$NGINX_HOST"'/' /etc/nginx/conf.d/default.conf
sed -i 's~%REACT_APP_PUBLIC_PATH%~'"$REACT_APP_PUBLIC_PATH"'~g' /usr/share/nginx/html/index.html
exec "$@"