FROM golang:1.21

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y vim unzip && \
    rm -rf /var/lib/apt/lists/*

# Download monstache
RUN wget -q https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip && \
    unzip monstache-dfba1c2.zip && \
    rm monstache-dfba1c2.zip && \
    mv monstache /usr/local/bin/

# Enable Go modules
ENV GO111MODULE=on

# Copy entire project
COPY . .

# Initialize Go modules if go.mod doesn't exist, then download dependencies
RUN if [ ! -f go.mod ]; then go mod init essyncer-saas; fi && \
    go mod download && \
    go mod tidy

# Set the working directory for the application
WORKDIR /app/src/syncer

# Use go run as you originally had
CMD ["go", "run", "main.go"]