#!/bin/sh

echo 'Clone erxes-api repository and install its dependencies:'
git clone https://github.com/erxes/erxes-api.git
cd erxes-api
git checkout develop
yarn install

echo 'Create `.env.sample` from default settings file and configure it on your own:'
cp .env.sample .env

CURRENT_FOLDER=${PWD##*/}
if [ $CURRENT_FOLDER = 'erxes-api' ]; then
  cd ..
fi