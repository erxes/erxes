FROM node:12.19-alpine
WORKDIR /exm/
RUN chown -R node:node /exm
COPY --chown=node:node . /exm
USER node
ENTRYPOINT [ "sh", "./docker-entrypoint.sh" ]
CMD [ "yarn", "start" ]