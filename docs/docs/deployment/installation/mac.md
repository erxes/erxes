---
id: installation-mac
title: Installation on MacOS
sidebar_label: Mac
---

The following documentation will guide you through the installation of an erxes project using **<a href="https://www.docker.com/" target="_blank">Docker</a>** on **<a href="https://www.apple.com/macos/monterey/" target="_blank">MacOs</a>**.

Docker is an open platform that allows to develop, ship and run applications by using containers (i.e. packages containing all the parts an application needs to function, such as libraries and dependencies).

## Preparing the installation

---

erxes installation requires at least four software prerequisites to be already installed on your computer:

:::caution

Erxes code takes approximately 12GB storage space, make sure you have enough space in your device before going forward.

:::

### Prerequisites

- **<a href="https://github.com/git-guides/install-git" target="_blank">Git</a>**
- [**Node.js**](https://nodejs.org): only LTS versions are supported (v14 and v16). Other versions of Node.js may not be compatible with the latest release of erxes. The 14.x version is most recommended by erxes. The easier way to install **<a href="https://github.com/nvm-sh/nvm#installing-and-updating " target="_blank">nvm</a>** is here.
- [**npm**](https://docs.npmjs.com/cli/v6/commands/npm-install) and [**yarn**](https://classic.yarnpkg.com/lang/en/docs/install/#debian-stable) (latest version) to run the erxes.
- **<a href="https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04">Docker</a>** (v20.10.14 and higher) The 20.10.14 version is most recommended by erxes. Docker compose (v2.5.0 and higher)
- [**Homebrew**](https://brew.sh/) latest version
- [**Xcode**](https://www.freecodecamp.org/news/install-xcode-command-line-tools/) latest version

## Installing erxes

---

1. Create an empty folder.

```
mkdir example
```

2. In your empty folder, where the new erxes project will be created, and it defines the database and erxes plugins to use.

```
cd example
```

3. Run following command in the folder.

```
git clone https://github.com/erxes/erxes.git
```

### Installing dependencies using docker

4. In the folder, create dock directory using following command.

```
mkdir dock
```

5. Go to the dock folder using following command.

```
cd dock
```

:::tip

Run sudo nano or sudo vim command to create .yml file.

:::

6. Create a `docker-compose.yml` file, then copy the following script in the newly created file.

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

## Running erxes

---

:::caution
Please make sure you have to change your directory to erxes/cli.
:::

8. Go back to erxes folder using following command.

```
cd ../erxes
```

9. Switch a dev branch by using following command.

```
git checkout dev
```

10. In erxes folder, Install node modules by using following command.

```
yarn install
```

11. Install `pm2` by using following command.

```
sudo npm install -g pm2
```

12. Run following command to change the folder.

```
cd cli
```

13. Install `node` modules in the `erxes/cli` directory.

```
yarn install
```

14. Copy `configs.json.sample`, then convert it to `configs.json` by below command.

```
cp configs.json.sample configs.json
```

15. Add `"ui": "local"` under every plugin names like shown in below, in `configs.json`.

:::caution
You do not have to add it under `logs` plugin since it has no ui.
:::

```
 {
    "name": "inbox",
    "ui": "local"
},
```

16. Run following command to start your erxes project.

```
./bin/erxes.js dev --deps
```

**If your browser don't automatically jump to localhost:3000, you should check logs by using these commands.**

:::note

Frequently used `pm2` commands on erxes:

- pm2 list - Display all processes status
- pm2 kill - Will remove all processes from pm2 list
- pm2 logs -f - Display all processes logs in streaming (gateway, plugin-name etc.)
- pm2 restart all - Restart all processes

:::

**If you see this screen, you have successfully install erxes XOS. Congratulations** 🎉🎉🎉

<div align="center">
<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/login+screen.png" width="60%" alt="erxes: Free and open fair-code licensed experience operating system (XOS)" ></img>
</div>
