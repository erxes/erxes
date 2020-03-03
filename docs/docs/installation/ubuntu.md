---
id: ubuntu
title: Ubuntu 16.04/18.04 LTS
---

Manual installation on Ubuntu 16.04/18.04 LTS.

## Prerequisites

There are a couple of pre-reqs for running erxes. This page explain how to quickly install the requirenment needed on an Ubuntu 16.04/18.04 server.
This guide assumes that the server does not have any other services running on it.

### Install MongoDB v3.6.x

```sh
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

Official MongoDB documentation: https://docs.mongodb.com/v3.6/tutorial/install-mongodb-on-ubuntu/

### Install Redis

```sh
sudo apt-get update
sudo apt-get install -y redis-server
sudo systemctl start redis-server
```

### Install RabbitMQ

Install Erlang from an Apt Repostory on Bintray
```sh
sudo apt-key adv --keyserver "hkps.pool.sks-keyservers.net" --recv-keys "0x6B73A36E6026DFCA"
sudo apt-get install apt-transport-https

echo "deb https://dl.bintray.com/rabbitmq/debian xenial main
deb https://dl.bintray.com/rabbitmq-erlang/debian xenial erlang" | sudo tee /etc/apt/sources.list.d/bintray.erlang.list

sudo apt-get update
sudo apt-get install -y erlang-base \
                        erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets \
                        erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key \
                        erlang-runtime-tools erlang-snmp erlang-ssl \
                        erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl
sudo apt-get install rabbitmq-server
sudo vim /etc/apt/preferences.d/erlang
Package: erlang*
Pin: release o=Bintray
Pin-Priority: 1000
```



Enable management plugin
```sh
sudo rabbitmq-plugins enable rabbitmq_management
sudo service rabbitmq-server restart
```

Official RabbitMQ documentation: https://www.rabbitmq.com/install-debian.html

### Install Nginx

```sh
sudo apt-get install -y nginx
```
Serve static content + reverse proxy


### Install Node.js v10.x

```sh
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -

sudo apt-get install -y nodejs
```

**Optional**: install build tools
To compile and install native addons from npm you may also need to install build tools:

```sh
sudo apt-get install -y build-essential
```

Official Node.js documentation: https://nodejs.org/en/download/package-manager/

### Install Yarn package manager

```sh
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -

echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

sudo apt-get update && sudo apt-get install yarn
```


Official Yarn package manager documentation: https://yarnpkg.com/lang/en/docs/install

***

## Installation

### Prepare clean directory

```sh
mkdir ~/erxes.io

cd ~/erxes.io
```

### Downloading release assets

- erxes

Download latest [release](https://github.com/erxes/erxes/releases) source code. (zip or tar.gz)
```sh
curl -JLO https://github.com/erxes/erxes/archive/0.9.15.tar.gz
```

- erxes-api

Download latest [release](https://github.com/erxes/erxes-api/releases) source code. (zip or tar.gz)
```sh
curl -JLO https://github.com/erxes/erxes-api/archive/0.9.15.tar.gz
```

- erxes-widgets

Download latest [release](https://github.com/erxes/erxes-widgets/releases) source code. (zip or tar.gz)
```sh
curl -JLO https://github.com/erxes/erxes-widgets/archive/0.9.15.tar.gz
```

- erxes-widgets-api

Download latest [release](https://github.com/erxes/erxes-widgets-api/releases) source code. (zip or tar.gz)
```sh
curl -JLO https://github.com/erxes/erxes-widgets-api/archive/0.9.15.tar.gz
```

_**Notes:** Always download same version releases from all repo._

### Extract source code

Extract the downloaded version. Latest [release](https://github.com/erxes/erxes/releases) source code. (zip or tar.gz)

```sh
tar -zxvf erxes-0.9.15.tar.gz

tar -zxvf erxes-api-0.9.15.tar.gz

tar -zxvf erxes-widgets-0.9.15.tar.gz

tar -zxvf erxes-widgets-api-0.9.15.tar.gz
```

### Install dependencies

- erxes-x.x.x   The latest version [release](https://github.com/erxes/erxes/releases) source code.

```sh
cd ~/erxes.io/erxes-0.9.15 && yarn install
```

- erxes-api-x.x.x   The latest version [release](https://github.com/erxes/erxes/releases) source code.

```sh
cd ~/erxes.io/erxes-api-0.9.15 && yarn install
```

- erxes-widgets-x.x.x   The latest version [release](https://github.com/erxes/erxes/releases) source code.

```sh
cd ~/erxes.io/erxes-widgets-0.9.15 && yarn install
```

- erxes-widgets-api-x.x.x  The latest version [release](https://github.com/erxes/erxes/releases) source code.

```sh
cd ~/erxes.io/erxes-widgets-api-0.9.15 && yarn install
```

***

## Configuration

Copy all settings from `.env.sample` file and configure it on your own. Do it on all reposotiries.
```sh
cp .env.sample .env
```

Following command will create default admin account.  The latest version [release](https://github.com/erxes/erxes/releases) source code.

```sh
cd ~/erxes.io/erxes-api-0.9.15 && yarn initProject`
```
with following credentials
```sh
username: admin@erxes.io
password: erxes
```

***

## Production server

### nginx settings

```
server {
        listen 80;
        server_name erxes.example.com;
        # Don't forget to update below path with /path/to/erxes/build;
        root /home/user/erxes.io/erxes/build;
        index index.html;
        error_log /var/log/nginx/erxes.error.log;

        location / {
                try_files $uri /index.html;
        }

        # Assumming widgets-api project is running on 3100 port.
        location /widgets-api/ {
                proxy_pass http://127.0.0.1:3100/;
                proxy_set_header Host $http_host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Assumming widgets project is running on 3200 port.
        location /widgets/ {
                proxy_pass http://127.0.0.1:3200/;
                proxy_set_header Host $http_host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Assumming api project is running on 3300 port.
        location /api/ {
                proxy_pass http://127.0.0.1:3300/;
                proxy_set_header Host $http_host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "Upgrade";
        }
}
```

### erxes

erxes is [CreateReactApp](https://github.com/facebook/create-react-app) frontend project.

`yarn build` - build production optimized files in `build` directory and nginx will serve those static files.

### erxes-api
`yarn build` - build production optimized files in `dist` directory.

`yarn start` - start NodeJS express server on 3300 port by default.

### erxes-widgets
`yarn build` - build production optimized files in `dist` directory.

`yarn start` - start NodeJS express server on 3200 port by default.

### erxes-widgets-api
`yarn build` - build production optimized files in `dist` directory.

`yarn start` - start NodeJS express server on 3100 port by default.

***

## Development server

### erxes
`yarn start` - command will run development Nodejs server for CRA on port 3000 by default.

### erxes-api
`yarn dev` - start NodeJS express development server on 3300 port by default.

### erxes-widgets
`yarn dev` - start NodeJS express development server on 3200 port by default.

### erxes-widgets-api
`yarn dev` - start NodeJS express development server on 3100 port by default.


## Starting on boot

### Systemd
MongoDB, Nginx, Redis systemd service files will be already created by default. To make sure it's enabled on boot run following commands.

```sh
sudo systemctl enable mongod
sudo systemctl enable nginx
sudo systemctl enable redis-server
```

Create new systemd service file


#### erxes-api
`sudo vim /lib/systemd/system/erxes-api.service`

```
[Unit]
Description=erxes-api
Documentation=https://docs.erxes.io
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node /home/user/erxes.io/erxes-api/dist/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

#### erxes-widgets
`sudo vim /lib/systemd/system/erxes-widgets.service`

```
[Unit]
Description=erxes-widgets
Documentation=https://docs.erxes.io
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node /home/user/erxes.io/erxes-widgets/dist/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

#### erxes-widgets-api
`sudo vim /lib/systemd/system/erxes-widgets-api.service`
```
[Unit]
Description=erxes-widgets-api
Documentation=https://docs.erxes.io
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node /home/user/erxes.io/erxes-widgets-api/dist/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
