FROM node:18-alpine AS base
WORKDIR /exm/
RUN chown -R node:node /exm
COPY --chown=node:node . /exm
USER node
RUN yarn build
CMD [ "yarn", "start" ]
