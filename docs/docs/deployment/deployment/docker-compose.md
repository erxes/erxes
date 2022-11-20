---
id: deploymentDockerCompose
title: Deployment
sidebar_label: By Docker Compose
---

# How to deploy Erxes using Docker-compose

In some cases, i.e: local test, already run other services, then we would not need to user docker-swarm, instead we can deploy Erxes using traditional docker-compose.


### Perquisite

As usual, to run self-hosted version, you would need a VPS/Dedicated server, with minimum specs: 4 vCores, 6Gb RAM


Erxes itself packed as docker images, so it would be able to run on any operation system that compatible with Docker, but Unix-like is preferable.


* NodeJS: Erxes has a CLI package to help you create erxes instance easily, this CLI require NodeJS to run, recommend NodeJS 16.x or above.
* Docker & Docker-compose: To run erxes app.
* Nginx: To serve Erxes app to public through 80/443 port


### Summarize of the progress


1. Install create-erxes-app package
2. Create erxes app
3. Deploy Databases instances
4. Deploy Applications (UI and API)
5. Nginx reserve proxy app


## In-depth guide:


First, we need to install Erxes CLI, using the following command:

```bash
npm i -g create-erxes-app
```


Create erxes app, using command:

```bash
create-erxes-app {erxes}
{crm.erxes.app}
```


After running, Erxes CLI will create a folder called "erxes" with neccessary files

```bash
cd erxes
```


Inside this folder, you should pay attention to 2 files: configs.json and .env.


configs.json: Contain configurations for Erxes CLI run in the next steps

```json
cat configs.json

{
  "jwt_token_secret": "2rZBQtWZ2W",
  "image_tag": "1.0.0",
  "db_server_address": "",
  "domain": "https://crm.erxes.app",
  "main_api_domain": "https://crm.erxes.app/gateway",
  "redis": {
    "password": "zX2ijZyHAO"
  },
  "mongo": {
    "username": "erxes",
    "password": "jQmeFBeWrB"
  },
  "rabbitmq": {
    "cookie": "",
    "user": "erxes",
    "pass": "sb3Balv6Lt",
    "vhost": ""
  },
  "widgets": {},
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
            "name": "integrations",
	    "db_name": "erxes_integrations"
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
            "name": "imap"
        },
        {
            "name": "knowledgebase"
        }
  ]
}
```


.env: Contain configurations to use for docker-compose

```yaml
cat .env

DEPLOYMENT_METHOD=docker-compose //must have, do not delete

GATEWAY_PORT=13301

UI_PORT=13001

MONGO_PORT=27018

REDIS_PORT=6388

RABBITMQ_PORT=15675
```

You can change the port number as you want


nginx.conf: Contain vhost and reserve proxy configuration for Nginx

```
cat nginx.conf

    server {
            listen 80;
            server_name crm.erxes.app;

            index index.html;
            error_log /var/log/nginx/erxes.error.log;
            access_log /var/log/nginx/erxes.access.log;
            location / {
                    proxy_pass http://127.0.0.1:13001/;
                    
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
  
            }
            location /widgets/ {
                    proxy_pass http://127.0.0.1:3200/;
                    
    proxy_set_header Upgrade $http_upgrade;
    
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
  
  
            }
            location /gateway/ {
                    proxy_pass http://127.0.0.1:13301/;
                    
    proxy_set_header Upgrade $http_upgrade;
    
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
  
  
            }


            location /dashboard/api {
                proxy_pass http://127.0.0.1:4300/;
                
    proxy_set_header Upgrade $http_upgrade;
    
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
  
  
            }
    }
```


### Deploy databases instances 

Since Erxes need databases, MongoDB - Redis - Elasticsearch, so we need to have them up first, using this command

```
npm run erxes deploy-dbs
```


Wait till mongo is running properly, login to your mongodb container

```bash
docker exec -it {mongodb-container-id} /bin/bash

mongo -u erxes -p {password-from-configs.json file}
rs.initiate();
exit
exit
```


### Deploy UIs & API

Basically, Erxes app contain 2 parts, UI and API. We had Database up and running properly, now we will deploy Erxes app.

```
npm run erxes up -- --uis
```

This will download UI component of Erxes

Note: Base on your configs.json file, Erxes CLI will download corresponding modules, and depend on number of modules it would take more time.


Then, we run

```
npm run erxes up
```


This will start Erxes API container. You can check Erxes container by using

```
docker ps -a
```

### Nginx Config


Erxes CLI already create for you the example nginx.conf file, which you can use for your vhost config.


```bash
sudo mv nginx.conf /etc/nginx/sites-enabled/erxes.conf
```


Complete, that's how we can deploy Erxes using docker-compose