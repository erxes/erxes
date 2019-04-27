---
id: installation-guide
title: Installation guide
---

**New:** If you want to try out erxes _without installing any additional tools_ on your computer check out our [docker images](https://hub.docker.com/u/erxes/).

All you have to do is [docker](https://docs.docker.com/) and [docker-compose](https://docs.docker.com/compose/) installed on your computer. Read more [here](https://github.com/erxes/erxes/wiki/Use-erxes-with-Docker).

***

This repository is the main web app of the erxes platform that consists of 3 other repositories:

- [Widgets-API](https://github.com/erxes/erxes-widgets-api) - The GraphQL server shared by the erxes apps and widgets.
- [Widgets](https://github.com/erxes/erxes-widgets) - Embeddable widget scripts server for erxes
- [API](https://github.com/erxes/erxes-api) - API for erxes administration app

## Installation
Below script will create a directory named **erxes.io**, clone all of erxes platform repositories and install dependencies. Make sure MongoDB and Redis server are running before running the script.

```Shell
  curl https://raw.githubusercontent.com/erxes/erxes/master/scripts/install.sh | sh
```

Following softwares are required to run **erxes**. If you haven't installed them yet, please go to following installation instructions or check our [Prerequisites](https://github.com/erxes/erxes/wiki/Prerequisites) page.

- [MongoDB](https://docs.mongodb.com/manual/installation/)
- [NodeJS](https://github.com/nodejs/node/wiki/Installation) version >= 6.x LTS
- [Redis](https://redis.io/download)
- [Yarn](https://yarnpkg.com/en/docs/install)

## Configuration

Our application use [dotenv](https://github.com/motdotla/dotenv) to process the configuration.

Copy default settings from `.env.sample` file and configure it on your own:
```Shell
cp .env.sample .env
```

This configuration matches with the default configurations of other erxes platform repositories. For the first time run, you don't need to modify it.


`cd erxes-api && yarn initProject` - script will create admin account for you.
```
(username: admin@erxes.io , password: erxes)
```

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
