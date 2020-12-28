FROM node:12.19-alpine
WORKDIR /erxes-logger/
RUN chown -R node:node /erxes-logger \
 && apk add --no-cache tzdata
COPY --chown=node:node . /erxes-logger
USER node
EXPOSE 3800
ENTRYPOINT [ "node", "--max_old_space_size=8192", "dist" ]
