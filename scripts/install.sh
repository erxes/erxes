#!/bin/sh
# erxes Widgets

echo 'Embedable widget scripts server for erxes.'

## Running the server

#### 1. Node (version >= 4) need to be installed.
#### 2. Clone and install dependencies.

if [ ! -d .git ]; then
  git clone https://github.com/erxes/erxes-widgets
  cd erxes-widgets
  yarn install
fi

#### 3. Create configuration. We use [dotenv](https://github.com/motdotla/dotenv) for this.

cp .env.sample .env

echo "This configuration matches with the default configurations of other erxes platform repositories. For the first time run, you don't need to modify it."

#### 4. Start the server.

echo 'Widgets server is running on [http://localhost:3200](http://localhost:3200).'

CURRENT_FOLDER=${PWD##*/}
if [ $CURRENT_FOLDER = 'erxes-widgets' ]; then
  cd ..
fi

curl https://raw.githubusercontent.com/erxes/erxes-api/master/scripts/install.sh | sh
