FROM node:18.17.1-bullseye-slim

RUN apt-get update -y && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN yarn global add @apollo/rover@0.19.1
RUN yarn cache clean

WORKDIR /erxes-gateway
RUN chown -R node:node /erxes-gateway
COPY --chown=node:node . /erxes-gateway

# force rover to download supergraph subcommand/plugin
RUN rover supergraph compose --config /erxes-gateway/src/apollo-router/dummy/supergraph.yaml --elv2-license=accept
USER node

# pre-download apollo router
RUN mkdir -p /erxes-gateway/dist/gateway/src/apollo-router/temp
RUN cd /erxes-gateway/dist/gateway/src/apollo-router/temp && curl -sSL https://router.apollo.dev/download/nix/v1.26.0 | sh

ENTRYPOINT ["node", "--max-http-header-size=16384", "dist/gateway/src"]
