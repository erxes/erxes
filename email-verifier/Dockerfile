FROM node:12.18-slim
WORKDIR /erxes-email-verifier
RUN chown -R node:node /erxes-email-verifier
COPY --chown=node:node . /erxes-email-verifier
USER node
EXPOSE 4100
ENTRYPOINT ["node", "--max_old_space_size=8192", "dist"]
