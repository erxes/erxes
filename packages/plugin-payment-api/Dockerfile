FROM node:18.17.1-bookworm-slim
WORKDIR /erxes
RUN chown -R node:node /erxes
RUN yarn build:client
RUN yarn start:client
COPY --chown=node:node . .
USER node
ENTRYPOINT ["node", "--max-http-header-size=16384", "packages/plugin-payment-api/src/index"]