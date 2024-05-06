FROM node:18.17.1-bookworm-slim
WORKDIR /erxes
RUN chown -R node:node /erxes
COPY --chown=node:node . .
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*
USER node
ENTRYPOINT ["node", "--max-http-header-size=16384", "packages/plugin-insurance-api/src/index"]
