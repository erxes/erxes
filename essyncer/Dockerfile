FROM golang:1.14.2

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

# Just run go get which will pull all dependencies from imports
RUN cd src/syncer && go get -d -v .

CMD ["go", "run", "src/syncer/main.go"]