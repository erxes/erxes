FROM node:18.17.1-bookworm-slim
WORKDIR /erxes
RUN chown -R node:node /erxes
COPY --chown=node:node . .
USER node
ENTRYPOINT ["sh", "./puppeteer.sh"]