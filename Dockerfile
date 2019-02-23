FROM erxes/json-helper:latest
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY build /usr/share/nginx/html
ENTRYPOINT [ "sh", "/usr/local/bin/start-app" ]
