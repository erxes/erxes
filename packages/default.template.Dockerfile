FROM node:18.20.4-bookworm-slim
WORKDIR /erxes
RUN chown -R node:node /erxes
COPY --chown=node:node . .
USER node
ENTRYPOINT ["node", "--max-http-header-size=16384", "packages/${folderName}/src/index"]