FROM erxes/runner:latest
WORKDIR /erxes-api/
COPY --chown=node:node . /erxes-api
USER node
EXPOSE 3300
ENTRYPOINT [ "node", "--max_old_space_size=8192", "dist" ]