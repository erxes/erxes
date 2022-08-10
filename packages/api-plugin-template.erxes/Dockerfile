FROM node:14.18.2-alpine
WORKDIR /erxes-plugin-api
ENTRYPOINT ["node", "--max_old_space_size=8192", "--max-http-header-size=16384", "dist/main/.erxes/src"]