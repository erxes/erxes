FROM node:18.17.1-bookworm-slim
WORKDIR /erxes
RUN chown -R node:node /erxes
RUN apt-get update -y \
    && apt-get install -y curl tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --chown=node:node . .
USER node
ENTRYPOINT ["node", "--max-http-header-size=16384", "packages/core/src/index"]