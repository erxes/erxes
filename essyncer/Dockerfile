FROM golang:1.21.4

WORKDIR /essyncer/

# Install necessary tools
RUN apt-get update && \
    apt-get install -y vim unzip && \
    rm -rf /var/lib/apt/lists/*

# Download and install monstache
RUN wget -q --show-progress https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip && \
    unzip monstache-dfba1c2.zip && \
    rm monstache-dfba1c2.zip && \
    mkdir -p bin

# Copy source code
COPY . .

# Initialize Go modules and download dependencies
RUN cd src/syncer && \
    go mod init syncer && \
    go mod tidy && \
    go mod download

CMD ["go", "run", "src/syncer/main.go"]