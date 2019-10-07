# erxes Inc - erxes Widgets

erxes is an open source growth marketing platform. Marketing, sales, and customer service platform designed to help your business attract more engaged customers. Replace Hubspot with the mission and community-driven ecosystem.

<a href="https://demo.erxes.io/">View demo</a> <b>| </b> <a href="https://github.com/erxes/erxes-widgets/archive/master.zip">Download ZIP </a> <b> | </b> <a href="https://slack.erxes.io">Join us on Slack</a>


## Status  <br>

![Build Status](https://drone.erxes.io/api/badges/erxes/erxes-widgets/status.svg?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/erxes/erxes-widgets/badge.svg?branch=master)](https://snyk.io/test/github/erxes/erxes-widgets)

## Running the server

#### 1. Node (version >= 4) and NPM need to be installed.
#### 2. Clone and install dependencies.

```Shell
git clone https://github.com/erxes/erxes-widgets.git
cd erxes-widgets
yarn install
```

#### 3. Create configuration from sample file. We use [dotenv](https://github.com/motdotla/dotenv) for this.

```Shell
cp .env.sample .env
```

This configuration matches with the default configurations of other erxes platform repositories. For the first time run, you don't need to modify it.

.env file description

```env
PORT=3200                                                (Server port)
ROOT_URL=http://localhost:3200                           (Widgets server url)
MAIN_API_URL=http://localhost:3300                       (erxes-api server url)
API_GRAPHQL_URL=http://localhost:3100/graphql            (erxes-widgets-api server url)
API_SUBSCRIPTIONS_URL=ws://localhost:3300/subscriptions  (erxes-api server)
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

#### 5. Running servers:

- Widgets server: [http://localhost:3200](http://localhost:3200).

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
<a href="https://app.fossa.io/projects/git%2Bgithub.com%2Ferxes%2Ferxes-widgets?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Ferxes%2Ferxes-widgets.svg?type=shield"/></a>

## In-kind sponsors

<a href="https://www.cloudflare.com/" target="_blank"><img src="https://s3.amazonaws.com/erxes/github/cloudflare.png" width="130px;" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
<a href="https://cloud.google.com/developers/startups/" target="_blank"><img src="https://s3.amazonaws.com/erxes/github/cloud-logo.svg" width="130px;" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
<a href="https://www.digitalocean.com/" target="_blank"><img src="https://s3.amazonaws.com/erxes/github/digitalocean.png" width="100px;" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
<a href="https://www.transifex.com/" target="_blank"><img src="https://s3.amazonaws.com/erxes/github/transifex.png" width="100px;" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
<a href="https://www.browserstack.com/" target="_blank"><img src="https://s3.amazonaws.com/erxes/github/browserstack.png" width="130px;" /></a>

## Copyright & License
Copyright (c) 2018 erxes Inc - Released under the [MIT license.](https://github.com/erxes/erxes/blob/develop/LICENSE.md)
