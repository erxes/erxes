---
id: ubuntu
title: Installing on Ubuntu 16.04 LTS
---

## Prerequisites

There are a couple of pre-reqs for running erxes. This page outlines how to quickly install the things needed on an Ubuntu 16.04 server.

### Install MongoDB v3.6.x

```shell
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5

echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list

sudo apt-get update

sudo apt-get install -y mongodb-org

sudo systemctl start mongod
```

Official MongoDB documentation: https://docs.mongodb.com/v3.6/tutorial/install-mongodb-on-ubuntu/

### Install Redis

```shell
sudo apt-get update

sudo apt-get install redis-server

sudo systemctl start redis-server
```

### Install Nginx

```shell
sudo apt-get install -y nginx
```

### Install Node.js v8.x

```shell
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

sudo apt-get install -y nodejs
```

**Optional**: install build tools
To compile and install native addons from npm you may also need to install build tools:

```shell
sudo apt-get install -y build-essential
```

Official Node.js documentation: https://nodejs.org/en/download/package-manager/

### Install Yarn package manager

```shell
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -

echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

sudo apt-get update && sudo apt-get install yarn
```


Official Yarn package manager documentation: https://yarnpkg.com/lang/en/docs/install

***

## Installation

### Prepare clean directory

```shell
mkdir ~/erxes.io

cd ~/erxes.io
```

### Downloading release assets

- erxes

Download latest [release](https://github.com/erxes/erxes/releases) source code. (zip or tar.gz)
```shell
curl -JLO https://github.com/erxes/erxes/archive/0.9.15.tar.gz
```

- erxes-api

Download latest [release](https://github.com/erxes/erxes-api/releases) source code. (zip or tar.gz)
```shell
curl -JLO https://github.com/erxes/erxes-api/archive/0.9.15.tar.gz
```

- erxes-widgets

Download latest [release](https://github.com/erxes/erxes-widgets/releases) source code. (zip or tar.gz)
```shell
curl -JLO https://github.com/erxes/erxes-widgets/archive/0.9.15.tar.gz
```

- erxes-widgets-api

Download latest [release](https://github.com/erxes/erxes-widgets-api/releases) source code. (zip or tar.gz)
```shell
curl -JLO https://github.com/erxes/erxes-widgets-api/archive/0.9.15.tar.gz
```

_**Notes:** Always download same version releases from all repo._

### Extract source code

```shell
tar -zxvf erxes-0.9.15.tar.gz

tar -zxvf erxes-api-0.9.15.tar.gz

tar -zxvf erxes-widgets-0.9.15.tar.gz

tar -zxvf erxes-widgets-api-0.9.15.tar.gz
```

### Install dependencies

- erxes
```shell
cd ~/erxes.io/erxes-0.9.15 && yarn install
```

- erxes-api
```shell
cd ~/erxes.io/erxes-api-0.9.15 && yarn install
```

- erxes-widgets
```shell
cd ~/erxes.io/erxes-widgets-0.9.15 && yarn install
```

- erxes-widgets-api
```shell
cd ~/erxes.io/erxes-widgets-api-0.9.15 && yarn install
```

***

## Configuration

Copy all settings from `.env.sample` file and configure it on your own. Do it on all reposotiries.
```Shell
cp .env.sample .env
```

Following command will create default admin account

```shell
cd ~/erxes.io/erxes-api-0.9.15 && yarn initProject`
```
with following credentials
```shell
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
