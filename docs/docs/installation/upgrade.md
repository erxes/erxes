---
id: upgrade
title: Upgrade
sidebar_label: Upgrade
---

Following the steps in this document you can upgrade the system version.

## Upgrad erxes 0.13.0 to 0.14.1

Since the current [Debian installation script](https://github.com/erxes/erxes/blob/develop/scripts/install/debian10.sh) and [CentOS installation script](https://github.com/erxes/erxes/blob/develop/scripts/install/centos8.sh) aret updated to 0.14.1, they can be used to upgrade erxes v0.13.0 to v 0.14.1 if you are hosting erxes on Centos, Ubuntu or Debian.

1. SSH into your server as `erxes`.

2. First, stop all pm2 processes and delete pm2 apps.

```
pm2 stop ecosystem.json
pm2 delete ecosystem.json
```

3. Move erxes, erxes-api, erxes-integrations and ecosystem.json somewhere as a backup. Also backup nginx config file in /etc/nginx/sites-available/default and dump your mongodb.

4. Then run the installation script as `root`

```
# If erxes hosted on Debian or Ubuntu
bash -c "$(wget -O - https://raw.githubusercontent.com/erxes/erxes/develop/scripts/install/debian10.sh)"

# If erxes hosted on CentOS
bash -c "$(curl https://raw.githubusercontent.com/erxes/erxes/develop/scripts/install/centos8.sh)"
```

5. Afther the installation complete, run the following commands as `erxes` user

```
cd ~/erxes-api
export MONGO_URL=mongodb://localhost/erxes?replicaSet=rs0
yarn migrate
```

6. Lastly, update `/home/erxes/erxes/ui/build/js/env.js`, `ecosystem.json` and start pm2 by `pm2 start ecosystem.json`, and update nginx config using your backup and reload nginx by `systemctl reload nginx`.

   Note: We have noticed that `pm2 reload ecosystem.json` and `pm2 restart ecosystem.json` sometimes not picking up any changes to the `ecosystem.json` for some reason. So if you need to update `ecosystem.json` file, please use `pm2 delete ecosystem.json` and `pm2 start ecosystem.json` in the feature.

## Upgrading from v0.9+ to the latest release vx.x.x

### Breaking Changes

- Since version `latest vx.x.x` Erxes started using RabbitMQ as message broker service. To update, please see example changes at docker [installation guide.](docker)
- Engage module is moved to [separate repository](https://github.com/erxes/erxes-engages-email-sender). Also docker [installation guide](docker) is updated to reflect related changes.

### Env changes

- erxes

  - `REACT_APP_INTEGRATIONS_API_URL` - is no longer used

- erxes-api

  - `ENGAGES_API_DOMAIN` - erxes-engages service endpoint
  - `RABBITMQ_HOST` - RabbitMQ connection uri

- erxes-widgets-api

  - `RABBITMQ_HOST` - RabbitMQ connection uri

- erxes-integrations

  - `RABBITMQ_HOST` - RabbitMQ connection uri

- erxes-engages
  - `PORT` - engages service running port
  - `NODE_ENV` - node environment
  - `DEBUG` - enable logging
  - `MAIN_API_DOMAIN` - erxes api url
  - `MONGO_URL` - MongoDB connection uri
  - `RABBITMQ_HOST` - RabbitMQ connection uri
