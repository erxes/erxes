FROM golang:1.21

WORKDIR /essyncer/

ENV GOPATH=/essyncer
ENV PATH="/essyncer/build/linux-amd64:$PATH"

# Update and install dependencies
RUN apt-get update \
 && apt-get install -y vim unzip \
 && rm -rf /var/lib/apt/lists/*

# Download monstache
RUN wget -q https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip \
 && unzip monstache-dfba1c2.zip \
 && rm monstache-dfba1c2.zip \
 && mkdir -p bin src

COPY . .

# Install Go dependencies
RUN cd src/syncer \
 && go get github.com/joho/godotenv \
 && go get go.mongodb.org/mongo-driver/mongo \
 && go get go.mongodb.org/mongo-driver/bson \
 && go get go.mongodb.org/mongo-driver/bson/primitive \
 && go get go.mongodb.org/mongo-driver/mongo/options

CMD ["go", "run", "src/syncer/main.go"]