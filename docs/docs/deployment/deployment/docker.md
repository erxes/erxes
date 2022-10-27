---
id: deploymentDocker
title: Deployment
sidebar_label: By Docker
---

The following documentation will guide you through the installation of an erxes project using <a href="https://www.docker.com/" target="_blank">**Docker**</a> on <a href="https://ubuntu.com/" target="_blank">**Ubuntu**</a> in order to use erxes. This the guideline will be dedicated to developers who is about to use erxes for their businesses only. If you want to customize or develop additional plugins on erxes, please go to <a href="https://docs.erxes.io/docs/intro">the developer installation guideline</a>.

Docker is an open platform that allows to develop, ship and run applications by using containers (i.e. packages containing all the parts an application needs to function, such as libraries and dependencies).

## First steps: Setting up a server with Ubuntu 22.10

You must have an account with your hosting provider prior to doing these steps.

- Choose a server size that corresponds with the **minimum** requirements for installing with **Quickstart**:
  - **Ubuntu 22.10** installed and running
  - **4 CPU**
  - **minimum 6GB RAM**
  - ability to to SSH into the server
  - If you're using a **subdomain**, then the **subdomain** must be created with your hosting provider hosting your main domain's website or app. The DNS needs to be pointed to your server. (See below)

### Configure your DNS Records to point at your server

Your server will have an **IP address**. You will need to point your domain name to your new server.

- If you are using a **subdomain**, you will need to follow the instructions of updating the `A Records' of the hosting company for your website.
- If you are NOT using a **subdomain**, then you will need to follow the instructions of your domain name registrar.

:::note Example with a domain called, example.com

If your domain name is **example.com**, and the **IP address** assigned to your server is **44.123.32.12**, then you will have two `A records` that look like this:

| Type | Name            | Value                  |
| ---- | --------------- | ---------------------- |
| A    | www.example.com | points to 44.123.32.12 |
| A    | example.com     | points to 44.123.32.12 |

:::

:::note Example with a subdomain called, erxes.example.com

You first need to create a subdomain. For example, "erxes.example.com". Then you need to edit the **DNS**.

If your domain name is **erxes.example.com**, and the **IP address** assigned to your server is **44.123.32.12**, then you will have a two `A records` that look like this:

| Type | Name                  | Value                  |
| ---- | --------------------- | ---------------------- |
| A    | erxes.example.com     | points to 44.123.32.12 |
| A    | www.erxes.example.com | points to 44.123.32.12 |

**Note:** You do not need to create a subdomain called "erxes.example.com", you can use another name of your choice such as "admin.example.com".
:::

## Log into server as root and create erxes user

Open the terminal or command prompt on your computer. You will need your **IP address**. (In this example, **44.123.32.12**). Type `yes`, when asked if you want to continue connecting.

```bash
# example ssh root@44.123.32.12
ssh root@your-ip-address
```

(**Note**: Some people get an error, **WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!**, please see the solution [here](/installation/ubuntu-troubleshooting).)

You don't want to use the **root** user to administer your server. So everything will be done by a user called, **erxes**. To accomplish this, run the following commands:

Add a user called "erxes". When prompted, enter in a **unique** password. You will need to keep this password available, as later operations will require using it.

```bash
adduser erxes
```

(Finish adding the user simply by pressing the `enter` or `return` key through the questions.)

Grant the **erxes** user adminstrative rights.

```bash
usermod -aG sudo erxes
```
## Allow the "erxes" user to **SSH** into server

open the `sshd_config` file to edit

```bash
nano /etc/ssh/ssh_config
```

- Scroll down until you see `PasswordAuthentication`. Change it from `PasswordAuthentication no` to `PasswordAuthentication yes`. **NOTE**: Some servers have this line commented out with a `#`, like `# PasswordAuthentication no`. You will need to uncomment it by deleting the `#`.

- The line should look like this:

```bash
PasswordAuthentication yes
```

- Save and exit with `ctrl + x` and then `y` to accept the changes.

Reload the SSH config file

```bash
sudo service ssh restart
```

Exit from server, so that you can log back in as the **erxes** user

```bash
exit
```

You have created a new user called, **erxes** and you set-up a basic firewall to protect your server against malicious attacks.

Please continue with the following steps to log in to your server as the **erxes** user.

## Log in to your server as the "erxes" user.

Before you can log into your new server, we need to **add the SSH key** to your **local** computer.

**NOTE:** You need to use the **IP address** of your server.

- Run the following command and **create a new password**.

```bash
#ssh-copy-id erxes@44.123.32.12 <--- This is an example. Use your ip address
ssh-copy-id erxes@your-IP-address
```

Now you can log into your server as the **erxes** user.

- Log back into the server as the **erxes** user. You will need your IP address. (In this example, **44.123.32.12**). Enter your previously created password, if prompted.

```bash
# example ssh erxes@44.123.32.12 <--- This is an example. Use your ip address
ssh erxes@your-ip-address
```

### Installing prerequisites

1. Create `install.sh` file and copy the following script in it.

```
#!/bin/bash
echo -e "\e[1mStep 1 $now : Updating \e[0m"
sudo apt-get update -y
# nginx install
echo -e "\e[1mStep 1 $now : Installing Nginx \e[0m"
sudo apt install nginx -y
# docker install
sudo apt update -y
echo -e "\e[1mStep 1 $now : Installing docker \e[0m"
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
apt-cache policy docker-ce
sudo apt install docker-ce -y

echo -e "\e[1mStep 1 $now : Installing certbot \e[0m"
sudo apt install certbot python3-certbot-nginx -y

#docker-compose install
echo -e "\e[1mStep 1 $now : Installing docker compose \e[0m"
sudo apt-get update -y
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

sudo usermod -aG docker erxes
sudo chmod +x /usr/local/bin/docker-compose

echo -e "\e[1mStep 1 $now : Installing nodejs \e[0m"
#new directory
sudo apt-get install nodejs -y
echo -e "\e[1mStep 1 $now : Installing npm \e[0m"
sudo apt install npm -y
sudo npm install -g create-erxes-app -y
```

2. Run the following command to give a permission to `install.sh` file.

```
sudo chmod +x install.sh
```

3. Run `install.sh` file using the following command.

```
./install.sh
```

4 After installing relogin using erxes user.

```
exit
```

```bash
ssh erxes@your-ip-address
```

4. Creating erxes project. Type the domain to the field says "Please enter your domain (localhost)".

```
create-erxes-app erxes
```

```
Example: https://erxes-test.com
```

```
cd erxes
```

5. Choose deployment method

If you want to use docker swarm (default preferred method) run

```
docker swarm init
```

Fill db_server_address value of configs.json with your server address

```
"db_server_address": <server_address>,
```

Or if you want to use docker-compose create ```.env``` file with following content

```
DEPLOYMENT_METHOD=docker-compose
```

6. Start databases

```
npm run erxes deploy-dbs
```

7. Check and initiate mongodb

```
docker ps -a | grep mongo
```

```
docker exec -it <mongo container name> bash
```

```
mongo -u erxes -p <auto generated password in configs.json>
```

```
rs.initiate();
```

Many times, it becomes "RS0: primary".
These commands are given as a replica set, and when done correctly, the mongo shell changes to "RS0: primary".

Quit from mongo
```
exit
```

```
exit
```

8. Start application containers

```
npm run erxes up -- --uis
```

```
npm run erxes restart gateway
```

:::note

Containers are generated one by one, so wait until they finish reading. Meanwhile check for the status using

```
docker ps -a
```

Wait until gateway container status becomes healthy
:::

9. nginx .conf - ийг /etc/nginx/sites-enabled/ руу move хийх

```
sudo mv nginx.conf /etc/nginx/sites-enabled/erxes.conf
```

10. Configure your nginx.

```
sudo nginx -t
```

11. Restart your Nginx.

```
sudo service nginx restart
```

12. Configure your Free Ssl.

```
sudo certbot --nginx
```

13. Insert your registered email address.
14. Please choose redirect option.

Try typing your domain on your browser to see if it's working.

### Adding new plugins
Update plugins section of the configs.json file

```
"plugins": [
        {
            "name": "products"
        },
        {
            "name": "logs"
        },
        {
            "name": "engages"
        },
        {
            "name": "webbuilder"
        },
        {
            "name": "segments"
        },
        {
            "name": "tags"
        },
        {
            "name": "emailtemplates"
        },
        {
            "name": "internalnotes"
        },
        {
            "name": "forms"
        },
        {
            "name": "contacts"
        },
        {
            "name": "inbox"
        },
        {
            "name": "cards"
        },
        {
            "name": "knowledgebase"
        }
    ]
```

To run inbox with widgets (web messenger, forms)
add 

```
    "widgets": {}
```

in configs.json


Then run

```
npm run erxes up -- --uis
```

```
npm run erxes restart gateway
```

With docker-compose

```
docker-compose down
```

```
docker-compose up -d
```

### Running elasticsearch

```
cd erxes
```

Add following lines to configs.json

```
"essyncer": {},
"elasticsearch" : {},
```

Run

```
mkdir elasticsearchData && sudo chown -R 1000:1000 elasticsearchData
```

```
npm run erxes deploy-dbs
```

```
npm run erxes up
```

### Overriding default ports

Update the .env file with following values

```
GATEWAY_PORT=3300
UI_PORT=3000
MONGO_PORT=27017
REDIS_PORT=6379
RABBITMQ_PORT=5672
```

### Removing containers

With docker swarm

```
docker stack ls
docker stack rm erxes
```

With docker-compose

```
docker-compose -f docker-compose.yml down
```