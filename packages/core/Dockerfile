FROM node:12.19-alpine
WORKDIR /core-api
RUN chown -R node:node /core-api \
 && apk add --no-cache tzdata \
 && apk --no-cache add curl
COPY --chown=node:node . /core-api
USER node
ENTRYPOINT ["node", "--max_old_space_size=8192", "--max-http-header-size=16384", "dist/core/src"]