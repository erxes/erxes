FROM node:14.21.3-bullseye-slim

RUN apt-get update -y
RUN apt-get install -y curl
RUN apt-get install -y heaptrack

WORKDIR /erxes-gateway
RUN chown -R node:node /erxes-gateway
COPY --chown=node:node . /erxes-gateway
USER node

ENTRYPOINT ["node", "--max-http-header-size=16384", "dist/gateway/src"]