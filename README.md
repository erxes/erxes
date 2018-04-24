# erxes [![Build Status](https://travis-ci.org/erxes/erxes.svg?branch=develop)](https://travis-ci.org/erxes/erxes) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/ed8c207f4351446b8ace7a323630889f)](https://www.codacy.com/app/erxes/erxes?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=erxes/erxes&amp;utm_campaign=Badge_Grade) [![Dependencies checker](https://david-dm.org/erxes/erxes.svg)](https://david-dm.org/erxes/erxes) [![Known Vulnerabilities](https://snyk.io/test/github/erxes/erxes/badge.svg)](https://snyk.io/test/github/erxes/erxes) [![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/erxes/erxes/develop/LICENSE.md) [![Backer](https://opencollective.com/erxes/backers/badge.svg?label=Backer&color=brightgreen)](https://opencollective.com/erxes/) [![Sponsor](https://opencollective.com/erxes/sponsors/badge.svg?label=Sponsor&color=brightgreen)](https://opencollective.com/erxes/)

erxes is an AI meets open source messaging platform for sales and marketing teams.

The project is maintained by erxes Inc, along with an amazing group of independent [contributors](https://github.com/erxes/erxes/graphs/contributors). We are striving to make customer experience better through our messaging platform.

## Quick links

- [Homepage](https://erxes.io/)
- [Roadmap](https://github.com/erxes/erxes/projects/1)
- [Community](https://community.erxes.io/)
- [Blog](https://blog.erxes.io/)
- [Developer Blog](https://dev.erxes.io/)

## Installation script

```Shell
  curl https://raw.githubusercontent.com/erxes/erxes/master/scripts/install.sh | sh
```

## Manual install
This repository is the main web app of the erxes platform that consists of 2 other repositories:

- [API](https://github.com/erxes/erxes-api)
- [Widgets](https://github.com/erxes/erxes-widgets)

If you haven't installed **Node** yet [install nodejs](https://github.com/nodejs/node/wiki/Installation)

If you haven't installed **Yarn** yet on your machine:
```Shell
curl -o- -L https://yarnpkg.com/install.sh | sh
```

Clone erxes repository and install its dependencies:
```Shell
git clone https://github.com/erxes/erxes.git
cd erxes
yarn install
```

Create `.env.sample` from default settings file and configure it on your own:
```Shell
cp .env.sample .env.development
```

To start the app:
```Shell
yarn start
```

App is running at [http://localhost:3000](http://localhost:3000). You can **login** using the credential in the `.env.development`.

**We haven't done yet:** We need to run [API](https://github.com/erxes/erxes-api) and  [Widgets](https://github.com/erxes/erxes-widgets) to make our erxes app fully functional. Please jump to their repositories.

## [Docker hub](https://www.docker.com/)

Pull images from [dockerhub](https://hub.docker.com/u/erxes/) and running all servers on [docker compose](https://docs.docker.com/compose/overview/).
```Shell
docker-compose -f scripts/docker-compose.yml up
```

Running servers from [mounted path](https://docs.docker.com/compose/compose-file/#volumes) where source code located.
```Shell
docker-compose -f scripts/docker-compose-v.yml up
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

<a href="https://www.cloudflare.com/" target="_blank"><img src="https://goo.gl/K6PZqX" width="64px;" height="64px;"></a>
<a href="https://www.browserstack.com/" target="_blank"><img src="https://goo.gl/y5FTNh" width="64px;" height="64px;"></a>
<a href="https://www.saucelabs.com/" target="_blank"><img src="https://goo.gl/zdWNrJ" width="64px;" height="64px;"></a>
<a href="https://www.transifex.com/" target="_blank"><img src="https://goo.gl/TzDdC5" width="64px;" height="64px;"></a>

## Copyright & License
Copyright (c) 2018 erxes Inc - Released under the [MIT license.](https://github.com/erxes/erxes/blob/develop/LICENSE.md)

