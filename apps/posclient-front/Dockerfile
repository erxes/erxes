FROM node:22-alpine AS base
RUN apk upgrade --no-cache
WORKDIR /erxespos/
RUN chown -R node:node /erxespos
COPY --chown=node:node . /erxespos
USER node
RUN npm run build
ENTRYPOINT [ "sh", "./docker-entrypoint.sh" ]
CMD [ "npm", "start" ]
