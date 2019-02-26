FROM node:8-slim
WORKDIR /erxes-widgets/
COPY prod /erxes-widgets
RUN chown -R node:node /erxes-widgets
USER node
EXPOSE 3200
CMD ["yarn", "start"]
