#!/bin/sh

inside_git_repo="$(git rev-parse --is-inside-work-tree 2>/dev/null)"
if [ "$inside_git_repo" ]; then
  echo "Git repository detected. Please run the script in non git directory."
  exit 0
else
  echo 'Clone erxes repository and install its dependencies:'
  git clone https://github.com/erxes/erxes.git
  cd erxes
  git checkout develop
  yarn install
fi

cd ui/
echo 'Create `.env.sample` from default settings file and configure it on your own:'
cp .env.sample .env

echo 'Create `.ecosystem.json` from sample file:'
cp scripts/ecosystem.json.sample ../ecosystem.json

CURRENT_FOLDER=${PWD##*/}
if [ $CURRENT_FOLDER = 'erxes' ]; then
  cd ..
fi