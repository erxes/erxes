#!/bin/sh

echo 'Clone erxes-widgets repository and install its dependencies:'
git clone https://github.com/erxes/erxes-widgets.git
cd erxes-widgets
git checkout master
yarn install

echo 'Create `.env.sample` from default settings file and configure it on your own:'
cp .env.sample .env

CURRENT_FOLDER=${PWD##*/}
if [ $CURRENT_FOLDER = 'erxes-widgets' ]; then
  cd ..
fi

echo 'Default login credentials'
echo -e "Username: \e[35m\e[1madmin@erxes.io"
echo -e "Password: \e[35m\e[1merxes"
