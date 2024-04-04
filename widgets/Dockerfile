FROM node:18.17.1-bookworm-slim
WORKDIR /erxes-widgets/
RUN chown -R node:node /erxes-widgets
RUN apt-get update -y \
    && apt-get install -y curl tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --chown=node:node . /erxes-widgets
USER node
EXPOSE 3200
ENTRYPOINT [ "node", "--max_old_space_size=8192", "dist" ]
