---
id: mac
title: Mac
sidebar_label: Mac
---

The following documentation will guide you through the installation of an erxes project using <a href="https://www.docker.com/" target="_blank">Docker</a> on <a href="https://www.apple.com/macos/monterey/" target="_blank">MacOS</a>.

Docker is an open platform that allows to develop, ship and run applications by using containers (i.e. packages containing all the parts an application needs to function, such as libraries and dependencies).

## Preparing the installation

erxes installation requires at least four software prerequisites to be already installed on your computer:

:::warning Prerequisites

- <a href="https://github.com/git-guides/install-git" target="_blank">Git</a>
- [Node.js](https://nodejs.org): only LTS versions are supported (v14 and v16). Other versions of Node.js may not be compatible with the latest release of erxes. The 14.x version is most recommended by erxes.
- [npm](https://docs.npmjs.com/cli/v6/commands/npm-install) (v6 only) or [yarn](https://yarnpkg.com/getting-started/install) to run the CLI installation scripts.
- <a href="https://docs.docker.com/engine/install/">Docker</a>

:::


### Installing erxes


1. In terminal, run the following command:
```
git clone git@github.com:erxes/erxes.git
```

2. Switch a federation branch by using following command:
```
git checkout federation
```

3. Instal node modules by using following command:
```
cd erxes
yarn install
```

4. Instal pm2 by using following command:
```
sudo npm install -g pm2
```

### Installing dependencies using docker

Include the below scripts in docker-compose.yml:

```
version: '3.6'
services:
  mongo:
    hostname: mongo
    image: mongo:4.0.10
    # container_name: mongo
    ports:
      - "27017:27017"
    networks:
      - erxes-net
    healthcheck:
      test: test $$(echo "rs.initiate().ok || rs.status().ok" | mongo --quiet) -eq 1
      interval: 2s
      timeout: 2s
      retries: 200
    command: ["--replSet", "rs0", "--bind_ip_all"]
    extra_hosts:
      - "mongo:127.0.0.1"
    volumes:
      - ./data/db:/data/db

  redis:
    image: 'redis'
    # container_name: redis
    # command: redis-server --requirepass pass
    ports:
      - "6379:6379"
    networks:
      - erxes-net

  rabbitmq:
    image: rabbitmq:3.7.17-management
    # container_name: rabbitmq
    restart: unless-stopped
    hostname: rabbitmq
    ports:
      - "15672:15672"
      - "5672:5672"
    networks:
      - erxes-net
    # RabbitMQ data will be saved into ./rabbitmq-data folder.
    volumes:
      - ./rabbitmq-data:/var/lib/rabbitmq

networks:
  erxes-net:
    driver: bridge
```

Run the following command in the folder where above file exist:

```
docker-compose up -d
```

### Running erxes

```
cd erxes/cli
yarn install
```

Copy configs.json.sample, then convert it to configs.json.

```
{
	"jwt_token_secret": "token",
	"client_portal_domains": "",
	"elasticsearch": {},
	"redis": {
		"password": "pass"
	},
	"mongo": {
		"username": "",
		"password": ""
	},
	"rabbitmq": {
		"cookie": "",
		"user": "",
		"pass": "",
		"vhost": ""
	},
	"plugins": [
		{
			"name": "logs"
		}
	]
}
```


To run your erxes project created with Docker, use one of the following commands:
```
./bin/erxes.js dev --deps
```

