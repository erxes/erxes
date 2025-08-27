FROM golang:1.14.2

WORKDIR /essyncer-saas/

ENV GOPATH=/essyncer-saas
ENV PATH="/essyncer-saas/build/linux-amd64:$PATH"

# Update
RUN apt-get update \
 && apt-get install -y vim \
 && apt-get install -y go-dep unzip wget \
 # monstache
 && wget -q --show-progress https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip \
 && unzip monstache-dfba1c2.zip \
 && rm monstache-dfba1c2.zip \
 && mkdir bin && mkdir src \
 && rm -rf /var/lib/apt/lists/*

COPY . .

RUN dep ensure -v


CMD ["go", "run", "src/syncer/main.go"]
