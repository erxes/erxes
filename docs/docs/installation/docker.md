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
sudo curl -L "https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

2. Apply executable permissions to the binary:

```sh
sudo chmod +x /usr/local/bin/docker-compose
```

**Note**: If the command `docker-compose` fails after installation, check your path. You can also create a symbolic link to `/usr/bin` or any other directory in your path.

3. Test the installation.

```sh
$ docker-compose --version
docker-compose version 1.26.2, build 1110ad01
```

Official Docker compose documentation: https://docs.docker.com/compose/install/

## Install erxes

1. Go to your desired location

```bash
  cd 'path_to'
```

2. Save the `docker-compose.yml` file.
3. Run the following command in your shell:

```bash
mkdir elasticsearch-data && chown 1000:1000 elasticsearch-data
```

- elasticsearch container migth fail to start due to permission

4. Run the following to start containers

```bash
docker-compose up -d
```

- To stop the containers:

```bash
docker-compose down
```


5. Now you may visit `localhost:3000` and log in with your admin account.

### Default ports

_Must be published to host machine network_

- erxes main frontend app will run on port 3000
- erxes-widgets will run on port 3200
- erxes-api will run on port 3300
- erxes-integrations will run on port 3400
- erxes-dashboard-api will run on port 4300
- erxes-dashboard-front will run on port 4400

_Should not published to host machine network, only used internally_

- erxes-api (cron) will run on port 3600
- erxes-api (worker) will run on port 3700
- erxes-logger will run on port 3800
- redis server will run on port 6379
- mongodb server will run on port 27017
- rabbitmq server will run on port 5672

_If these ports aren't available for you, you can always change it. But don't forget to change related ENV variables locate in docker-compose.yml file._

### docker-compose.yml file

<aside class="notice">

**Note:** Following ENVs are configured for localhost only, if you want to use erxes for certain domain please replace it with the domain.
All erxes version have to changed the latest version.
The latest version [**release**](https://github.com/erxes/erxes/releases) source code.

</aside>

```yaml
version: "2.4"
services:
  erxes:
    image: erxes/erxes:master
    container_name: erxes
    restart: unless-stopped
    environment:
      REACT_APP_CDN_HOST: http://localhost:3200
      REACT_APP_API_URL: http://localhost:3300
      REACT_APP_API_SUBSCRIPTION_URL: ws://localhost:3300/subscriptions
      REACT_APP_DASHBOARD_URL: http://localhost:4200
      NGINX_HOST: localhost
    ports:
      - "127.0.0.1:3000:80"
    networks:
      - erxes-net

  erxes-api:
    image: erxes/erxes-api:master
    container_name: erxes-api
    restart: unless-stopped
    environment:
      # erxes-api
      PORT: "3300"
      NODE_ENV: production
      HTTPS: "true"
      DEBUG: "erxes-api:*"
      # public urls
      MAIN_APP_DOMAIN: http://localhost:3000
      # non public urls
      LOGS_API_DOMAIN: http://erxes-logger:3800
      ENGAGES_API_DOMAIN: http://erxes-engages:3900
      WORKERS_API_DOMAIN: http://erxes-workers:3700
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes
      # Elasticsearch
      ELASTICSEARCH_URL: http://elasticsearch:9200
      # Redis
      REDIS_HOST: "redis"
      REDIS_PORT: "6379"
      REDIS_PASSWORD: "erxes"
      # RabbitMQ
      RABBITMQ_HOST: "amqp://rabbitmq:5672/erxes"
      JWT_TOKEN_SECRET: "erxes"
      # Email verifier
      EMAIL_VERIFIER_ENDPOINT: "https://email-verifier.erxes.io"
      # Dashboard domain
      DASHBOARD_DOMAIN: http://localhost:4200
      HELPERS_DOMAIN: https://helper.erxes.io
    ports:
      - "127.0.0.1:3300:3300"
    networks:
      - erxes-net

  erxes-crons:
    image: erxes/erxes-api:master
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
      # RabbitMQ
      RABBITMQ_HOST: "amqp://rabbitmq:5672/erxes"  
      ELASTICSEARCH_URL: http://elasticsearch:9200
    ports:
      - "127.0.0.1:3600:3600"
    networks:
      - erxes-net

  erxes-workers:
    image: erxes/erxes-api:master 
    container_name: erxes-workers
    entrypoint: ["node", "--max_old_space_size=8192", "--experimental-worker", "dist/workers"]
    restart: unless-stopped
    environment:
      # erxes-workers
      PORT_WORKERS: "3700"
      NODE_ENV: production
      DEBUG: "erxes-workers:*"
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes
      # Redis
      REDIS_HOST: "redis"
      REDIS_PORT: "6379"
      REDIS_PASSWORD: "erxes"
      JWT_TOKEN_SECRET: "erxes"
      # RabbitMQ
      RABBITMQ_HOST: "amqp://rabbitmq:5672/erxes"
      # Elasticsearch
      ELASTICSEARCH_URL: http://elasticsearch:9200
    ports:
      - "127.0.0.1:3700:3700"
    networks:
      - erxes-net

  erxes-widgets:
    image: erxes/erxes-widgets:master
    container_name: erxes-widgets
    restart: unless-stopped
    environment:
      # erxes widgets
      PORT: "3200"
      ROOT_URL: http://localhost:3200
      API_URL: http://localhost:3300
      API_SUBSCRIPTIONS_URL: ws://localhost:3300/subscriptions
    ports:
      - "127.0.0.1:3200:3200"
    networks:
      - erxes-net

  erxes-integrations:
    image: erxes/erxes-integrations:master
    container_name: erxes-integrations
    restart: unless-stopped
    environment:
      PORT: "3400"
      NODE_ENV: production
      DEBUG: "erxes-integrations:*"
      # public urls
      DOMAIN: http://localhost:3400
      MAIN_APP_DOMAIN: http://localhost
      MAIN_API_DOMAIN: http://localhost:3300
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes
      # RabbitMQ
      RABBITMQ_HOST: "amqp://rabbitmq:5672/erxes"
      # Redis
      REDIS_HOST: "redis"
      REDIS_PORT: "6379"
      REDIS_PASSWORD: "erxes"
      # Dashboard
      ENDPOINT_URL: https://enterprise.erxes.io
    ports:
      - "127.0.0.1:3400:3400"
    networks:
      - erxes-net
   
  erxes-logger:
    image: erxes/erxes-logger:master
    container_name: erxes-logger
    restart: unless-stopped
    environment:
      PORT: "3800"
      DEBUG: "erxes-logs:*"
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes
      # RabbitMQ
      RABBITMQ_HOST: "amqp://rabbitmq:5672/erxes"
    networks:
      - erxes-net

  erxes-engages:
    image: erxes/erxes-engages-email-sender:master
    container_name: erxes-engages
    restart: unless-stopped
    environment:
      PORT: "3900"
      NODE_ENV: production
      DEBUG: "erxes-engages:*"
      # public urls
      MAIN_API_DOMAIN: http://localhost:3300
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes
      # Redis
      REDIS_HOST: "redis"
      REDIS_PORT: "6379"
      REDIS_PASSWORD: "erxes"
      # RabbitMQ
      RABBITMQ_HOST: "amqp://rabbitmq:5672/erxes"
    networks:
      - erxes-net

  erxes-elksyncer:
    image: erxes/erxes-elksyncer:master
    container_name: erxes-elksyncer
    restart: unless-stopped
    environment:
      DB_NAME: "erxes"
      ELASTICSEARCH_URL: http://elasticsearch:9200
      MONGO_URL: mongodb://mongo/erxes
    volumes:
        - ./mongoConnectorLog:/var/log/mongo-connector
    networks:
      - erxes-net

  erxes-dashboard-front:
    image: erxes/erxes-dashboard-front:master
    container_name: erxes-dashboard-front
    restart: unless-stopped
    ports:
      - "127.0.0.1:4200:80"
    environment:
      PORT: "4200"
      REACT_APP_API_URL: http://localhost:3300
      REACT_APP_API_SUBSCRIPTION_URL: ws://localhost:3300/subscriptions
      REACT_APP_DASHBOARD_API_URL: http://localhost:4300
      NGINX_HOST: localhost
    networks:
      - erxes-net

  erxes-dashboard-api:
    image: erxes/erxes-dashboard-api:master
    container_name: erxes-dashboard-api
    restart: unless-stopped
    ports:
      - "127.0.0.1:4300:4300"
    environment:
      DASHBOARD_DOMAIN: http://localhost:4300
      NODE_ENV: production
      PORT: "4300"
      CUBEJS_DB_TYPE: elasticsearch
      CUBEJS_DB_URL: http://elasticsearch:9200
      CUBEJS_URL: http://localhost:4300
      CUBEJS_API_SECRET: "erxes"
      REDIS_URL: redis://redis:6379
      REDIS_PASSWORD: "erxes"
      DB_NAME: "erxes"
    networks:
      - erxes-net

  mongo:
    hostname: mongo
    image: mongo:4.0.20
    container_name: mongo
    ports:
      - "127.0.0.1:27017:27017"
    healthcheck:
      test: test $$(echo "rs.initiate().ok || rs.status().ok" | mongo --quiet) -eq 1
      interval: 2s
      timeout: 2s
      retries: 200
    command: ["--replSet", "rs0", "--bind_ip_all"]
    # All erxes database will be saved into mounted directory below. <<IF YOU DELETE THIS MOUNTED DIRECTORY ALL OF YOUR ERXES DATA WILL BE LOST SO BE CAUTIOUS>>
    volumes:
      - ./data/db:/data/db
    networks:
      - erxes-net

  redis:
    image: 'redis'
    container_name: redis
    ports:
      - "127.0.0.1:6379:6379"
    networks:
      - erxes-net
    command: redis-server --requirepass erxes

  rabbitmq:
    image: rabbitmq:3.7.17-management
    container_name: rabbitmq
    restart: unless-stopped
    hostname: rabbitmq
    ports:
      - "127.0.0.1:15672:15672"
      - "127.0.0.1:5672:5672"
    networks:
      - erxes-net
    # RabbitMQ data will be saved into ./rabbitmq-data folder.
    volumes:
      - ./rabbitmq-data:/var/lib/rabbitmq

  elasticsearch:
    image: "docker.elastic.co/elasticsearch/elasticsearch:7.8.0"
    container_name: "elasticsearch"
    environment:
      - discovery.type=single-node
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 32768
        hard: 65536
    ports:
      - "127.0.0.1:9200:9200"
    networks:
      - erxes-net
    volumes:
      - ./elasticsearchData:/usr/share/elasticsearch/data

  kibana:
    image: "docker.elastic.co/kibana/kibana:7.5.2"
    container_name: "kibana"
    depends_on:
      - "elasticsearch"
    ports:
      - "127.0.0.1:5601:5601"
    networks:
      - erxes-net
networks:
  erxes-net:
    driver: bridge 
```

If you have trouble running erxes docker images, feel free to open [issue](https://github.com/erxes/erxes/issues). Also you can ask any question related to docker installation in our [discussion](https://github.com/erxes/erxes/discussions). Our DevOps team will help you to solve your problem.
