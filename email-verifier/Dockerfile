FROM node:12.19-alpine
WORKDIR /erxes-email-verifier
RUN chown -R node:node /erxes-email-verifier \
 && apk add --no-cache tzdata
COPY --chown=node:node . /erxes-email-verifier
USER node
EXPOSE 4100
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist"]
