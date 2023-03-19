FROM node:latest
WORKDIR /erxes-gateway
RUN chown -R node:node /erxes-gateway
COPY --chown=node:node . /erxes-gateway
USER node
ENTRYPOINT ["node", "--max-http-header-size=16384", "dist/gateway/src"]