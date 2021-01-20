ARG BASE_IMAGE
FROM $BASE_IMAGE
COPY build /usr/share/nginx/html
