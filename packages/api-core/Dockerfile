FROM node:12.19-alpine
WORKDIR /erxes-core
RUN chown -R node:node /erxes-core \
 && apk add --no-cache tzdata
COPY --chown=node:node . /erxes-core
USER node
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist"]