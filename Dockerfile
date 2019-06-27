FROM node:10.16.0-slim
WORKDIR /erxes-integrations
COPY --chown=node:node . /erxes-integrations
USER node
EXPOSE 3400
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist"]
