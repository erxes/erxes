ARG BASE_IMAGE
ARG DEBIAN_FRONTEND=noninteractive
FROM $BASE_IMAGE
RUN apt-get update && \
    apt-get install --no-install-recommends -yq gnupg2 wget ca-certificates python build-essential && \
    wget -qO - https://www.mongodb.org/static/pgp/server-3.6.asc | apt-key add - && \
    echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/3.6 main" | tee /etc/apt/sources.list.d/mongodb-org-3.6.list && \
    apt-get update && \
    apt-get install --no-install-recommends -yq mongodb-org-shell=3.6.18 mongodb-org-tools=3.6.18 && \
    rm -rf /var/lib/apt/lists/*
