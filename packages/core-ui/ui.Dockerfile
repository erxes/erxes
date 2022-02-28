ARG BASE_IMAGE
FROM $BASE_IMAGE
COPY dist /usr/share/nginx/html
