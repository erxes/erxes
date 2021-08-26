---
id: developer
title: Developing erxes
sidebar_label: Developer
---

This document describes how to set up your development environment to develop and test Erxes. It also explains the basic mechanics of using `git`, `node`, and `yarn`.

- [Prerequisite Software](#prerequisite-software)
- [Getting the Sources](#getting-the-sources)
- [Installing NPM Modules](#installing-npm-modules)
- [Running Tests Locally](#running-tests-locally)

See the [contribution guidelines](contributing) if you'd like to contribute to erxes.

## Prerequisite Software

Before you can develop and test erxes, you must install and configure the following products on your development machine:

- [Git](http://git-scm.com/) and/or the **GitHub app** (for [Mac](http://mac.github.com) or [Windows](http://windows.github.com)); [GitHub's Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.
- [Node.js](http://nodejs.org), v10.x LTS which is used to run a development web server, run tests, and generate distributable files.
- [Yarn](https://yarnpkg.com) which is used to install dependencies.
- [MongoDB](https://www.mongodb.com) version 3.6.x
- [RabbitMQ](https://www.rabbitmq.com/download.html) version 3.8.x
- [Redis](https://redis.io) version 3.x +

## Getting the Sources and running locally

1. Login to your GitHub account or create one by following the instructions given [here](https://github.com/signup/free).

2. Configure your ssh key [here](https://github.com/settings/keys).

3. Run Erxes backend.

```sh
# Clone your GitHub repository:
git clone git@github.com:erxes/erxes-api.git

# Go to the erxes directory:
cd erxes-api

# Copy preconfigured environment variables:
cp .env.sample .env

# Install dependencies (package.json)
yarn install

# Create admin user & save the returned password
yarn initProject

# Load sample data
yarn loadInitialData

# Run
yarn dev
```

4. Run Erxes frontend.

```sh
# Clone your GitHub repository:
git clone git@github.com:erxes/erxes.git

# Go to the erxes directory:
cd erxes

#Go to the ui folder 
cd ui/

# Copy preconfigured environment variables:
cp .env.sample .env

# Install dependencies (package.json)
yarn install

# Run
yarn start
```

## Checkout running website

Visit http://localhost:3000 and login using following credentials

```
username: admin@erxes.io
password: the password generated during initProject
```