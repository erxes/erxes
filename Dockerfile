FROM erxes/runner:latest
WORKDIR /erxes-api/
COPY . /erxes-api
RUN chown -R node:node /erxes-api
USER node
EXPOSE 3300
ENTRYPOINT [ "sh", "/erxes-api/start.sh" ]
