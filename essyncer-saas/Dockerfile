FROM golang:1.19-bullseye

WORKDIR /essyncer-saas/

ENV GOPATH=/essyncer-saas
ENV PATH="/essyncer-saas/build/linux-amd64:$PATH"

# Update and install dependencies
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    vim \
    wget \
    unzip \
    git \
 && rm -rf /var/lib/apt/lists/*

# Download and install monstache
RUN wget -q --show-progress https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip \
 && unzip monstache-dfba1c2.zip \
 && rm monstache-dfba1c2.zip \
 && mkdir -p bin src

COPY . .

# Install Go dependencies and build
RUN cd src/syncer \
 && go mod init syncer \
 && go get github.com/joho/godotenv \
 && go get github.com/olivere/elastic \
 && go get go.mongodb.org/mongo-driver/mongo \
 && go get go.mongodb.org/mongo-driver/bson \
 && go get go.mongodb.org/mongo-driver/bson/primitive \
 && go get go.mongodb.org/mongo-driver/mongo/options


CMD ["go", "run", "src/syncer/main.go"]
