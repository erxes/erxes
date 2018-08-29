#!/bin/sh

echo 'Clone erxes-api repository and install its dependencies:'
git clone https://github.com/erxes/erxes-api.git
cd erxes-api
git checkout master
yarn install

echo 'Create `.env.sample` from default settings file and configure it on your own:'
cp .env.sample .env

echo 'Creating admin user';
yarn initProject

CURRENT_FOLDER=${PWD##*/}
if [ $CURRENT_FOLDER = 'erxes-api' ]; then
  cd ..
fi

echo 'Install erxes-widgets-api'
curl https://raw.githubusercontent.com/erxes/erxes-widgets-api/master/scripts/install.sh | sh
