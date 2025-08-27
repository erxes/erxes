FROM golang:1.19-bullseye

WORKDIR /essyncer-saas/

ENV GOPATH=/essyncer-saas
ENV PATH="/essyncer-saas/build/linux-amd64:$PATH"
ENV GO111MODULE=off

# Update and install dependencies
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    vim \
    wget \
    unzip \
    git \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Install dep using pre-built binary (compatible with Go 1.19)
RUN curl -L -o /usr/local/bin/dep https://github.com/golang/dep/releases/download/v0.5.4/dep-linux-amd64 \
 && chmod +x /usr/local/bin/dep

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
