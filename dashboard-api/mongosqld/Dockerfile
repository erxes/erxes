FROM ubuntu:18.04
WORKDIR /mongobi
RUN apt-get update \
 && apt-get install -qq wget openssl libgssapi-krb5-2 \
 && wget https://info-mongodb-com.s3.amazonaws.com/mongodb-bi/v2/mongodb-bi-linux-x86_64-ubuntu1804-v2.13.4.tgz \
 && tar -zxf mongodb-bi-linux-x86_64-ubuntu1804-v2.13.4.tgz \
 && rm mongodb-bi-linux-x86_64-ubuntu1804-v2.13.4.tgz \
 && rm -rf /var/lib/apt/lists/*
COPY entrypoint.sh .
ENTRYPOINT ["/mongobi/entrypoint.sh"]
