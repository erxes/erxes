#!/bin/sh

## Installation

if [ ! -d .git ]; then
  echo 'Clone erxes repository and install its dependencies:'
  git clone https://github.com/erxes/erxes-app-api
  cd erxes-app-api
  git checkout feature-graphql-mutations-mu
  yarn install
fi

if [ "$UNAME" = "Linux" ] ; then
  ### Linux ###
  sudo apt-get install redis-server
fi
if [ "$UNAME" = "Darwin" ] ; then
  ### Mac OS ###
  brew install redis
fi

echo 'Load initial data';
yarn loadInitialData


echo 'Create `.env.sample` from default settings file and configure it on your own:'
cp .env.sample .env

CURRENT_FOLDER=${PWD##*/}
if [ $CURRENT_FOLDER = 'erxes-app-api' ]; then
  cd ..
fi

curl https://raw.githubusercontent.com/erxes/erxes-widgets/feature-company/scripts/install.sh | sh
