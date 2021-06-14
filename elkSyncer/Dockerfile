FROM golang:1.14.2

WORKDIR /elkSyncer/

ENV GOPATH=/elkSyncer
ENV PATH="/elkSyncer/build/linux-amd64:$PATH"

# Update
RUN apt-get update \
 && apt-get install -y vim \
 && apt-get install -y go-dep unzip \
 # monstache
 && wget -q --show-progress https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip \
 && unzip monstache-dfba1c2.zip \
 && rm monstache-dfba1c2.zip \
 && mkdir bin && mkdir src \
 && rm -rf /var/lib/apt/lists/*

COPY . .

RUN cd src/syncer \
 && go get gopkg.in/olivere/elastic.v7 \
 && go get github.com/joho/godotenv \
 && dep ensure

CMD ["go", "run", "src/syncer/main.go"]
