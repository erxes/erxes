FROM node:14.20-alpine
WORKDIR /workers
RUN chown -R node:node /workers \
 && apk add --no-cache tzdata
COPY --chown=node:node . /workers
USER node
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist/workers/src"]