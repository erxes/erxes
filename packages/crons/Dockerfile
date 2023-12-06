FROM node:18.17.1-bookworm-slim
WORKDIR /erxes
RUN chown -R node:node /erxes
RUN apt-get update -y \
    && apt-get install -y tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --chown=node:node . .
USER node
ENTRYPOINT ["node", "--max_old_space_size=8192", "packages/crons/src/index"]