FROM golang:1.14.2

WORKDIR /essyncer-saas/

ENV GOPATH=/essyncer-saas
ENV PATH="/essyncer-saas/build/linux-amd64:$PATH"

# Install only unzip which is available in the base image
RUN apt-get install -y unzip

# Download monstache
RUN wget -q https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip && \
    unzip monstache-dfba1c2.zip && \
    rm monstache-dfba1c2.zip && \
    mkdir -p bin src

# Install dep
RUN go get -u github.com/golang/dep/cmd/dep

COPY . .

# FIRST manually get the missing MongoDB driver, THEN run dep ensure
RUN cd src/syncer && \
    go get go.mongodb.org/mongo-driver/mongo && \
    go get go.mongodb.org/mongo-driver/mongo/options && \
    /essyncer-saas/bin/dep ensure

CMD ["go", "run", "src/syncer/main.go"]