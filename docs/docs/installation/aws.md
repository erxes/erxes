---
id: aws
title: AWS Marketplace
---

Launch an EC2 instance using [erxes](https://aws.amazon.com/marketplace/pp/B086MZ9FVS/) in the AWS Marketplace.

## Configure your DNS Records

Your new EC2 instance will have an **ip address**. You will need to point your domain name to your new server.

- If you are using a **subdomain**, you will need to follow the instructions of updating the `A Records' of the hosting company for your website.
- If you are NOT using a **subdomain**, then you will need to follow the instructions of your domain name registrar.

:::note Example with a domain called, example.com

If your domain name is **example.com**, and the **ip address** assigned to your server is **44.123.32.12**, then you will have two `A records` that look like this:

| Type | Name            | Value                  |
| ---- | --------------- | ---------------------- |
| A    | www.example.com | points to 44.123.32.12 |
| A    | example.com     | points to 44.123.32.12 |

:::

:::note Example with a subdomain called, erxes.example.com

You first need to create a subdomain. For example, "erxes.example.com". Then you need to edit the **DNS**.

If your domain name is **erxes.example.com**, and the **ip address** assigned to your server is **44.123.32.12**, then you will have a two `A records` that look like this:

| Type | Name                  | Value                  |
| ---- | --------------------- | ---------------------- |
| A    | erxes.example.com     | points to 44.123.32.12 |
| A    | www.erxes.example.com | points to 44.123.32.12 |

**Note:** You do not need to create a subdomain called "erxes.example.com", you can use another name of your choice such as "admin.example.com".
:::

## Connect to your EC2 instance

- Connect to your EC2 instance via ssh.

```bash
ssh -i YOUR_PRIVATE_KEY_FILE.pem ubuntu@YOUR_INSTANCE_DNS
```

- `YOUR_PRIVATE_KEY_FILE.pem` is your private key that is assigned to your EC2 instance during the installation
- `YOUR_INSTANCE_DNS` is your public dns of your EC2 instance

## Gain root access

- Run the following to gain the root access on the server.

```bash
sudo su
```

## Configure NGINX

- You need to replace the `YOUR_DOMAIN_COM` with your actual `domain name` in the nginx config file `/etc/nginx/sites-available/default`.

```bash
nano /etc/nginx/sites-available/default
```

- After replacing YOUR_DOMAIN_COM with your actual domain name. Save with ctrl + x and then y to accept the changes.

- Test the **NGINX** configuration to make sure you don't have any errors

```bash
nginx -t
```

You should see the following output:

```bash
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

- Reload nginx service

```bash
systemctl reload nginx
```

## Install Let's Encrypt using Certbot

Execute Certbot. You will asked several questions, you can answer as follows:

- Enter your email address
- Agree with the **Terms of Service**
- Answer `Yes` or `No`, if you want to share your email address with the Electronic Frontier Foundation
- Select the corresponding number associated with your domain name, usually `1`
- Choose `2` to redirect all your traffic to a secure **HTTPS**

```bash
certbot --nginx
```

## Configure `erxes`

- Run the following to change the password for `erxes` and switch to user `erxes`.

```bash
passwd erxes
su erxes
```

- The rest of the steps are run as `erxes` user.

### Configure PM2 `ecosystem.config.js`

- Run the following command to replace `YOUR_DOMAIN_COM` with your actual domain name. Please use `your domain` for `your.domain.com`.

```bash
cd ~/erxes.io
sed -i 's/YOUR_DOMAIN_COM/your.domain.com/g' ecosystem.config.js
```

### Configure frontend environment variables

- Open the `~/erxes.io/erxes/js/env.js` file in the nano editor.

```bash
nano ~/erxes.io/erxes/js/env.js
```

- Copy the following **environment variables** in between the **{ }**, and replace **YOUR_DOMAIN_COM** with your actual domain name.

```bash
NODE_ENV: "production",
REACT_APP_API_URL: "https://YOUR_DOMAIN_COM/api",
REACT_APP_API_SUBSCRIPTION_URL: "wss://YOUR_DOMAIN_COM/api/subscriptions",
REACT_APP_CDN_HOST: "https://YOUR_DOMAIN_COM/widgets"
```

It should look like this, but **with your actual domain name**:

```bash
window.env = {
    NODE_ENV: "production",
    REACT_APP_API_URL: "https://erxes.example.com/api",
    REACT_APP_API_SUBSCRIPTION_URL: "wss://erxes.example.com/api/subscriptions",
    REACT_APP_CDN_HOST: "https://erxes.example.com/widgets"
}
```

- save the file with `ctrl + x` and then `y` to accept all changes.

You are now ready to **initialize** and **load the permissions** in **erxes**.

### export MongoDB URL

```bash
cd ~/erxes.io
nano ecosystem.config.js
```

Locate the "MONGO_URL": "mongodb://erxes:82e3e42ef31e51d51687b366118200e2@localhost/erxes?authSource=admin&replicaSet=rs0", under the erxes-api.

- Copy the MONGO_URL and exit the nano editor with ctrl + x.

- Now you will need to export and set the variable MONGO_URL, with the copied URL. See below:

**Example:**

```
# example
# export MONGO_URL="mongodb://erxes:92c54fa1f0658xxxxc2d9ce618b008b4@localhost/erxes?authSource=admin&replicaSet=rs0"
```

**Use your copied MONGO_URL below:**

```
export MONGO_URL="YOUR_COPIED_MONGO_URL_HERE"
```

### Initialize and Load permissions for erxes

- initialize Erxes and generate **login password**.

```bash
source ~/.nvm/nvm.sh
nvm use default
cd ~/erxes.io/erxes-api/dist
node commands/initProject
```

You should have a generated **password**. The output will be similar to this:

```bash
Your new password: HcEjfBMxws

# note this down
```

- Run this final command to finish the installation of **erxes**.

```bash
cd ~/erxes.io/erxes-api/dist
node commands/loadPermissionData

cd ~/erxes.io
pm2 restart ecosystem.config.js
```

### Congratulations, time to log in

You may now visit your domain, and log in.

The username is **admin@erxes.io**, and the password is the password generated above.
