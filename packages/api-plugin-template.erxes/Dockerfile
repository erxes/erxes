FROM node:14.18.2-alpine
WORKDIR /erxes-plugin-api
RUN chown -R node:node /erxes-plugin-api \
 && apk add --no-cache tzdata \
 && apk --no-cache add curl
COPY --chown=node:node . /erxes-plugin-api
USER node
ENTRYPOINT ["node", "--max_old_space_size=8192", "--max-http-header-size=16384", "dist/main/.erxes/src"]