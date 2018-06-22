#!/bin/sh

## Installation

if [ ! -d .git ]; then
  echo 'Clone erxes repository and install its dependencies:'
  git clone https://github.com/erxes/erxes-app-api
  cd erxes-app-api
  yarn install
fi

UNAME=$(uname)

if [ $UNAME = "Linux" ] ; then
  ### Linux ###
  if ! type redis-server > /dev/null ; then
    sudo apt install -y redis-server
  fi
fi
if [ $UNAME = "Darwin" ] ; then
  ### Mac OS ###
  if ! type redis-server > /dev/null ; then
    brew install redis
  fi
fi

echo 'Load initial data';
yarn loadInitialData


echo 'Create `.env.sample` from default settings file and configure it on your own:'
cp .env.sample .env

CURRENT_FOLDER=${PWD##*/}
if [ $CURRENT_FOLDER = 'erxes-app-api' ]; then
  cd ..
fi

curl https://raw.githubusercontent.com/erxes/erxes-widgets/master/scripts/install.sh | sh
