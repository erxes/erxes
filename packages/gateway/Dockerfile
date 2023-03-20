FROM node:14.21.3
RUN npm install -g --unsafe-perm  @apollo/rover

WORKDIR /erxes-gateway
RUN chown -R node:node /erxes-gateway
COPY --chown=node:node . /erxes-gateway
USER node

ENTRYPOINT ["node", "--max-http-header-size=16384", "dist/gateway/src"]