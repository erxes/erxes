FROM node:14.21.3-bullseye-slim

RUN apt-get update -y
RUN apt-get install -y curl
RUN apt-get install -y heaptrack

WORKDIR /erxes-gateway
RUN chown -R node:node /erxes-gateway
COPY --chown=node:node . /erxes-gateway
USER node
# force rover to download supergraph subcommand/plugin
RUN ./dist/node_modules/@apollo/rover/run.js supergraph --help
# pre-download apollo router
RUN mkdir -p /erxes-gateway/dist/gateway/src/apollo-router/temp
RUN cd /erxes-gateway/dist/gateway/src/apollo-router/temp && curl -sSL https://router.apollo.dev/download/nix/v1.10.2 | sh

ENTRYPOINT ["node", "--max-http-header-size=16384", "dist/gateway/src"]
