# erxes Inc - erxes API

erxes is an open source growth marketing platform. Marketing, sales, and customer service platform designed to help your business attract more engaged customers. Replace Hubspot with the mission and community-driven ecosystem.

<a href="https://demohome.erxes.io/">View demo</a> <b>| </b> <a href="https://github.com/erxes/erxes-api/archive/master.zip">Download ZIP </a> <b> | </b> <a href="https://gitter.im/erxes/Lobby">Join us on Gitter</a>

## Status  <br>

![Build Status](https://travis-ci.org/erxes/erxes-api.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/erxes/erxes-api/badge.svg?branch=coveralls)](https://coveralls.io/github/erxes/erxes-api?branch=coveralls)

## Running the server

#### 1. Node (version >= 4) and NPM need to be installed.

Make sure your MongoDB and Redis server is running.

#### 2. Clone and install dependencies.

```Shell
git clone https://github.com/erxes/erxes-api.git
cd erxes-api
yarn install
```

#### 3. Create configuration from sample file. We use [dotenv](https://github.com/motdotla/dotenv) for this.

```Shell
cp .env.sample .env
```

.env file description

```.env
NODE_ENV=development                        (Node environment: development | production)
PORT=3300                                   (Server port)

MONGO_URL=mongodb://localhost/erxes         (MongoDB url)
TEST_MONGO_URL=mongodb://localhost/test

REDIS_HOST=localhost                        (Redis server url)
REDIS_PORT=6379                             (Redis server port)

MAIN_APP_DOMAIN=http://localhost:3000       (erxes project url)
DOMAIN='http://localhost:3300'              (erxes-api project url)
```

#### 4. Start the server.

For development:

```Shell
yarn dev
```

For production:

```Shell
yarn build
yarn start
```

#### 5. Running servers
- GraphQL server: [http://localhost:3300/graphql](http://localhost:3300/graphql)
- Websocket subscriptions server: [ws://localhost:3300/subscriptions](ws://localhost:3300/subscriptions)

## Contributors

This project exists thanks to all the people who contribute. [[Contribute]](CONTRIBUTING.md).
<a href="graphs/contributors"><img src="https://opencollective.com/erxes/contributors.svg?width=890" /></a>


## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/erxes#backer)]

<a href="https://opencollective.com/erxes#backers" target="_blank"><img src="https://opencollective.com/erxes/backers.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/erxes#sponsor)]

<a href="https://opencollective.com/erxes/sponsor/0/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/1/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/2/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/3/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/4/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/5/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/6/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/7/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/8/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/9/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/9/avatar.svg"></a>

## In-kind sponsors

<a href="https://www.cloudflare.com/" target="_blank"><img src="https://erxes.io/img/logo/cloudflare.png" width="130px;" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
<a href="https://cloud.google.com/developers/startups/" target="_blank"><img src="https://erxes.io/img/logo/cloud-logo.svg" width="130px;" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
<a href="https://www.digitalocean.com/" target="_blank"><img src="https://erxes.io/img/logo/digitalocean.png" width="100px;" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
<a href="https://www.saucelabs.com/" target="_blank"><img src="https://erxes.io/img/logo/saucelabs.png" width="130px;"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
<a href="https://www.transifex.com/" target="_blank"><img src="https://erxes.io/img/logo/transifex.png" width="100px;" /></a>

## Copyright & License
Copyright (c) 2018 erxes Inc - Released under the [MIT license.](https://github.com/erxes/erxes/blob/develop/LICENSE.md)
