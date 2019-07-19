---
id: developer
title: Developing and Testing erxes
sidebar_label: Developer
---

This document describes how to set up your development environment to develop and test erxes. It also explains the basic mechanics of using `git`, `node`, and `yarn`.

* [Prerequisite Software](#prerequisite-software)
* [Getting the Sources](#getting-the-sources)
* [Installing NPM Modules](#installing-npm-modules)
* [Running Tests Locally](#running-tests-locally)

See the [contribution guidelines](contributing) if you'd like to contribute to erxes.

## Prerequisite Software
Before you can develop and test erxes, you must install and configure the following products on your development machine:

- [Git](http://git-scm.com/) and/or the **GitHub app** (for [Mac](http://mac.github.com) or [Windows](http://windows.github.com)); [GitHub's Guide to Installing Git](https://help.github.com/articles/set-up-git) is a good source of information.
- [Node.js](http://nodejs.org), v10.x LTS which is used to run a development web server, run tests, and generate distributable files.
- [Yarn](https://yarnpkg.com)  which is used to install dependencies.
- [MongoDB](https://www.mongodb.com) version 3.6.x
- [Redis](https://redis.io) version 3.x +

## Getting the Sources
Fork and clone the erxes repository:

1. Login to your GitHub account or create one by following the instructions given [here](https://github.com/signup/free).

2. Fork the relevant [erxes repository](https://github.com/erxes/erxes).

3. Clone your fork of the erxes repository and define an upstream remote pointing back to the erxes repository that you forked in the first place.

```sh
# Clone your GitHub repository:
git clone git@github.com:<github username>/erxes.git

# Go to the erxes directory:
cd erxes

# Add the main erxes repository as an upstream remote to your repository:
git remote add upstream https://github.com/erxes/erxes.git
```


## Installing NPM Modules
Next, install the JavaScript modules needed to develop and test erxes:

```sh
# Install erxes project dependencies (package.json)
yarn install
```

## Running Tests Locally

```
yarn test
```
