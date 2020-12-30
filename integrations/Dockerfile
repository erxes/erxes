FROM node:12.19-alpine
WORKDIR /erxes-integrations
RUN chown -R node:node /erxes-integrations \
 && apk add --no-cache tzdata
COPY --chown=node:node . /erxes-integrations
USER node
EXPOSE 3400
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist"]
