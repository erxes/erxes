FROM golang:1.21-bookworm
WORKDIR /essyncer-saas/

ENV GOPATH=/essyncer-saas
ENV PATH="/essyncer-saas/build/linux-amd64:$PATH"

# Update and install dependencies
RUN apt-get update \
 && apt-get install -y vim unzip \
 # monstache
 && wget -q --show-progress https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip \
 && unzip monstache-dfba1c2.zip \
 && rm monstache-dfba1c2.zip \
 && mkdir bin && mkdir src \
 && rm -rf /var/lib/apt/lists/*

COPY . .

# Use Go modules instead of dep (dep is deprecated)
RUN cd src/syncer \
 && go mod init \
 && go get github.com/joho/godotenv \
 && go get go.mongodb.org/mongo-driver/mongo \
 && go get go.mongodb.org/mongo-driver/mongo/options \
 && go mod tidy

CMD ["go", "run", "src/syncer/main.go"]