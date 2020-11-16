FROM node:12.16-slim
RUN npm install -g cubejs-cli
WORKDIR /erxes-dashboard-api
RUN chown -R node:node /erxes-dashboard-api
COPY --chown=node:node . /erxes-dashboard-api
USER node
EXPOSE 4300
ENTRYPOINT ["node", "--max_old_space_size=8192", "index.js"]
