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

# Install dep (compatible version for Go 1.19)
RUN go install github.com/golang/dep/cmd/dep@v0.5.4

# Download and install monstache
RUN wget -q --show-progress https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip \
 && unzip monstache-dfba1c2.zip \
 && rm monstache-dfba1c2.zip \
 && mkdir -p bin src

COPY . .

# Install Go dependencies using dep
RUN cd src/syncer \
 && dep ensure

CMD ["go", "run", "src/syncer/main.go"]
