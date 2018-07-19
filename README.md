# erxes Inc - erxes API

erxes is an AI meets open source messaging platform for sales and marketing

<a href="https://demohome.erxes.io/">View demo</a> <b>| </b> <a href="https://github.com/erxes/erxes-api/archive/master.zip">Download ZIP </a> <b> | </b> <a href="https://gitter.im/erxes/Lobby">Join us on Gitter</a>

## Status  <br>

![Build Status](https://travis-ci.org/erxes/erxes-api.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/erxes/erxes-api/badge.svg?branch=coveralls)](https://coveralls.io/github/erxes/erxes-api?branch=coveralls)

## Installation

This repository is the main web app of the erxes platform that consists of 2 other repositories:

- [Erxes](https://github.com/erxes/erxes)
- [Widgets](https://github.com/erxes/erxes-widgets)

Clone erxes repository and install its dependencies:
```Shell
git clone https://github.com/erxes/erxes-api
cd erxes-api
yarn install
```

Linux
```Shell
sudo apt install redis-server
```

Mac OS
```Shell
brew install redis
```

Run redis server
```Shell
redis-server
```

Create `.env.sample` from default settings file and configure it on your own:
```Shell
cp .env.sample .env
```

To start the app:
```Shell
yarn dev
```
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
<a href="https://www.saucelabs.com/" target="_blank"><img src="https://erxes.io/img/logo/saucelabs.png" width="130px;" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
<a href="https://www.transifex.com/" target="_blank"><img src="https://erxes.io/img/logo/transifex.png" width="100px;" /></a>

## Copyright & License
Copyright (c) 2018 erxes Inc - Released under the [MIT license.](https://github.com/erxes/erxes/blob/develop/LICENSE.md)
