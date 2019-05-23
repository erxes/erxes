FROM node:10-slim
WORKDIR /erxes-widgets/
COPY prod /erxes-widgets
RUN chown -R node:node /erxes-widgets
USER node
EXPOSE 3200
CMD ["node", "--max_old_space_size=8192", "dist"]
