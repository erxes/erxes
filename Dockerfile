FROM node:8-slim as build-deps
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y rsync && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /erxes-widgets/
COPY package.json .
RUN yarn
COPY . .
RUN yarn build
RUN mkdir /erxes-widgets/prod
RUN rsync -a /erxes-widgets/dist /erxes-widgets/prod/ && \
    rsync -a /erxes-widgets/node_modules /erxes-widgets/prod/ && \
    rsync /erxes-widgets/package.json /erxes-widgets/prod/ && \
    rsync -a /erxes-widgets/static /erxes-widgets/prod/ && \
    rsync /erxes-widgets/.env.sample /erxes-widgets/prod/.env

FROM node:8-slim
WORKDIR /erxes-widgets/
COPY --from=build-deps /erxes-widgets/prod /erxes-widgets
RUN chown -R node:node /erxes-widgets
USER node
EXPOSE 3200
CMD ["yarn", "start"]
