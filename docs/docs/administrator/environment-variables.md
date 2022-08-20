---
id: environment-variables
title: Environment variables
---

On this page you can see how to configure the work environment. It is very important to follow the steps as indicated.

## MongoDB

```
MONGO_URL=mongodb://localhost/erxes
TEST_MONGO_URL=mongodb://localhost/test
```

- `MONGO_URL` is your application's database URL.

- `TEST_MONGO_URL` is when you run testing.

```
yarn test
```

## Redis

```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

Redis is necessary for reactive subscriptions.

- `REDIS_HOST` is your redis server's URL.
- `REDIST_PORT` defines which port is redis running.
- `REDIS_PASSWORD` fill this if you have password on your redis server.

## General configs

```
HTTPS=false
MAIN_APP_DOMAIN=http://localhost:3000
WIDGETS_DOMAIN=http://localhost:3200
DOMAIN=http://localhost:3300
NODE_ENV=development
PORT=3300

ERXES_PATH=''
API_PATH=''
WIDGET_PATH=''
WIDGET_API_PATH=''

```

- `HTTPS`this is boolean variables, set true if you are using secure ssl.
- `MAIN_APP_DOMAIN` this is your main application's domain where is erxes/erxes repository is running.
- `WIDGETS_DOMAIN` your widget application's domain where is erxes/widgets repository is running.
- `DOMAIN` this is your erxes-api application's domain where is erxes/erxes-api repository is running.
- `NODE_ENV` set to production on live mode, set to development on development mode.
- `PORT` this option will define which port is your application running, you can change to any port you want.
