# Start from fresh debian stretch & add some tools
# note: rsyslog & curl (openssl,etc) needed as dependencies too
FROM debian:stretch
RUN apt update
RUN apt install -y rsyslog nano curl

# Download BI Connector to /mongosqld
WORKDIR /tmp
RUN curl https://info-mongodb-com.s3.amazonaws.com/mongodb-bi/v2/mongodb-bi-linux-x86_64-debian92-v2.14.0.tgz -o bi-connector.tgz && \
    tar -xvzf bi-connector.tgz && rm bi-connector.tgz && \
    mv /tmp/mongodb-bi-linux-x86_64-debian92-v2.14.0 /mongosqld

# Setup default environment variables
ENV MONGODB_HOST mongodb
ENV MONGODB_PORT 27017
ENV MONGO_USERNAME ''
ENV MONGO_PASSWORD ''
ENV LISTEN_PORT 3307

# Start Everything
# note: we need to use sh -c "command" to make rsyslog running as deamon too
RUN service rsyslog start
CMD sh -c "/mongosqld/bin/mongosqld --logPath /var/log/mongosqld.log --mongo-uri mongodb://$MONGODB_HOST:$MONGODB_PORT/?connect=direct&readPreference=secondary --mongo-username $MONGO_USERNAME --mongo-password $MONGO_PASSWORD --auth  --addr 0.0.0.0:3307  --sslMode requireSSL --sslPEMKeyFile /mongosqld/mongo.pem"