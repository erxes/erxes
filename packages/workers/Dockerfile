FROM node:18.17.1-bookworm-slim
WORKDIR /workers
RUN chown -R node:node /workers
RUN apt-get update -y \
    && apt-get install -y curl tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --chown=node:node . /workers
USER node
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist/workers/src"]