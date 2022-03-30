FROM node:12.19-alpine
WORKDIR /dashboard
RUN chown -R node:node /dashboard \
 && apk add --no-cache tzdata
COPY --chown=node:node . /dashboard
USER node
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist/dashboard/src"]