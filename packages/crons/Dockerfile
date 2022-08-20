FROM node:12.19-alpine
WORKDIR /crons
RUN chown -R node:node /crons \
 && apk add --no-cache tzdata
COPY --chown=node:node . /crons
USER node
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist/crons/src"]