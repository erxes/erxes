---
id: deploymentDocker
title: Deployment
sidebar_label: By Docker
---

The following documentation will guide you through the installation of an erxes project using <a href="https://www.docker.com/" target="_blank">**Docker**</a> on <a href="https://ubuntu.com/" target="_blank">**Ubuntu**</a> in order to use erxes. This the guideline will be dedicated to developers who is about to use erxes for their businesses only. If you want to customize or develop additional plugins on erxes, please go to <a href="https://docs.erxes.io/docs/intro">the developer installation guideline</a>.

Docker is an open platform that allows to develop, ship and run applications by using containers (i.e. packages containing all the parts an application needs to function, such as libraries and dependencies).

## Installation video
<iframe width="560" height="315" src="https://www.youtube.com/embed/TWFEcGMECpA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## First steps: Setting up a server with Ubuntu 22.10

You must have an account with your hosting provider prior to doing these steps.

- Choose a server size that corresponds with the **minimum** requirements for installing with **Quickstart**:
  - **Ubuntu 22.10 x64** installed and running
  - **4 CPU**
  - **minimum 8GB RAM**
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

### Log into server as root and create erxes user

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
### Allow the "erxes" user to **SSH** into server

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

### Log in to your server as the "erxes" user.

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

## Installing prerequisites

1. Create `install.sh` file using text editors such as nano or vim. Then copy the following script into it. Following content will install nginx, certbot, docker, docker-compose and nodejs into your server.

```
        #!/bin/bash
            now=$(date +'%H:%M:%S')
            echo -e "\e[1mStep 1 $now : updating \e[0m"
        sudo apt-get update -y
        # nginx install
            now=$(date +'%H:%M:%S')
            echo -e "\e[1mStep 2 $now : installing Nginx\e[0m"
        sudo apt install nginx -y
        # docker install
        sudo apt update -y
            now=$(date +'%H:%M:%S')
            echo -e "\e[1mStep 3 $now : installing docker  \e[0m"
        sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
        sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
        apt-cache policy docker-ce
        sudo apt install docker-ce -y
            now=$(date +'%H:%M:%S')
            echo -e "\e[1mStep 4 $now : installing certbot installing\e[0m"
        sudo apt install certbot python3-certbot-nginx -y
            now=$(date +'%H:%M:%S')
            echo -e "\e[1mStep 5 $now : installing docker compose  installing\e[0m"
        sudo apt-get update -y
        sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
            now=$(date +'%H:%M:%S')
            echo -e "\e[1mStep 6 $now : installing nodejs installing\e[0m"
        curl -sL https://deb.nodesource.com/setup_14.x -o setup_14.sh
        sudo sh ./setup_14.sh
        sudo apt-get install nodejs -y
            now=$(date +'%H:%M:%S')
            echo -e "\e[1mStep 7 $now : installing awscli installing\e[0m"
        sudo apt-get install awscli -y
            now=$(date +'%H:%M:%S')
            echo -e "\e[1mStep 8 $now : installing npm\e[0m"
        sudo apt install npm -y
            now=$(date +'%H:%M:%S')
            echo -e "\e[1mStep 9 $now : Please enter erxes domain name i.e(https://example.com)\e[0m"
        sudo npm install -g create-erxes-app -y
```

2. Before execute script the use below command to make `install.sh` file executable.

    ```
    sudo chmod +x install.sh
    ```

3. Execute `install.sh` file.

    ```
    ./install.sh
    ```

4. After above steps logout and relogin to your server using `erxes` user. In order to logout from server give following command

    ```
    exit
    ```
    **Note** (you might want to enter command few times if you logged in as root user before.)

    There are many ways to connect to your server but in this example we will use `ssh` to log back in use below command.
    ```
    ssh erxes@your-ipv4-address
    ```
## Starting erxes project

1. Below command will trigger erxes installation process.
    ```
    create-erxes-app erxes
    ```
    After the execution it will ask your erxes domain name

    **Note** Please use full domain or subdomain names including socket like below

    ```
    https://example.com
    ```
2. After above command there will be `erxes` directory includes mentioned files in it `docker-compose.yml, configs.json, package.json, nginx config`. In order to change to `erxes` directory use below command.
    ```
    cd /home/erxes/erxes
    ```
    In there we need to change erxes package version in `/home/erxes/erxes/package.json` file to <a href="https://www.npmjs.com/package/erxes/v/latest">latest</a> version.

3. Now you need to initiate docker swarm mode in order to do that use following command.

    **Note** In erxes directory we have docker-compose.yml file even with that we do not use `docker-compose up, docker-compose down, docker-compose restart` commands further.

    ```
    docker swarm init
    ```

    ```
    docker network create --driver=overlay --attachable erxes
    ```

4. Before start application services we need to start `databases`. Following command will start database services.
    ```
    npm run erxes deploy-dbs
    ```

5. To check database services up use following command it will shows you all running docker services id, name and state etc.

    ```
    docker ps -a | grep mongo
    ```
    wait until all services state become up.

6. Now we need to make our mongo have replica set. First we need to enter mongo container then enter mongo instance then execute command following 3 commands will do.

    ```
    docker exec -it <mongo container name> bash
    ```

    ```
    mongo -u erxes -p <auto generated password in configs.json>
    ```

    ```
    rs.initiate();
    ```
    **Note** you may want to hit `return or enter` button few times if we done correctly mongo shell will changes into `"RS0: primary"`

    To quit mongo instance and container `run exit command` twice.

7. Now we need to create `locales` directory in our working directory `/home/erxes/erxes` to do that use following command.

    ```
    mkdir locales
    ```

8. Start application services like erxes core uis and gateway services we run following command.

    ```
    npm run erxes up -- --uis
    ```
    **Note** After this step ui will be downloaded from AWS:s3 so make sure your server can communicate AWS instances without problem.


:::note

Containers are generated one by one, so wait until they finish reading. Meanwhile check for the status using

```
docker ps -a
```
To check docker services use
```
docker service ls
```
all erxes services needs to be up state

Wait until `gateway` container status becomes healthy also gateway container needs to be start at last.
:::

9. Now we need to setup our web server first we need to configure our nginx.service for erxes to do that we need to move `nginx.conf` generated by `create-app-erxes erxes` locates in `/home/erxes/erxes` to `/etc/nginx/sites-enabled/`. To do that use following command.

    ```
    sudo mv nginx.conf /etc/nginx/sites-enabled/erxes.conf
    ```

10. After that we need to test nginx config. To do that use following command.

    ```
    sudo nginx -t
    ```

    If something goes wrong you can replace `/etc/nginx/sites-enabled/nginx.conf` to following content

    ```
        server {
            server_name example.com;
            index index.html;
            client_max_body_size 50M;
            client_header_buffer_size 32k;

            location / {
                    access_log /var/log/nginx/erxes-front.access.log;
                    error_log /var/log/nginx/erxes-front.error.log;
                    proxy_pass http://127.0.0.1:3000;
                    proxy_http_version 1.1;
                    proxy_redirect off;
                    proxy_set_header Host $http_host;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-Host $host;
                    proxy_set_header X-Forwarded-Server $host;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header X-Forwarded-Proto $scheme;
            }

            location /widgets/ {
                    access_log /var/log/nginx/erxes-widgets.access.log;
                    error_log /var/log/nginx/erxes-widgets.error.log;
                    proxy_pass http://127.0.0.1:3200/;
                    proxy_set_header Upgrade $http_upgrade;
                    proxy_set_header Connection 'upgrade';
                    proxy_set_header Host $host;
                    proxy_set_header Host $http_host;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_http_version 1.1;
            }

            location /gateway/ {
                    access_log /var/log/nginx/erxes-api.access.log;
                    error_log /var/log/nginx/erxes-api.error.log;
                    proxy_pass http://127.0.0.1:3300/;
                    proxy_http_version 1.1;
                    proxy_buffering off;
                    proxy_redirect off;
                    proxy_set_header Host $http_host;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-Server $host;
                    proxy_set_header X-Forwarded-Host $host;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header X-Forwarded-Proto $scheme;
                    proxy_set_header Upgrade $http_upgrade;
                    proxy_set_header Connection "Upgrade";
            }

            location /mobile-app/ {
                    access_log /var/log/nginx/erxes-mobile-app.access.log;
                    error_log /var/log/nginx/erxes-mobile-app.error.log;
                    proxy_pass http://127.0.0.1:4100/;
                    proxy_http_version 1.1;
                    proxy_buffering off;
                    proxy_redirect off;
                    proxy_set_header Host $http_host;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-Server $host;
                    proxy_set_header X-Forwarded-Host $host;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header X-Forwarded-Proto $scheme;
                    proxy_set_header Upgrade $http_upgrade;
                    proxy_set_header Connection "Upgrade";
            }

            location /integrations/ {
                    access_log /var/log/nginx/erxes-integrations.access.log;
                    error_log /var/log/nginx/erxes-integrations.error.log;
                    proxy_pass http://127.0.0.1:3400/;
                    proxy_http_version 1.1;
                    proxy_redirect off;
                    proxy_set_header Host $http_host;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-Host $host;
                    proxy_set_header X-Forwarded-Server $host;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header X-Forwarded-Proto $scheme;
            }
            location /dashboard/front {
                    access_log /var/log/nginx/erxes-integrations.access.log;
                    error_log /var/log/nginx/erxes-integrations.error.log;
                    proxy_pass http://127.0.0.1:4200;
                    proxy_http_version 1.1;
                    proxy_redirect off;
                    proxy_set_header Host $http_host;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-Host $host;
                    proxy_set_header X-Forwarded-Server $host;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header X-Forwarded-Proto $scheme;
            }

            location /dashboard/api/ {
                    access_log /var/log/nginx/erxes-integrations.access.log;
                    error_log /var/log/nginx/erxes-integrations.error.log;
                    proxy_pass http://127.0.0.1:4300/;
                    proxy_http_version 1.1;
                    proxy_redirect off;
                    proxy_set_header Host $http_host;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-Host $host;
                    proxy_set_header X-Forwarded-Server $host;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
    ```

11. If nginx test shows successful message we need to restart Nginx. To do that use following command.

    ```
    sudo service nginx restart
    ```

12. Erxes only works in secure connection to generate free ssl certificate we use `Certbot`. To configure that use following command.

    **Note** you have to point domain A record to your erxes installing machine in order to get certificate without that certbot will not generate certificate.

    ```
    sudo certbot --nginx
    ```
    After this command it will ask your email and subscription accept that then will ask again about `redirect` option. We highly recommend always redirect option for security reasons.

    After that open browser and enjoy our product.


## Adding new plugins to erxes
Adding new plugins to erxes is easy task all you need to is add plugin name under `"plugins:"[{}]` in `/home/erxes/erxes/configs.json` file then run `npm run erxes up -- --uis` command. But for some plugins like dashboard does require some `extra` service we will discuss that in another section.
Below we have `ideal` configs.json file content that includes every `nessacery configuration lines` for `all plugins`. Please read following contents carefully some lines need some `replacement`.

    ```
    {
        "jwt_token_secret": "will be generated in configs.json",
        "db_server_address": "ipv4 of your machine",
        "image_tag": "dev",
        "domain": "https://example.com",
        "widgets": {
            "domain": "https://example.com/widgets"
        },
        "elasticsearch": {},
        "essyncer": {},
        "redis": {
            "password": "will be generated in configs.json"
        },

        "mongo": {
            "username": "erxes",
            "password": "will be generated in configs.json",
        },
        "rabbitmq": {
            "cookie": "",
            "user": "erxes",
            "pass": "will be generated in configs.json",
            "vhost": ""
        },

        "plugins": [
            {
                "name": "inbox",
                "extra_env": {
                    "INTEGRATIONS_MONGO_URL": "will be generated in docker-compose-dbs.yml",
                    "FB_MONGO_URL": "will be generated in docker-compose-dbs.yml"
                }
            },
            {
                "name": "cards"
            },
            {
                "name": "contacts"
            },
            {
                "name": "internalnotes"
            },
            {
                "name": "notifications"
            },
            {
                "name": "automations",
                "db_name": "erxes_automations"
            },
            {
                "name": "products"
            },
            {
                "name": "forms"
            },
            {
                "name": "inventories"
            },
            {
                "name": "segments"
            },
            {
                "name": "tags"
            },
            {
                "name": "engages"
            },
            {
                "name": "logs",
                "db_name": "erxes_logger"
            },
            {
                "name": "clientportal",
                "extra_env": {
                    "JWT_TOKEN_SECRET": ""
                        }
            },
            {
                "name": "webbuilder"
            },
            {
                "name": "knowledgebase"
            },
            {
                "name": "emailtemplates"
            },
            {
                "name": "integrations",
                "db_name": "erxes_integrations",
                "extra_env": {
                    "ENDPOINT_URL": "https://enterprise.erxes.io"
                }
            },
            {
                "name": "dashboard"
            },
            {
                "name": "documents"
            },
            {
                "name": "filemanager"
            },
            {
                "name": "facebook",
                "extra_env": {
                    "ENDPOINT_URL": "https://enterprise.erxes.io",
                    "MONGO_URL": "will be generated in docker-compose-dbs.yml"
                }
            }
        ]
    }
    ```
### Adding dashboard plugin

As we mentioned earlier dashboard plugin requires some extra step to install. First we need to generate `certificate for mongobi` to do that use following commands.

```
    openssl rand -base64 756 > mongo-key
    sudo chmod 400 mongo-key && sudo chown 999:999 mongo-key
    openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out certificate.pem --batch
    cat key.pem certificate.pem > mongo.pem
```
It will generate mongobi certificate.
After we need to add `mongobi` to configs.json file locates in `/home/erxes/erxes/configs.json` like below.

```
    "mongo": {
        "username": "erxes",
        "password": "will be generated in configs.json",
    },
    "mongobi:{},
```
At last run `npm run erxes up -- --uis`.

**Note** Everytime we change configs.json we do `npm run erxes up -- --uis` command to apply change.


### Running elasticsearch

If your server is bigger than our required size you can use erxes with elasticsearch. To do that following steps need to be taken.

1. Go into /home/erxes/erxes
    ```
    cd /home/erxes/erxes
    ```

2. Add following lines to configs.json positions does not matter.

    ```
    "essyncer": {},
    "elasticsearch" : {},
    ```
3. Then run deploy dbs again with following command.

    ```
    npm run erxes deploy-dbs
    ```

    ```
    npm run erxes up -- --uis
    ```

### Removing erxes

1. First this is sad but every server need to be tidy following few commands will remove docker stack and dangling containers of swarm.

    ```
    docker stack ls
    ```
    will show you stack informations. To leave that use following command.

    ```
    docker stack rm erxes
    ```

2. To remove all dangling containers use following commands.

    List and remove all dangling images.

    ```
    docker images -f dangling=true
    docker rmi $(docker images -q -f dangling=true)
    ```
    List and remove all dangling containers.

    ```
    docker ps -a -f status=exited
    docker rm $(docker ps -a -q -f status=exited)
    ```

    List and remove all dangling volumes

    **Note** volumes might have data in it so do it with your responsibility
    ```
    docker volume ls -f dangling=true
    docker volume rm $(docker volume ls -q -f dangling=true)
    ```
## Joining erxes community
If you have any trouble with installation please create issues in our <a href="https://github.com/erxes/erxes">github</a> or seek help from our community in <a href="https://discord.gg/rPf9FYaA3F">discord</a>