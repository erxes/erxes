FROM node:12.16-slim
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install --no-install-recommends -yq gnupg2 wget ca-certificates && \
    wget -qO - https://www.mongodb.org/static/pgp/server-3.6.asc | apt-key add - && \
    echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/3.6 main" | tee /etc/apt/sources.list.d/mongodb-org-3.6.list && \
    apt-get update && \
    apt-get install --no-install-recommends -yq python build-essential mongodb-org-shell mongodb-org-tools && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /erxes-api/
RUN chown -R node:node /erxes-api
COPY --chown=node:node . /erxes-api
USER node
EXPOSE 3300
ENTRYPOINT [ "node", "--max_old_space_size=8192", "dist" ]
