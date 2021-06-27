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
    gnupg \
    lsb-release
```

3. Add Docker’s official GPG key:

```sh
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

4. Use the following command to set up the stable repository.

```sh
    echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
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
3. Create the docker group if it does not exist:

```sh
sudo groupadd docker
```

4. Add your user to the docker group.

```sh
sudo usermod -aG docker $USER
```
5. Run the following command or Logout and login again and run (that doesn't work you may need to reboot your machine first)

```sh
newgrp docker
```
6. Check if docker can be run without root

```sh
docker run hello-world
```
7. Reboot if still got error

```sh
reboot
```




_Don't forget to restart shell to take effect._

Official Docker documentation: https://docs.docker.com/install/

### Install docker compose

(Linux variant)

1. To install docker, simply use the following command:

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
3. Create the same directory as like `erxes` :

```bash
mkdir 'example_directory'
cd 'example_directory'
mkdir data elasticsearchData rabbitmq-data redis-data mongoConnectorData
```
4. Go to the erxes directory:
```bash
cd 'erxes/ui'
cp .env.sample .env
```
5. Go to the erxes directory:
```bash
cd 'erxes/api'
cp .env.sample .env
code .env
Editing inside .env
REDIS_PASSWORD='pass'
```
6. Go to the erxes directory:
```bash
cd 'erxes/elkSyncer'
cp .env.sample .env
```


7. Run the following to start containers

```bash
docker-compose up -d
```


8. Run the following

```bash
cd 'erxes/api'
yarn install
yarn dev
```

8. Run the following

```bash
cd 'erxes/ui'
yarn install
yarn start
```

9. Now you may visit `localhost:3000` and log in with your admin account.

### Default ports

_Must be published to host machine network_

- erxes main frontend app will run on port 3000
- erxes-widgets will run on port 3200
- erxes-api will run on port 3300
- erxes-integrations will run on port 3400

_Should not published to host machine network, only used internally_

- erxes-api (cron) will run on port 3600
- erxes-api (worker) will run on port 3700
- erxes-logger will run on port 3800
- redis server will run on port 6379
- mongodb server will run on port 27017
- rabbitmq server will run on port 5672

_If these ports aren't available for you, you can always change it. But don't forget to change related ENV settings._

### docker-compose.yml file

<aside class="notice">

**Note:** Following ENVs are configured for localhost only.
All erxes version have to changed the latest version.
The latest version [**release**](https://github.com/erxes/erxes/releases) source code.

</aside>

```yaml
version: '3'
services:
  mongo:
    hostname: mongo
    image: mongo
    container_name: mongo
    ports:
      - "127.0.0.1:27017:27017"
    networks:
      - erxes-net
    healthcheck:
      test: test $$(echo "rs.initiate().ok || rs.status().ok" | mongo --quiet) -eq 1
      interval: 2s
      timeout: 2s
      retries: 200
    command: ["--replSet", "rs0", "--bind_ip_all"]
    volumes:
      - ./data/db:/data/db

  redis:
    image: 'redis'
    container_name: redis
    ports:
      - "127.0.0.1:6379:6379"
    networks:
      - erxes-net
    command: redis-server --requirepass pass

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
    image: "docker.elastic.co/elasticsearch/elasticsearch:7.5.2"
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

  elksyncer:
    container_name: "elksyncer"
    build:
       dockerfile: ./Dockerfile
       context: ../erxes/elkSyncer
    env_file:
      ../erxes/elkSyncer/.env
    depends_on:
      - "mongo"
      - "elasticsearch"
    volumes:
      - ./mongoConnectorLog:/var/log/mongo-connector
    tty: true
    networks:
      - erxes-net

  # elksyncer:
  #   container_name: 'elksyncer'
  #   build:
  #     dockerfile: ./Dockerfile
  #     context: ../../erxes-saas/erxes/elkSyncer
  #   env_file:
  #     ../../erxes-saas/erxes/elkSyncer/.env
  #   depends_on:
  #     - 'mongo'
  #     - 'elasticsearch'
  #   networks:
  #     - erxes-net

  # erxes-api-check:
  #   image: registry.erxes.io/erxes-enterprise/erxes-api:golomt
  #   container_name: erxes-api
  #   restart: unless-stopped
  #   environment:
  #     PORT: "3300"
  #     NODE_ENV: production
  #     DEBUG: "erxes-api:*"
  #     MAIN_APP_DOMAIN: http://localhost:3000
  #     INTEGRATIONS_API_DOMAIN: http://localhost:3400
  #     LOGS_API_DOMAIN: http://localhost:3800
  #     MONGO_URL: mongodb://mongo/erxes
  #     ELASTICSEARCH_URL: http://elasticsearch:9200
  #     RABBITMQ_HOST: "amqp://rabbitmq"
  #     MESSAGE_BROKER_PREFIX: "1"
  #     JWT_TOKEN_SECRET: "token"
  #     DD_SERVICE: ""
  #     DD_HOST: ""
  #   ports:
  #     - "127.0.0.1:3300:3300"
  #   networks:
  #     - erxes-net

networks:
  erxes-net:
    driver: bridge

```

If you have trouble running erxes docker images, feel free to open [issue](https://github.com/erxes/erxes/issues).
