---
slug: heroku
title: Heroku
---

Learn how to deploy Erxes on Heroku.

## Deploying Erxes on Heroku

Heroku is a container-based cloud Platform as a Service (PaaS).

In order to deploy erxes and other related apps, you will need `mLab MongoDB` (MongoDB), `Heroku Redis` (Redis), and `CloudAMQP` (RabbitMQ) addons.

To add any addon to an app, you will need to register your credit card. So please add your creadit card and verify your account prior to proceeding further.

## One Click deployment

In this installation guide, we pretend the following app names will be available on Heroku and they will be used to demonstrate - we expect you to choose any available names on Heroku.

- `erxes` - **erxes** `(https://erxes.herokuapp.com)`
- `erxes API` - **erxes-api** `(https://erxes-api.herokuapp.com)`
- `erxes Widget` - **erxes-widget** `(https://erxes-widget.herokuapp.com)`

Try the following 3 steps to install all required apps on Heroku.

### 1. Install erxes

Please try clicking the deploy button below, then set all the config vars and hit the Deploy app button.

**Config vars:**

```sh
REACT_APP_API_SUBSCRIPTION_URL = ws://erxes-api.herokuapp.com/subscriptions
REACT_APP_API_URL = https://erxes-api.herokuapp.com
REACT_APP_CDN_HOST = https://erxes-widget.herokuapp.com
```

[![Deploy erxes](https://www.herokucdn.com/deploy/button.svg#heroku 'Deploy erxes')](https://heroku.com/deploy?template=https://github.com/erxes/erxes/tree/develop)

### 2. Install erxes API

Now it's time to install erxes API - click the button below and set the config vars.

**Config vars:**

```sh
PORT = 3300
PORT_CRONS = 3600
PORT_WORKERS = 3700
DOMAIN = https://erxes-api.herokuapp.com
MAIN_APP_DOMAIN = https://erxes.herokuapp.com
MONGO_URL = mongodb:// # leave it as is, we will update it later on
RABBITMQ_HOST = RABBITMQ_HOST # we will update it later on
REDIS_HOST = REDIS_HOST # we will update it later on
REDIS_PASSWORD = REDIS_PASS # we will update it later on
REDIS_PORT = 28229 # update it later on
JWT_TOKEN_SECRET: "replact it with your token"
LOGS_API_DOMAIN = "update it when you install logger app"
INTEGRATIONS_API_DOMAIN = "update it when you install integrations app"
```

[![Deploy erxes API](https://www.herokucdn.com/deploy/button.svg#heroku 'Deploy erxes API')](https://heroku.com/deploy?template=https://github.com/erxes/erxes-api/tree/develop)

Now go to Heroku dashboard and select the **erxes-api app** from the Apps tab.

Go to Settings tab where you can manage your Config Vars as you need to update config vars of **erxes-api** app.

In the Config Vars section, click a button 'Reveal Config Vars' so that you will be able to see all the config vars.

Copy MONGO_URI's value and paste it into MONGO_URL.

Copy RABBITMQ_URL's value and paste into RABBITMQ_HOST.

Update REDIS_HOST, REDIS_PASSWORD, and REDIS_PORT values using REDIS_URL's value.

Please now go to Resources tab as you will need to start `cronjob` and `worker` processes.
Start `cronjob` and `worker`.

#### Load initial data

The last step is to insert initial data. To do that you will need to clone `erxes-api` repo and `mongorestore` tool.

Clone the `erxes-api` and run the following commands in the terminal.

`cd erxes-api/src`

The below command will create initial permission groups, permissions, growth hack templates, email templates and some sample data.

`mongorestore --host=<host> --port=<port> -u <user> -d <db> initialData`

If do not want to load sample data then you can run following command just to load permissions.

`mongorestore --host=<host> --port=<port> -u <user> -d <db> permissionData`

**Note**: extract `host`, `port`, `user`, `db` from the `MONGO_URI` config var.

Now you can log into `https://erxes.herokuapp.com` using the following credentials.

```sh
username: admin@erxes.io
password: erxes
```

### 3. Install erxes Widgets

Now install erxes Widget app by clicking the deploy button below and set config vars.

**Config vars:**

```sh
ROOT_URL = https://erxes-widget.herokuapp.com
API_URL = https://erxes-api.herokuapp.com
API_SUBSCRIPTIONS_URL = wss://erxes-api.herokuapp.com/subscriptions
PORT = 3200
```

[![Deploy Widgets](https://www.herokucdn.com/deploy/button.svg#heroku 'Deploy erxes Widgets')](https://heroku.com/deploy?template=https://github.com/batnasan/erxes-widgets-heroku-button)

Now it's time to grab yourself a cup of coffee and enjoy using **erxes**.

## Extra features

There is a several apps available for you to install and make erxes even more powerful.  
The steps of installing them are same as above.

### 4. Install Logger

**Config vars:**

```sh
PORT = 3800
MONGO_URL = MONGO_URL # we will update it later on
RABBITMQ_HOST = copy and paste from erxes-api RABBITMQ_HOST config var
```

Once the app is deployed, go to `Settings` and click `Config Vars` button.  
Copy `MONGO_URI`'s value and paste it into `MONGO_URL`.

[![Deploy Widgets](https://www.herokucdn.com/deploy/button.svg#heroku 'Deploy erxes integrations')](https://heroku.com/deploy?template=https://github.com/batnasan/erxes-logger-heroku-button)

### 5. Install erxes integrations

**Config vars:**

```sh
PORT = 3400
DOMAIN = https://erxes-integration.herokuapp.com
MAIN_API_DOMAIN = API domain
MAIN_APP_DOMAIN = Front app domain
MONGO_URL = INTEGRATION_MONGO_URL # we will update it later on
RABBITMQ_HOST = copy and paste from erxes-api RABBITMQ_HOST config var
REDIS_HOST = copy and paste from erxes-api REDIS_HOST config var
REDIS_PASSWORD = copy and paste from erxes-api REDIS_PASSWORD config var
REDIS_PORT = copy and paste from erxes-api REDIS_PORT config var
```

[![Deploy Widgets](https://www.herokucdn.com/deploy/button.svg#heroku 'Deploy erxes integrations')](https://heroku.com/deploy?template=https://github.com/erxes/erxes-integrations/tree/develop)

Once the app is deployed, go to `Settings` and click `Config Vars` button.  
Copy `MONGODB_URI`'s value and paste it into `MONGO_URL`.
