---
id: installation-ubuntu
title: Installation on Ubuntu
sidebar_label: Ubuntu
---

# Installation on Ubuntu using Docker

This documentation will guide you through the installation of an erxes project using [Docker](https://www.docker.com/) on [Ubuntu](https://ubuntu.com/).

Docker is an open platform that allows you to develop, ship, and run applications using containers (i.e. packages containing all the parts an application needs to function, such as libraries and dependencies).

## Preparing the installation

### Prerequisites

Before installing erxes, ensure that the following software prerequisites are already installed on your computer:

:::caution
Erxes code takes approximately 12GB of storage space. Please ensure you have enough space on your device before proceeding.
:::

- **<a href="https://github.com/git-guides/install-git" target="_blank">Git</a>**
- [**Node.js**](https://nodejs.org): only LTS versions are supported (v14 and v16). Other versions of Node.js may not be compatible with the latest release of erxes. The 14.x version is most recommended by erxes. The easier way to install **<a href="https://github.com/nvm-sh/nvm#installing-and-updating " target="_blank">nvm</a>** is here.
- [**npm**](https://docs.npmjs.com/cli/v6/commands/npm-install) and [**yarn**](https://classic.yarnpkg.com/lang/en/docs/install/#debian-stable) (latest version) to run the erxes.
- **<a href="https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04">Docker</a>** (v20.10.14 and higher) The 20.10.14 version is most recommended by erxes. Docker Compose (v2.5.0 and higher) is also required.

## Installing erxes

1. Create an empty folder.

```
mkdir example
```

2. In your empty folder, where the new erxes project will be created,define the database and erxes plugins to use.

```
cd example
```

3. Run the following command in the folder.

```
git clone https://github.com/erxes/erxes.git
```

### Installing dependencies using docker

4. In the folder, create a "dock" directory using following command.

```
mkdir dock
```

5. Go to the "dock" folder using the following command.

```
cd dock
```

:::tip

Run `sudo nano` or `sudo vim` command to create the .yml file.

:::

6. Create a `docker-compose.yml` file, then copy the following script into the newly created file.

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

:::note
Please find the useful **<a href="https://docs.docker.com/engine/reference/commandline/compose_images/#related-commands" targe="_blank">commands</a>** when you're working on Docker
:::

7. Run the following command in the folder where above file exists.

```
sudo docker-compose up -d
```

8. Go back to "erxes' folder using the following command.

```
cd ../erxes
```

9. Switch a "dev" branch by using the following command.

```
git checkout dev
```

10. In the "erxes" folder, install node modules by using the following command.

```
yarn install
```

11. Install `pm2` by using the following command.

```
sudo npm install -g pm2
```

## Running erxes

---

:::caution
Run erxes in "erxes/cli" directory
:::

1. Run following command to change the folder.

```
cd cli
```

2. Install node modules in the "erxes/cli" directory.

```
yarn install
```

3. Copy "configs.json.sample", then convert it to "configs.json".

```
cp configs.json.sample configs.json
```

4. Run the following command to start your erxes project.

```
./bin/erxes.js dev
```

**If your browser doesn't automatically jump to localhost:3000, you should check logs by using these commands.**

:::note

Frequently used `pm2` commands on erxes:

- pm2 list - Display all processes' status
- pm2 kill - Will remove all processes from pm2 list
- pm2 logs -f - Display all processes' logs in streaming (gateway, plugin-name etc.)
- pm2 restart all - Restart all processes

:::

**If you see this screen, you have successfully install erxes XOS. Congratulations** 🎉🎉🎉

<div align="center">
<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/login+screen.png" width="60%" alt="erxes: Free and open fair-code licensed experience operating system (XOS)" ></img>
</div>
