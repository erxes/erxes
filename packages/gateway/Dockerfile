FROM node:12.19-alpine
WORKDIR /erxes-gateway
RUN chown -R node:node /erxes-gateway \
 && apk add --no-cache tzdata \
 && apk --no-cache add curl
COPY --chown=node:node . /erxes-gateway
USER node
ENTRYPOINT ["node", "--max-http-header-size=16384", "dist/gateway/src"]