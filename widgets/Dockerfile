FROM node:10.16.0-slim
WORKDIR /erxes-widgets/
RUN chown -R node:node /erxes-widgets
COPY --chown=node:node . /erxes-widgets
USER node
EXPOSE 3200
ENTRYPOINT [ "node", "--max_old_space_size=8192", "dist" ]
