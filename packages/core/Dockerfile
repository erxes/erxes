FROM node:18.17.1-bookworm-slim
WORKDIR /core-api
RUN chown -R node:node /core-api
RUN apt-get update -y \
    && apt-get install -y curl tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --chown=node:node . /core-api
USER node
ENTRYPOINT ["node", "--max-http-header-size=16384", "dist/core/src"]