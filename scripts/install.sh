#!/bin/sh

UNAME=$(uname)

if [ "$UNAME" = "Darwin" ] ; then
  ### OSX ###

  if type node > /dev/null ; then
    brew install node
  fi

  # mongodb
  if ! type mongo > /dev/null ; then
    brew update
    brew install mongodb
    mkdir -p /data/db
    chmod 777 /data/db
    mongod
  fi

  # yarn
  if ! type yarn > /dev/null ; then
    brew install yarn
  fi

elif [ "$UNAME" = "Linux" ] ; then
  ### Linux ###

  # nodejs
  if ! type node > /dev/null ; then
    curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi

  # mongodb
  if ! type mongo > /dev/null ; then
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
    echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo service mongod start
  fi

  # yarn
  if ! type yarn > /dev/null ; then
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt-get update && sudo apt-get install yarn
  fi
fi

if [ ! -d .git ]; then
  echo 'Clone erxes repository and install its dependencies:'
  git clone https://github.com/erxes/erxes.git
  cd erxes
  git checkout master
  yarn install
fi

echo 'Create `.env.sample` from default settings file and configure it on your own:'
cp .env.sample .env.development

CURRENT_FOLDER=${PWD##*/}
if [ $CURRENT_FOLDER = 'erxes' ]; then
  cd ..
fi

echo 'Install erxes-app-api'
curl https://raw.githubusercontent.com/erxes/erxes-app-api/master/scripts/install.sh | sh
