FROM node:18.17.1-bookworm-slim
WORKDIR /erxes/packages/plugin-payment-api
RUN yarn install && yarn build:webpack

WORKDIR /erxes
RUN chown -R node:node /erxes
COPY --chown=node:node . .
USER node
ENTRYPOINT ["node", "--max-http-header-size=16384", "packages/plugin-payment-api/src/index"]