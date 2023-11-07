FROM node:18.17.1-bullseye-slim

WORKDIR /erxes
RUN chown -R node:node /erxes
COPY --chown=node:node . .

RUN apt-get update -y \
    && apt-get install -y curl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && yarn global add @apollo/rover@0.19.1 \
    && yarn cache clean \
    && rover supergraph compose --config /erxes/packages/gateway/src/apollo-router/dummy/supergraph.yaml --elv2-license=accept 

USER node

# pre-download apollo router
RUN mkdir -p /erxes/packages/gateway/src/apollo-router/temp \
    && cd /erxes/packages/gateway/src/apollo-router/temp \
    && curl -sSL https://router.apollo.dev/download/nix/v1.26.0 | sh

ENTRYPOINT ["node", "--max-http-header-size=16384", "packages/gateway/src"]
