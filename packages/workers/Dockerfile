FROM node:18.17.1-bookworm-slim
WORKDIR /erxes
RUN chown -R node:node /erxes
RUN apt-get update -y \
    && apt-get install -y curl tzdata \
    && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y poppler-utils

COPY --chown=node:node . .
USER node
ENTRYPOINT ["node", "--max_old_space_size=8192", "packages/workers/src"]