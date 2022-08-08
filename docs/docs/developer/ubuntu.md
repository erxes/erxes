---
id: ubuntu
title: Ubuntu
sidebar_label: Ubuntu
---
---

The following documentation will guide you through the installation of an erxes project using <a href="https://www.docker.com/" target="_blank">Docker</a> on <a href="https://ubuntu.com/" target="_blank">Ubuntu</a>.

Docker is an open platform that allows to develop, ship and run applications by using containers (i.e. packages containing all the parts an application needs to function, such as libraries and dependencies).

## Preparing the installation

erxes installation requires at least four software prerequisites to be already installed on your computer:

:::caution

Erxes code takes approximately 12GB storage space, make sure you have enough space in your device before going forward. 

:::

**Prerequisites**

- <a href="https://github.com/git-guides/install-git" target="_blank">Git</a>
- [Node.js](https://nodejs.org): only LTS versions are supported (v14 and v16). Other versions of Node.js may not be compatible with the latest release of erxes. The 14.x version is most recommended by erxes.
- [npm](https://docs.npmjs.com/cli/v6/commands/npm-install) and [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#debian-stable)  (latest version) to run the erxes.
- <a href="https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04">Docker</a> (v20.10.14 and higher) The 20.10.14 version is most recommended by erxes. Docker compose (v2.5.0 and higher)



### Installing erxes

1. Create an empty folder.

```
mkdir example

```
2. Change directory path to empty folder

```
cd example

```

 Шинээр үүсгэсэн фолдер дотор 2 фолдер байх ба erxes болон dock(optional name) гэсэн.

3. Erxes фолдер маань дараах коммандаар үүсэх ба github - аас clone хийж бий болно.

```
git clone https://github.com/erxes/erxes.git

```

### Installing dependencies using docker

4. Erxes - ээ clone хийж татаж авсан бол dock фолдэр - оо гараар үүсгэж өгнө.

```
mkdir dock

```
5. Үүний дараа дараах коммандаар docker фолдер луугаа орно.

```
cd docker 

```

:::tip

sudo nano эсвэл sudo vim коммандаар .yml файлыг үүсгэж болно.

:::

6. Энэ фолдер дотроо дараах script - ийг docker-compose.yml нэртэй файл үүсгэж хуулж өгнө.

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

7. Run the following command in the folder where above file exists:

``` 
sudo docker-compose up -d 

```

8. Одоо фолдерийн замаа сольж erxes фолдер луугаа орно.

```
cd ../erxes

```

9. Switch a federation branch by using following command

```

git checkout federation

```

10. In erxes directory, Install node modules by using following command:

```

yarn install

```

11. Install pm2 by using following command:

```

sudo npm install -g pm2

```

:::note

Frequently used **pm2** commands on erxes:

- pm2 list - Display all processes status
- pm2 kill - Will remove all processes from pm2 list
- pm2 logs -f - Display all processes logs in streaming ( gateway, plugin-name etc. )
- pm2 restart all - Restart all processes


:::

12. Үүний дараа фолдерийн замаа солих хэрэгтэй.

```

cd cli

```

13. erxes/cli фолдер дотроо node modules суулгах

```

yarn install

```

14. Copy configs.json.sample, then convert it to configs.json.

```

cp configs.json.sample configs.json

```

15. Эцэст нь доорх коммандаар erxes- ээ асаах ба internet browser дээр автоматаар шинэ цонх нээгдэж localhost:3000 дээр  erxes ажиллана.

```

./bin/erxes.js dev

```

