# erxes [![Build Status](https://travis-ci.org/erxes/erxes.svg?branch=develop)](https://travis-ci.org/erxes/erxes) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/ed8c207f4351446b8ace7a323630889f)](https://www.codacy.com/app/erxes/erxes?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=erxes/erxes&amp;utm_campaign=Badge_Grade) [![Dependencies checker](https://david-dm.org/erxes/erxes.svg)](https://david-dm.org/erxes/erxes.svg) [![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/erxes/erxes/develop/LICENSE.md) [![Join the chat at https://gitter.im/erxes/erxes](https://badges.gitter.im/erxes/erxes.svg)](https://gitter.im/erxes/erxes?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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
cp .env.sample .env.developement
```

To start the app:
```Shell
yarn start
```

App is running at [http://localhost:3000](http://localhost:3000). You can **login** using the credential in the `.env.development`.

**We haven't done yet:** We need to run [API](https://github.com/erxes/erxes-api) and  [Widgets](https://github.com/erxes/erxes-widgets) to make our erxes app fully functional. Please jump to their repositories.

## Copyright & License
Copyright (c) 2017 erxes Inc - Released under the [MIT license.](https://github.com/erxes/erxes/blob/develop/LICENSE.md)
