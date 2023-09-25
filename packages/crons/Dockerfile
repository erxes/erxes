FROM node:18.17.1-bookworm-slim
WORKDIR /crons
RUN chown -R node:node /crons
RUN apt-get update -y \
    && apt-get install -y tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --chown=node:node . /crons
USER node
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist/crons/src"]