FROM node:12.16.3-slim

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
    git nano && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /erxes

COPY --chown=node:node . /erxes

WORKDIR /erxes/ui

RUN yarn

RUN yarn build

RUN yarn global add serve

RUN chown -R node:node /erxes/ui

USER node

EXPOSE 3000

ENTRYPOINT [ "serve", "-s", "build", "-l", "3000" ]
