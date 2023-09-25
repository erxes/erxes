FROM node:18.17.1-bookworm-slim
RUN npm install -g cubejs-cli
WORKDIR /dashboard
RUN chown -R node:node /dashboard
RUN apt-get update -y \
    && apt-get install -y tzdata \
    && rm -rf /var/lib/apt/lists/*
COPY --chown=node:node . /dashboard
USER node
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist/dashboard/src"]