FROM node:18-alpine AS base
WORKDIR /erxespos/
RUN chown -R node:node /erxespos
COPY --chown=node:node . /erxespos
USER node
RUN yarn build
ENTRYPOINT [ "sh", "./docker-entrypoint.sh" ]
CMD [ "yarn", "start" ]
