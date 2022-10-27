---
id: deploymentDocker
title: Deployment
sidebar_label: By Docker
---

The following documentation will guide you through the installation of an erxes project using <a href="https://www.docker.com/" target="_blank">**Docker**</a> on <a href="https://ubuntu.com/" target="_blank">**Ubuntu**</a> in order to use erxes. This the guideline will be dedicated to developers who is about to use erxes for their businesses only. If you want to customize or develop additional plugins on erxes, please go to <a href="https://docs.erxes.io/docs/intro">the developer installation guideline</a>.

Docker is an open platform that allows to develop, ship and run applications by using containers (i.e. packages containing all the parts an application needs to function, such as libraries and dependencies).

## Preparing the installation

---

erxes installation requires at least four software prerequisites to be already installed on your computer:

:::caution

Erxes code takes approximately 12GB storage space, make sure you have enough space in your device before going forward.

:::

## Preparing the installation

### Prerequisites

- **Docker**
- **<a href="https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04">Docker</a>** (v20.10.14 and higher) The 20.10.14 version is most recommended by erxes. Docker compose (v2.5.0 and higher)

### Installing on server

1. Create `Install.sh` file and copy the following script in it.

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
sudo apt install certbot python3-certbot-nginx

#user config
#sudo su
#passwd ubuntu
#sudo usermod -aG docker ubuntu
#su - ubuntu

#docker-compose install
echo -e "\e[1mStep 1 $now : Installing docker compose \e[0m"
sudo apt-get update -y
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
echo -e "\e[1mStep 1 $now : Installing nodejs \e[0m"
#new directory
sudo apt-get install nodejs -y
echo -e "\e[1mStep 1 $now : Installing awscli \e[0m"
sudo apt-get install awscli -y
echo -e "\e[1mStep 1 $now : Installing npm \e[0m"
sudo apt install npm -y
echo -e "\e[1mStep 1 $now : Instert your erxes project\e[0m"
sudo npm install -g create-erxes-app -y
create-erxes-app erxes
```

2. Run the following command to give a permission to `Install.sh` file.

```
sudo chmod +x install.sh
```

3. Run `Install.sh` file using the following command.

```
./install.sh
```

:::caution

While `Install.sh` is running, the field to insert erxes data will show up.
:::

4. Type the domain to the field says "Please enter your domain (localhost)".

```
Example: https://erxes-test.com
```

```
cd erxes
```

5. Fill db_server_address value of configs.json with your server address

```
"db_server_address": <server_address>,
```

6. Choose deployment method

If you want to use docker swarm (default preferred method) run

```
docker swarm init
```

Or if you want to use docker-compose create ```.env``` file with following content

```
DEPLOYMENT_METHOD=docker-compose
```

7. Start databases

```
sudo npm run erxes deploy-dbs
```

8. Check and initiate mongodb

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

9. Start application containers

```
npm run erxes up -- --uis
```

:::note

Containers are generated one by one, so wait until they finish reading. Meanwhile check for the status using

```
docker ps -a
```

Wait until gateway container status becomes healthy
:::

10. nginx .conf - ийг /etc/nginx/sites-enabled/ руу move хийх

```
sudo mv nginx.conf /etc/nginx/sites-enabled/erxes.conf
```

11. Configure your nginx.

```
sudo nginx -t
```

12. Restart your Nginx.

```
sudo service nginx restart
```

13. Configure your Free Ssl.

```
sudo certbot --nginx
```

14. Insert your registered email address.
15. Please choose redirect option.

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


```
npm run erxes up -- --uis
```

With docker-compose

```
docker-compose down
```

```
docker-compose up -d
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