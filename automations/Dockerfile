FROM node:12.19-alpine
WORKDIR /erxes-automations
RUN chown -R node:node /erxes-automations \
 && apk add --no-cache tzdata
COPY --chown=node:node . /erxes-automations
USER node
EXPOSE 4000
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist"]
