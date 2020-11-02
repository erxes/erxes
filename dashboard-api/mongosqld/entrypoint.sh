#!/bin/bash
CMD="${@}"
if [ -z "$1" ]
  then
    exec /mongobi/mongodb-bi-linux-x86_64-ubuntu1804-v2.13.4/bin/mongosqld --addr 0.0.0.0:3307 --mongo-uri $MONGO_URL
else
    exec /mongobi/mongodb-bi-linux-x86_64-ubuntu1804-v2.13.4/bin/mongosqld --addr 0.0.0.0:3307 --mongo-uri $MONGO_URLexec /mongobi/mongodb-bi-linux-x86_64-ubuntu1804-v2.13.4/bin/mongosqld --addr 0.0.0.0:3307 --mongo-uri $MONGO_URL $CMD
fi
