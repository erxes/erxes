FROM golang:1.21

WORKDIR /essyncer/

ENV PATH="/essyncer/build/linux-amd64:$PATH"

# Install OS dependencies
RUN apt-get update \
 && apt-get install -y vim unzip wget \
 && rm -rf /var/lib/apt/lists/*

# Download monstache
RUN wget -q https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip \
 && unzip monstache-dfba1c2.zip \
 && rm monstache-dfba1c2.zip \
 && mkdir -p bin src

# Copy only go.mod and go.sum first for caching
COPY src/syncer/go.mod src/syncer/go.sum ./src/syncer/

# Download Go module dependencies
RUN cd src/syncer && go mod download

# Copy rest of the code
COPY . .

WORKDIR /essyncer/src/syncer

# Build binary
RUN go build -o essyncer main.go

CMD ["./essyncer"]
