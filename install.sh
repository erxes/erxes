#!/bin/sh


UNAME=$(uname)

if [ "$UNAME" = "Darwin" ] ; then
  ### OSX ###
  brew install yarn
elif [ "$UNAME" = "Linux" ] ; then
  ### Linux ###
  sudo apt-get install yarn
fi

if [ ! -d .git ]; then
  echo 'Clone erxes repository and install its dependencies:'
  git clone https://github.com/erxes/erxes.git
  cd erxes
  git checkout redesign-ui
  yarn install
fi

echo 'Create `.env.sample` from default settings file and configure it on your own:'
cp .env.sample .env

CURRENT_FOLDER=${PWD##*/}
if [ $CURRENT_FOLDER = 'erxes' ]; then
  cd ..
fi

echo 'Install erxes-app-api'

curl https://raw.githubusercontent.com/erxes/erxes-app-api/feature-graphql-mutations-mu/install.sh | sh
