FROM node:14.20-alpine
RUN npm install -g cubejs-cli
WORKDIR /dashboard
RUN chown -R node:node /dashboard \
 && apk add --no-cache tzdata
COPY --chown=node:node . /dashboard
USER node
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist/dashboard/src"]