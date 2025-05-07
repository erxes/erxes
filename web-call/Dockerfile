FROM node:18-alpine AS base
WORKDIR /web-call/
RUN chown -R node:node /web-call
COPY --chown=node:node . /web-call
USER node
RUN yarn build
ENTRYPOINT [ "sh", "./docker-entrypoint.sh" ]
CMD [ "yarn", "start" ]
