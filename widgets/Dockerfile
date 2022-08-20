FROM node:12.19-alpine
WORKDIR /erxes-widgets/
RUN chown -R node:node /erxes-widgets \
 && apk add --no-cache tzdata
COPY --chown=node:node . /erxes-widgets
USER node
EXPOSE 3200
ENTRYPOINT [ "node", "--max_old_space_size=8192", "dist" ]
