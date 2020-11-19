---
id: upgrade
title: Upgrade
sidebar_label: Upgrade
---

Following the steps in this document you can upgrade the system version.

## Upgrade erxes 0.13.0 to 0.14.1

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

## Upgrade erxes 0.15.x to 0.18.2

1. login to your server
2. ```cd /home/erxes && su erxes``` ( switch to erxes user)
3. ```pm2 delete all```
4. ```cp erxes/ui/build/js/env.js env.js.back``` (backup env.js file)
5. ```rm -rf erxes && rm -rf erxes-api && rm -rf erxes-integrations``` (remove old files)
6. Download new files
    1. ```curl -L https://github.com/erxes/erxes/releases/download/0.18.2/erxes-0.18.2.tar.gz   | tar -xz -C .```
    2. ```curl -L https://github.com/erxes/erxes-api/releases/download/0.18.2/erxes-api-0.18.2.tar.gz   | tar -xz -C .```
    3. ```curl -L https://github.com/erxes/erxes-integrations/releases/download/0.18.2/erxes-integrations-0.18.2.tar.gz   | tar -xz -C .```

7. ```mv env.js.back erxes/build/js/env.js``` (replace env)
8. update ecosystem.json file
    1. replace ```/home/erxes/erxes-api/engages-email-sender``` with ```/home/erxes/erxes-engages-email-sender```
    2. replace ```/home/erxes/erxes-api/logger``` with ```/home/erxes/erxes-logger```
    3. replace ```/home/erxes/erxes/widgets``` with ```/home/erxes/erxes-widgets```
9. ```pm2 start ecosystem.json```
10. ```exit``` ( switch to root user )
11. ```vim /etc/nginx/sites-enabled/default``` (edit nginx config)
12. replace ```/home/erxes/erxes/ui/build with ```/home/erxes/erxes/build```
13. ```service nginx restart```

## Upgrade erxes 0.17.x to 0.18.2

1. login to your server
2. ```cd /home/erxes/erxes.io && su erxes``` ( switch to erxes user)
3. ```pm2 delete all```
4. ```cp erxes/js/env.js env.js.back``` (backup env.js file)
5. ```rm -rf erxes && rm -rf erxes-widgets && rm -rf erxes-api && rm -rf erxes-logger && rm -rf erxes-elkSyncer && rm -rf erxes-email-verifier && rm -rf erxes-engages-email-sender && rm -rf erxes-integrations``` (remove old files)
6. Download new files
    1. ```curl -L https://github.com/erxes/erxes/releases/download/0.18.2/erxes-0.18.2.tar.gz   | tar -xz -C .```
    2. ```curl -L https://github.com/erxes/erxes-api/releases/download/0.18.2/erxes-api-0.18.2.tar.gz   | tar -xz -C .```
    3. ```curl -L https://github.com/erxes/erxes-integrations/releases/download/0.18.2/erxes-integrations-0.18.2.tar.gz   | tar -xz -C .```
7. ```mv env.js.back erxes/build/js/env.js``` (replace env)
8. update ecosystem.json file
    1. replace ```/home/erxes/erxes.io/erxes-elkSyncer``` with ```/home/erxes/erxes.io/erxes-elkSyncer/elkSyncer```
9. ```pm2 start ecosystem.json```
10. ```exit``` ( switch to root user )
11. ```vim /etc/nginx/sites-enabled/default``` (edit nginx config)
12. replace ```/home/erxes/erxes.io/erxes``` with ```/home/erxes/erxes.io/erxes/build```
13. ```service nginx restart```

## Upgrade erxes 0.19.2 to latest (0.20.x)

1. Login as erxes user

2. ```cd /home/erxes/erxes.io```

3. Remove old folders
```rm -rf erxes*```

4. stop pm2 process
 ```pm2 delete all```

5. Create erxes project
```yarn create erxes-app erxes```

6. Update MONGO_URL config
- vim (nano) ecosystem.config.js (open ecosystem.config.js file)
- copy MONGO_URL config from line 14
- vim (nano) ../erxes.io/erxes/configs.json (open config.json file in erxes folder)
- replace MONGO_URL config in line 3 with the copied value

7. Run start command
- ```cd erxes```
- ```yarn start```
- Enter your domain answer to the questions

8. Switch to su and replace nginx config
- ```exit```
- ```cp erxes/nginx.conf /etc/nginx/sites-available/default```

9. Run certbot again and restart nginx
- ```sudo certbot --nginx```
- ```service nginx restart```

10. Done. Check your app in browser.



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
