FROM node:14.21.3-bullseye-slim

RUN apt-get update -y
RUN apt-get install -y curl
# RUN apt-get install -y heaptrack

RUN yarn global add @apollo/rover

WORKDIR /erxes-gateway
RUN chown -R node:node /erxes-gateway
COPY --chown=node:node . /erxes-gateway

# force rover to download supergraph subcommand/plugin
RUN rover supergraph compose --config /erxes-gateway/src/apollo-router/dummy/supergraph.yaml --elv2-license=accept
USER node

# pre-download apollo router
RUN mkdir -p /erxes-gateway/dist/gateway/src/apollo-router/downloads
RUN cd /erxes-gateway/dist/gateway/src/apollo-router/downloads && curl -sSL https://router.apollo.dev/download/nix/v1.26.0 | sh

ENTRYPOINT ["node", "--max-http-header-size=16384", "dist/gateway/src"]
