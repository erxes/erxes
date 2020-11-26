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

5. Run the following

```bash
docker exec -it erxes-api yarn initProject
```

- this will create default admin account with a random password.

```

(username: admin@erxes.io , password: auto generated password)

```

6. Finish up by running

```bash
docker exec -it erxes-api yarn loadPermissionData
```

7. Now you may visit `localhost:3000` and log in with your admin account.

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
version: "2.1"
services:
  erxes:
    image: erxes/erxes:0.17.6
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
    image: erxes/erxes-api:0.17.6
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
      # non public urls
      CRONS_API_DOMAIN: http://erxes-crons:3600
      WORKERS_API_DOMAIN: http://erxes-workers:3700
      LOGS_API_DOMAIN: http://erxes-logger:3800
      ENGAGES_API_DOMAIN: http://erxes-engages:3900
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes
      # Elasticsearch
      ELASTICSEARCH_URL: http://elasticsearch
    ports:
      - "3300:3300"
    depends_on:
      mongo:
        condition: service_healthy
      elasticsearch:
        condition: service_healthy
    networks:
      - erxes-net

  erxes-crons:
    image: erxes/erxes-api:0.17.6
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
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - erxes-net

  erxes-workers:
    image: erxes/erxes-api:0.17.6
    container_name: erxes-workers
    entrypoint:
      [
        "node",
        "--max_old_space_size=8192",
        "--experimental-worker",
        "dist/workers",
      ]
    restart: unless-stopped
    environment:
      # erxes-workers
      PORT_WORKERS: "3700"
      NODE_ENV: production
      DEBUG: "erxes-workers:*"
      JWT_TOKEN_SECRET: token
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - erxes-net

  erxes-widgets:
    image: erxes/erxes-widgets:0.17.6
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

  erxes-engages:
    image: erxes/erxes-engages-email-sender:0.17.6
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
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - erxes-net

  erxes-logger:
    image: erxes/erxes-logger:0.17.6
    container_name: erxes-logger
    restart: unless-stopped
    environment:
      PORT: "3800"
      DEBUG: "erxes-logs:*"
      # MongoDB
      MONGO_URL: mongodb://mongo/erxes_logs
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - erxes-net

  erxes-integrations:
    image: erxes/erxes-integrations:0.17.6
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
    ports:
      - "3400:3400"
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - erxes-net

  mongo:
    image: mongo:3.6.13
    container_name: mongo
    restart: unless-stopped
    healthcheck:
      test: echo 'rs.initiate().ok' | mongo localhost:27017/test?replicaSet=rs0 --quiet
      interval: 2s
      timeout: 2s
      retries: 200
    command: ["--replSet", "rs0", "--bind_ip_all"]
    networks:
      - erxes-net
    # MongoDB data will be saved into ./mongo-data folder.
    volumes:
      - ./mongo-data:/data/db

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.5.2
    container_name: elasticsearch
    environment:
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - discovery.type=single-node
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - ./elasticsearch-data:/usr/share/elasticsearch/data
    networks:
      - erxes-net
    healthcheck:
      test: curl -s http://localhost:9200 >/dev/null; if [[ $$? == 52 ]]; then echo 0; else echo 1; fi
      interval: 30s
      timeout: 10s
      retries: 5

networks:
  erxes-net:
    driver: bridge
```

If you have trouble running erxes docker images, feel free to open [issue](https://github.com/erxes/erxes/issues).
