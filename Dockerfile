FROM node:8-slim as build-deps
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y rsync python build-essential && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /erxes-api/
COPY package.json .
RUN yarn
COPY . .
RUN yarn build
RUN mkdir /erxes-api/prod
RUN rsync -a /erxes-api/dist /erxes-api/prod/ && \
    rsync -a /erxes-api/node_modules /erxes-api/prod/ && \
    rsync /erxes-api/package.json /erxes-api/prod/ && \
    rsync /erxes-api/.env.sample /erxes-api/prod/.env

FROM node:8-slim
WORKDIR /erxes-api/
COPY --from=build-deps /erxes-api/prod /erxes-api
RUN chown -R node:node /erxes-api
USER node
EXPOSE 3300
CMD ["yarn", "start"]
