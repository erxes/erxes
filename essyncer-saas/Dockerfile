FROM golang:1.14.2

WORKDIR /elkSyncer/

ENV GOPATH=/elkSyncer
ENV PATH="/elkSyncer/build/linux-amd64:$PATH"

# Update
RUN apt-get update \
 && apt-get install -y vim \
 && apt-get install -y go-dep unzip \
 # monstache
 && wget -q --show-progress https://github.com/erxes/monstache/archive/rel6.zip \
 && unzip rel6.zip \
 && rm rel6.zip \
 && cp -r monstache-rel6/build . \
 && rm -rf monstache-rel6 \
 && mkdir bin && mkdir src \
 && rm -rf /var/lib/apt/lists/*

COPY . .

RUN cd src/syncer \
 && go get github.com/joho/godotenv \
 && dep ensure

CMD ["go", "run", "src/syncer/main.go"]