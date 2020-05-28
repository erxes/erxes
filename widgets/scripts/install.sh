#!/bin/sh

echo 'Clone erxes-widgets repository and install its dependencies:'
git clone https://github.com/erxes/erxes-widgets.git
cd erxes-widgets
git checkout develop
yarn install


CURRENT_FOLDER=${PWD##*/}
if [ $CURRENT_FOLDER = 'erxes-widgets' ]; then
  cd ..
fi
