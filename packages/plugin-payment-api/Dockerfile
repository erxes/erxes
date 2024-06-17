FROM node:18.17.1-bookworm-slim
WORKDIR /erxes
COPY package*.json ./
RUN npm install
RUN chown -R node:node /erxes
RUN npm run build:webpack
COPY --chown=node:node . .
USER node
ENTRYPOINT ["node", "--max-http-header-size=16384", "packages/plugin-payment-api/src/index"]