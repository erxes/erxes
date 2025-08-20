FROM golang:1.21-alpine

WORKDIR /app

RUN apk update && \
    apk add --no-cache vim unzip && \
    rm -rf /var/cache/apk/*

# Download and extract monstache correctly
RUN wget -q https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip -O /tmp/monstache.zip && \
    unzip /tmp/monstache.zip -d /tmp/ && \
    mv /tmp/build/linux-amd64/monstache /usr/local/bin/ && \
    rm -rf /tmp/monstache.zip /tmp/build && \
    chmod +x /usr/local/bin/monstache

ENV GO111MODULE=on
ENV GOPROXY=https://proxy.golang.org,direct
ENV GOSUMDB=sum.golang.org

COPY go.mod go.sum ./

RUN go mod download -x && \
    go mod verify

COPY . .

WORKDIR /app/src/syncer

# Use go run as you originally wanted
CMD ["go", "run", "main.go"]