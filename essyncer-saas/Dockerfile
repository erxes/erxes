# --- Builder stage ---
FROM golang:1.22-bullseye

WORKDIR /essyncer/

ENV GOPATH=/essyncer
ENV PATH="/essyncer/build/linux-amd64:$PATH"

# Update
RUN apt-get update \
 && apt-get install -y vim \
 && apt-get install -y curl unzip \
 # monstache
 && wget -q --show-progress https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip \
 && unzip monstache-dfba1c2.zip \
 && rm monstache-dfba1c2.zip \
 && mkdir bin && mkdir src \
 && rm -rf /var/lib/apt/lists/*

COPY . .
COPY /src/syncer/go.mod /src/syncer/go.sum ./

RUN ls -lah \
 && cd src/syncer \
 && ls -lah \
 && go get github.com/joho/godotenv

CMD ["go", "run", "src/syncer/main.go"]
