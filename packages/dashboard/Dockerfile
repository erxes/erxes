FROM node:12.16-slim
RUN npm install -g cubejs-cli
WORKDIR /dashboard
RUN chown -R node:node /dashboard
COPY --chown=node:node . /dashboard
USER node
EXPOSE 4300
ENTRYPOINT ["node", "--max_old_space_size=8192", "index.js"]
