FROM node:12.16.3-slim
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y gnupg2 && \
    apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5 && \
    echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/3.6 main" | tee /etc/apt/sources.list.d/mongodb-org-3.6.list
RUN apt-get update && \
    apt-get install -y \
    rsync python build-essential mongodb-org-shell mongodb-org-tools && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /erxes-api/
RUN chown -R node:node /erxes-api
COPY --chown=node:node . /erxes-api
USER node
EXPOSE 3300
ENTRYPOINT [ "node", "--max_old_space_size=8192", "dist" ]
