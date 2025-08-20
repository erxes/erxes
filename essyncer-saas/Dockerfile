FROM golang:1.14.2

WORKDIR /essyncer-saas

ENV PATH="/essyncer-saas/build/linux-amd64:$PATH"

# Install dependencies and monstache
RUN apt-get update \
 && apt-get install -y unzip wget \
 && rm -rf /var/lib/apt/lists/* \
 && wget -q https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip \
 && unzip monstache-dfba1c2.zip \
 && rm monstache-dfba1c2.zip \
 && mkdir -p bin src

# Copy project files
COPY . .

# Enable Go modules and download dependencies
WORKDIR /essyncer-saas/src/syncer
ENV GO111MODULE=on
RUN go mod tidy

# Run the application
CMD ["go", "run", "main.go"]
