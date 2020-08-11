---
id: debian10
title: Debian 10
---

This steps explain how to install Erxes on Debian 10.

## Installing erxes on Debian 10

To have erxes up and running quickly, you can follow the following steps.

1. Provision a new server running Debian 10.

2. Log in to your new server as `root` account and run the following command.

   `bash -c "$(wget -O - https://raw.githubusercontent.com/erxes/erxes/develop/scripts/install/debian10.sh)"`

   **Note**: you will be asked to provide a domain for nginx server to set up config for erxes

3. Log in to your domain DNS and create A record based on your new server IP.

## Create an admin user

Switch to user `erxes` and run the following commands based on your needs.

```sh
su erxes
cd ~/erxes-api
export MONGO_URL="API_MONGO_URL"
```

- `API_MONGO_URL` - copy and paste the value of the `MONGO_URL` env var of erxes-api in the `/home/erxes/ecosystem.json`

The following will create an admin user admin@erxes.io with a random password. The password will be printed into your terminal.

```

yarn initProject

```

## Load initial data

The below command will create initial permission groups, permissions, growth hack templates, email templates and some sample data and reset the admin password and it will be printed into terminal.

```

yarn loadInitialData

```

If do not want to load sample data then you can run following command just to load permissions.

```

yarn loadPermission

```

Now you have erxes up and running!

## SSL integration

If you want to use `erxes` with HTTPS, please go to [this article](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-debian-10) written by Digital Ocean, where you can install letsencrypt, free SSL certificate, to secure your nginx. But, it is up to you if you want to use different SSL provider.

Once you have installed your ssl certificate, you need to update env vars.

1. Log in to your server as `erxes` via `ssh`.
2. Edit `erxes/build/js/env.js` file where env vars for frontend app are stored.
   The content of the file should be as follows:

```javascript
window.env = {
  PORT: 3000,
  NODE_ENV: "production",
  REACT_APP_API_URL: "https://your_domain/api",
  REACT_APP_API_SUBSCRIPTION_URL: "wss://your_domain/api/subscriptions",
  REACT_APP_CDN_HOST: "https://your_domain/widgets",
};
```

3. Update all env vars with HTTPS url in the `ecosystem.json` file.
4. Finally, you need to restart pm2 erxes processes by running the following command:

```sh
pm2 restart ecosystem.json
```

If you need more information about pm2, please go to official documentation [here](https://pm2.keymetrics.io/docs/usage/application-declaration/).
