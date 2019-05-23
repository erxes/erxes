FROM erxes/runner:latest
WORKDIR /erxes-api/
COPY . /erxes-api
RUN chown -R node:node /erxes-api
USER node
EXPOSE 3300
CMD ["node", "--max_old_space_size=8192", "--experimental-worker", "dist"]
