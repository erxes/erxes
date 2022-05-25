FROM node:12.19-alpine
WORKDIR /client-portal/
RUN chown -R node:node /client-portal
COPY --chown=node:node . /client-portal
USER node
RUN yarn build
EXPOSE 4300
ENTRYPOINT [ "sh", "./docker-entrypoint.sh" ]
CMD [ "yarn", "start" ]