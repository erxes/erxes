---
id: deployment
title: Deployment
sidebar_label: Installation
---

## Preparing the installation

### Prerequisites

- Docker
- Docker-compose

### Installing on server

1. Install.sh файл үүсгэн бэлдэж доор script - ийг хуулах

```
#!/bin/bash
echo -e "\e[1mStep 1 $now : Update хийж байна \e[0m"
sudo apt-get update -y
# nginx install
echo -e "\e[1mStep 1 $now : Nginx суулгаж байна\e[0m"
sudo apt install nginx -y
# docker install
sudo apt update -y
echo -e "\e[1mStep 1 $now : docker  суулгаж байна\e[0m"
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
apt-cache policy docker-ce
sudo apt install docker-ce -y

echo -e "\e[1mStep 1 $now : certbot суулгаж байна\e[0m"
sudo apt install certbot python3-certbot-nginx

#user config
#sudo su
#passwd ubuntu
#sudo usermod -aG docker ubuntu
#su - ubuntu

#docker-compose install
echo -e "\e[1mStep 1 $now : docker compose  суулгаж байна\e[0m"
sudo apt-get update -y
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
echo -e "\e[1mStep 1 $now : nodejs суулгаж байна\e[0m"
#new directory
sudo apt-get install nodejs -y
echo -e "\e[1mStep 1 $now : awscli суулгаж байна\e[0m"
sudo apt-get install awscli -y
echo -e "\e[1mStep 1 $now : npm суулгаж байна\e[0m"
sudo apt install npm -y
echo -e "\e[1mStep 1 $now : erxes мэдээллээ оруулна уу\e[0m"
sudo npm install -g create-erxes-app -y
create-erxes-app erxes
```

2. Install.sh файлдаа permission өгөх комманд

```
 sudo chmod +x install.sh
```

3. Install.sh - ээ ажиллуулах

```
 ./install.sh
```

:::Caution

Install.sh ажиллаж байх үед  
Erxes мэдээллээ оруулна уу хэсэг гарж ирнэ.

:::

4. Please enter your domain (localhost) хэсэг дээр xos deploy хийгдэх домайн- оо бичнэ.

```
  Example: erxes-test.com
```

5. Rabbitmq host (optional) хэсэг дээр hostname оруулах

```
Example: erxes
```

6. Redis host (optional) хэсэг дээр hostname оруулах

```
Example: erxes
```

7. Redis port (6379) default - аараа байх ба press enter
8. Redis password (optional) хэсэг дээр дурын password өгөх
9. Elasticsearch url хэсэг дээр default localhost:9200 - аараа байх ба press enter
10. Үүний дараа erxes маань амжилттай суух ба erxes directory - луугаа орох хэрэгтэй.

```
 cd erxes
```

:::Info
See the latest version of npm erxes here https://www.npmjs.com/package/erxes

:::

11. Copy the text below instead of configs.json

```
{
   "jwt_token_secret": "strong_token",
   "db_server_address": "db_server_ip_address",
   "domain": "https://example.com",
   "elasticsearch": {},
   "redis": {
       "password": "strongest_password"
   },
   "mongo": {
       "username": "mongo_user",
       "password": "strongest_password"
   },
   "rabbitmq": {
       "cookie": "strongest_value",
       "user": "rabbitmq_user",
       "pass": "strongest_password",
       "vhost": "rabbitmq_host"
   },
   "plugins": [
       {  "name": "contacts" },
       {  "name": "inbox" },
       {  "name": "tags"  },
       {  "name": "cards" },
       {  "name": "segments" },
       {  "name": "integrations" }
   ]
}


```

12. This command installs a package, and any packages that it depends on.

```
npm install
```

13. User - дээ docker permission өгөх

```
su
usermod -aG docker erxes
su - erxes

```

14. Үүний дараа erxes directory - луугаа орох хэрэгтэй.

```
 cd erxes
```

15. Erxes дотроо дараах коммандыг өгөх

```
docker swarm init
```

:::Note
Database containers асаах комманд өгөөд бүх container асаж дууссаны дараа дараагын үйлдлээ хийх
:::

16. Run the following to start database containers

```
sudo npm run erxes deploy-dbs
```

17. Run the following to start application containers

```
   sudo npm run erxes up
```

18. See the generated docker services using the command below.

```
   docker service ls
```

19. Use the command below to view the finished docker containers

```
 docker ps -a
```

20. Copying below line code from docker-compose.yml

```
mongodb://username:password/erxes?authSource=admin
```

21. Copying this container url by using docker ps -a command

```
erxes-dbs_mongo.1.value bash
```

22. The mongo database must be started with a replica set.
    Use the following command to access the mongo database running docker container:

```
docker exec -it erxes-dbs_mongo.1.value bash
```

23. After trying running following command

```
rs.initiate()
```

Many times, it becomes "RS0: primary".
These commands are given as a replica set, and when done correctly, the mongo shell changes to "RS0: primary".

24. After completing the configuration on the mongo database, delete and restart the services through the docker network. First, do the database services.

docker stack rm erxes
docker stack rm erxes-dbs
npm run erxes deploy-dbs
npm run erxes up
npm run erxes up – –uis

:::Note
Containers are generated one by one, so wait until they finish reading.
:::

25. Check the log file in the erxes_gateway container to make sure the services are working properly.

```
docker logs -f erxes_gateway.1.value
```

If "plugin_name has no address value" is displayed, it is not connected to the database.

26. nginx .conf - ийг /etc/nginx/sites-enabled/ руу move хийх

```
sudo mv nginx.conf /etc/nginx/sites-enabled/

```

27. /etc/nginx/sites-enabled зам дээр очих

```
cd /etc/nginx/sites-enabled
```

28. nginx - ээ configure хийх

```
sudo nginx -t
```

29. Nginx - ээ restart хийх

```
sudo service nginx restart
```

30. Free Ssl тохируулж өгөх

```
sudo certbot –nginx -d domain_name
```

31. Бүртгэлтэй email бичих
32. Please choose redirect option

Одоо тестийн домайн - оо browser дээрээ бичиж орж үзэх.

### Default ports

Must be published to host machine network

- erxes main frontend app will run on port 3000
- erxes-widgets will run on port 3200
- erxes-api will run on port 3300
- erxes-integrations will run on port 3400
- erxes-dashboard-api will run on port 4300
- erxes-dashboard-front will run on port 4400

Should not published to host machine network, only used internally

- erxes-api (cron) will run on port 3600
- erxes-api (worker) will run on port 3700
- erxes-logger will run on port 3800
- redis server will run on port 6379
- mongodb server will run on port 27017
