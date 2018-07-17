# API for erxes apps


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
