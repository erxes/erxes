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

## Configuration

Our application use [dotenv](https://github.com/motdotla/dotenv) to process the configuration.

Copy default settings from `.env.sample` file and configure it on your own:
```Shell
cp .env.sample .env
```


`cd erxes-api && yarn initProject` - script will create admin account for you.
```
(username: admin@erxes.io , password: erxes)
```

***

## Running erxes
This is how the erxes directory should look like similar to this:

_I've listed only important files to run erxes at the moment._
```
erxes
├── ecosystem.json
├── erxes
│   ├── .env
│   ├── node_modules
│   ├── package.json
│   ├── public
│   ├── scripts
│   ├── src
│   ├── stories
├── erxes-api
│   ├── .env
│   ├── node_modules
│   ├── package.json
│   ├── scripts
│   ├── src
├── erxes-widgets
│   ├── client
│   ├── .env
│   ├── node_modules
│   ├── locales
│   ├── package.json
│   ├── scripts
│   ├── server
└── erxes-widgets-api
    ├── .env
    ├── node_modules
    ├── package.json
    ├── scripts
    └── src
```
**Development server**

Run `yarn dev` in erxes-widgets-api, erxes-widgets, erxes-api folders.

Run `yarn start` in erxes folder.

**Production server**

Run `yarn build` in erxes, erxes-api, erxes-widgets, erxes-widgets-api folders to create production optimized build files.
```Shell
cd erxes.io
PM2 start ecosystem.json
```
