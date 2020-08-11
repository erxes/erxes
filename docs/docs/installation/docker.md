---
id: docker
title: Docker
---

This steps explain how to install Erxes on Docker Hub, to do it, follow the instructions.

[erxes on docker hub](https://hub.docker.com/u/erxes/)

## Prerequisites

### Install docker

(Ubuntu variant)

#### Uninstall old versions

`sudo apt-get remove docker docker-engine docker.io containerd runc`

#### SET UP THE REPOSITORY

1. Update the apt package index:

```sh
sudo apt-get update
```

2. Install packages to allow apt to use a repository over HTTPS:

```sh
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
```

3. Add Docker’s official GPG key:

```sh
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

4. Use the following command to set up the stable repository.

```sh
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
```

#### INSTALL DOCKER CE

1. Update the `apt` package index.

```sh
sudo apt-get update
```

2. Install the _latest version_ of Docker CE and containerd.

```sh
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

3. Verify that Docker CE is installed correctly by running the `hello-world` image.

```sh
sudo docker run hello-world
```

4. Optional: If you would like to use Docker as a non-root user, you should now consider adding your user to the “docker” group with something like:

```sh
sudo usermod -aG docker your-user
```

_Don't forget to restart shell to take effect._

Official Docker documentation: https://docs.docker.com/install/

### Install docker compose

(Linux variant)

1. Run this command to download the current stable release of Docker Compose:

```sh
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

2. Apply executable permissions to the binary:

```sh
sudo chmod +x /usr/local/bin/docker-compose
```

**Note**: If the command `docker-compose` fails after installation, check your path. You can also create a symbolic link to `/usr/bin` or any other directory in your path.

3. Test the installation.

```sh
$ docker-compose --version
docker-compose version 1.24.1, build 01110ad01
```

Official Docker compose documentation: https://docs.docker.com/compose/install/


## Install erxes

1. Create a new directory somewhere on your machine
2. Save the following code as `docker-compose.yml` file.
3. Run `docker-compose up -d` (To stop: `docker-compose down`)
4. Run `docker exec -it erxes-api yarn initProject` command to create default admin account for you.
5. Go to `localhost:3000` on your browser, and you're ready to login.

```
(username: admin@erxes.io , password: auto generated password)
```

### Default ports
_Must be published to host machine network_
* erxes main frontend app will run on port 3000
* erxes-widgets will run on port 3200
* erxes-api will run on port 3300
* erxes-integrations will run on port 3400

_Should not published to host machine network, only used internally_
* erxes-api (cron) will run on port 3600
* erxes-api (worker) will run on port 3700
* erxes-logger will run on port 3800
* redis server will run on port 6379
* mongodb server will run on port 27017
* rabbitmq server will run on port 5672

_If these ports aren't available for you, you can always change it. But don't forget to change related ENV settings._

### docker-compose.yml file

<aside class="notice">

**Note:** Following ENVs are configured for localhost only.
All erxes version have to changed the latest version.
The latest version [**release**](https://github.com/erxes/erxes/releases) source code.

</aside>


```yaml
version: "2.1"
services:
  erxes:
    image: erxes/erxes:0.14.1
    container_name: erxes
    restart: unless-stopped
    environment:
      # erxes
      REACT_APP_CDN_HOST: http://localhost:3200
      REACT_APP_API_URL: http://localhost:3300
      REACT_APP_API_SUBSCRIPTION_URL: ws://localhost:3300/subscriptions
      NGINX_HOST: localhost
    ports:
      - "3000:80"
    networks:
      - erxes-net

  erxes-api:
    image: erxes/erxes-api:0.14.1
    container_name: erxes-api
    restart: unless-stopped
    environment:
      # erxes-api
      PORT: "3300"
      NODE_ENV: production
      DEBUG: "erxes-api:*"
      JWT_TOKEN_SECRET: token
      # public urls
      MAIN_APP_DOMAIN: http://localhost:3000
      WIDGETS_DOMAIN: http://localhost:3200
      INTEGRATIONS_API_DOMAIN: http://localhost:3400
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes
      # Redis
      REDIS_HOST: redis
      REDIS_PORT: "6379"
      REDIS_PASSWORD: ""
      # RabbitMQ
      RABBITMQ_HOST: "amqp://guest:guest@rabbitmq:5672/erxes"
    ports:
      - "3300:3300"
    depends_on:
      mongo:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - erxes-net

  erxes-crons:
    image: erxes/erxes-api:0.14.1
    container_name: erxes-crons
    entrypoint: ["node", "--max_old_space_size=8192", "dist/cronJobs"]
    restart: unless-stopped
    environment:
      # erxes-crons
      PORT_CRONS: "3600"
      NODE_ENV: production
      PROCESS_NAME: crons
      DEBUG: "erxes-crons:*"
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes
      # Redis
      REDIS_HOST: redis
      REDIS_PORT: "6379"
      REDIS_PASSWORD: ""
      # RabbitMQ
      RABBITMQ_HOST: "amqp://guest:guest@rabbitmq:5672/erxes"
    depends_on:
      mongo:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - erxes-net

  erxes-workers:
    image: erxes/erxes-api:0.14.1
    container_name: erxes-workers
    entrypoint: ["node", "--max_old_space_size=8192", "--experimental-worker", "dist/workers"]
    restart: unless-stopped
    environment:
      # erxes-workers
      PORT_WORKERS: "3700"
      JWT_TOKEN_SECRET: token
      NODE_ENV: production
      DEBUG: "erxes-workers:*"
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes
      # Redis
      REDIS_HOST: redis
      REDIS_PORT: "6379"
      REDIS_PASSWORD: ""
      # RabbitMQ
      RABBITMQ_HOST: "amqp://guest:guest@rabbitmq:5672/erxes"
    depends_on:
      mongo:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - erxes-net

  erxes-widgets:
    image: erxes/erxes-widgets:0.14.1
    container_name: erxes-widgets
    restart: unless-stopped
    environment:
      # erxes-widgets
      PORT: "3200"
      ROOT_URL: http://localhost:3200
      API_URL: http://localhost:3300
      API_SUBSCRIPTIONS_URL: ws://localhost:3300/subscriptions
    ports:
      - "3200:3200"
    networks:
      - erxes-net

  erxes-integrations:
    image: erxes/erxes-integrations:0.10.3
    container_name: erxes-integrations
    restart: unless-stopped
    environment:
      PORT: "3400"
      NODE_ENV: production
      DEBUG: "erxes-integrations:*"
      # public urls
      DOMAIN: http://localhost:3400
      MAIN_APP_DOMAIN: http://localhost:3000
      MAIN_API_DOMAIN: http://localhost:3300
      # non public urls
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes_integrations
      # RabbitMQ
      RABBITMQ_HOST: "amqp://guest:guest@rabbitmq:5672/erxes"
      # Redis
      REDIS_HOST: redis
      REDIS_PORT: "6379"
      REDIS_PASSWORD: ""
    ports:
      - "3400:3400"
    depends_on:
      mongo:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - erxes-net

  erxes-logger:
    image: erxes/erxes-logger:0.10.0
    container_name: erxes-logger
    restart: unless-stopped
    environment:
      PORT: "3800"
      DEBUG: "erxes-logs:*"
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes_logs
      # RabbitMQ
      RABBITMQ_HOST: "amqp://guest:guest@rabbitmq:5672/erxes"
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - erxes-net

  erxes-engages:
    image: erxes/erxes-engages-email-sender:0.10.0
    container_name: erxes-engages
    restart: unless-stopped
    environment:
      PORT: "3900"
      NODE_ENV: production
      DEBUG: "erxes-engages:*"
      # public urls
      MAIN_API_DOMAIN: http://localhost:3300
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes_engages
      # RabbitMQ
      RABBITMQ_HOST: "amqp://guest:guest@rabbitmq:5672/erxes"
      # Redis
      REDIS_HOST: redis
      REDIS_PORT: "6379"
      REDIS_PASSWORD: ""
    depends_on:
      mongo:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - erxes-net

  redis:
    image: redis:5.0.5
    container_name: redis
    restart: unless-stopped
    healthcheck:
      timeout: 2s
      interval: 2s
      retries: 200
      test:
        - "CMD"
        - "bash"
        - "-c"
        - "exec 3<> /dev/tcp/127.0.0.1/6379 && echo PING >&3 && head -1 <&3 | grep PONG"
    networks:
      - erxes-net
    # Redis data will be saved into ./redis-data folder.
    volumes:
      - ./redis-data:/data

  mongo:
    image: mongo:3.6.13
    container_name: mongo
    restart: unless-stopped
    healthcheck:
      test: echo 'db.stats().ok' | mongo localhost:27017/test --quiet
      interval: 2s
      timeout: 2s
      retries: 200
    networks:
      - erxes-net
    # MongoDB data will be saved into ./mongo-data folder.
    volumes:
      - ./mongo-data:/data/db

  rabbitmq:
    image: rabbitmq:3.7.17-management
    container_name: rabbitmq
    restart: unless-stopped
    hostname: rabbitmq
    environment:
      RABBITMQ_DEFAULT_VHOST: erxes
    healthcheck:
      timeout: 2s
      interval: 2s
      retries: 200
      test:
        - "CMD"
        - "rabbitmqctl"
        - "status"
    networks:
      - erxes-net
    # RabbitMQ data will be saved into ./rabbitmq-data folder.
    volumes:
      - ./rabbitmq-data:/var/lib/rabbitmq

networks:
  erxes-net:
    driver: bridge
```

If you have trouble running erxes docker images, feel free to open [issue](https://github.com/erxes/erxes/issues).
