FROM node:10.16.0-slim
WORKDIR /erxes-logger/
RUN chown -R node:node /erxes-logger
COPY --chown=node:node . /erxes-logger
USER node
EXPOSE 3800
ENTRYPOINT [ "node", "--max_old_space_size=8192", "dist" ]
