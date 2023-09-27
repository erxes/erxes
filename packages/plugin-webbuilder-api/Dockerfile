FROM node:18.17.1-bookworm-slim
WORKDIR /erxes-plugin-api
RUN chown -R node:node /erxes-plugin-api
RUN apt-get update -y \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
COPY --chown=node:node . /erxes-plugin-api
USER node
ENTRYPOINT ["node", "--max_old_space_size=8192", "--max-http-header-size=16384", "dist/main/.erxes/src"]