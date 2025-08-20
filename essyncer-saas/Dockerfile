FROM golang:1.14.2

WORKDIR /essyncer-saas/

ENV GOPATH=/essyncer-saas
ENV PATH="/essyncer-saas/build/linux-amd64:$PATH"

# Update package sources to use archive repositories
RUN echo "deb http://archive.debian.org/debian buster main" > /etc/apt/sources.list && \
    echo "deb http://archive.debian.org/debian-security buster/updates main" >> /etc/apt/sources.list

# Update and install packages
RUN apt-get update --allow-insecure-repositories \
 && apt-get install -y --allow-unauthenticated vim unzip \
 # Install dep (go-dep package is no longer available, install directly)
 && curl https://raw.githubusercontent.com/golang/dep/master/install.sh | sh \
 # monstache
 && wget -q --show-progress https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip \
 && unzip monstache-dfba1c2.zip \
 && rm monstache-dfba1c2.zip \
 && mkdir bin && mkdir src \
 && rm -rf /var/lib/apt/lists/*

COPY . .

RUN cd src/syncer \
 && go get github.com/joho/godotenv \
 # Install MongoDB driver dependencies
 && go get go.mongodb.org/mongo-driver/mongo@v1.3.0 \
 && go get go.mongodb.org/mongo-driver/mongo/options \
 && dep ensure

CMD ["go", "run", "src/syncer/main.go"]