#!/bin/bash

# This script will install everything required to run a erxes and its related apps.
# This should be run on a clean debian 10 server.
#
# First, you will be asked to provide a domain name you are going to use for erxes.
# 
# Once the installation has completed you will be able to access the erxes.
# 
# * we expect you have configured your domain DNS settings already.

set -e

#
# Ask a domain name
#
while true; do
    read -p "Please enter a domain name you wish to use: " erxes_domain
    if [ -z "$erxes_domain" ]; then
        continue
    else
        break
    fi
done

#
# Dependencies
#
apt-get -qqy update
apt-get -qqy install -y curl wget gnupg apt-transport-https software-properties-common python3-pip

# MongoDB
echo "Installing MongoDB"
wget -qO - https://www.mongodb.org/static/pgp/server-3.6.asc | apt-key add -
echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/3.6 main" | tee /etc/apt/sources.list.d/mongodb-org-3.6.list
apt-get -qqy update
apt-get install -y mongodb-org
echo "Installed MongoDB successfully"
systemctl enable mongod
systemctl start mongod

# Redis server
echo "Installing Redis"
apt -qqy install -y redis-server
systemctl enable redis-server
systemctl start redis-server
echo "Installed Redis successfully"

# RabbitMQ
echo "Installing RabbitMQ"
curl -fsSL https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc | apt-key add -
tee /etc/apt/sources.list.d/bintray.rabbitmq.list <<EOF
## Installs the latest Erlang 22.x release.
## Change component to "erlang-21.x" to install the latest 21.x version.
## "bionic" as distribution name should work for any later Ubuntu or Debian release.
## See the release to distribution mapping table in RabbitMQ doc guides to learn more.
deb https://dl.bintray.com/rabbitmq-erlang/debian bionic erlang
deb https://dl.bintray.com/rabbitmq/debian bionic main
EOF
apt-get -qqy update
apt-get -qqy install rabbitmq-server -y --fix-missing
systemctl enable rabbitmq-server
rabbitmq-plugins enable rabbitmq_management
systemctl start rabbitmq-server
echo "Installed RabbitMQ successfully"

# Java 
echo "Installing Java"
apt-get -qqy install default-jre -y
echo "Installed Java successfully"

# Elasticsearch
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | tee -a /etc/apt/sources.list.d/elastic-7.x.list
apt-get -qqy update
apt-get -qqy install elasticsearch
systemctl enable elasticsearch
systemctl start elasticsearch
echo "Installed Elasticsearch successfully"

# Nginx
echo "Installing Nginx"
apt-get -qqy install -y nginx
echo "Installed Nginx successfully"

# nodejs 10
echo "Installing NodeJS"
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
apt -qqy install -y nodejs build-essential
echo "Installed Nginx successfully"

# Yarn package manager
echo "Installing Yarn package manager"
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
apt-get -qqy update
apt -qqy install -y yarn
echo "Installed Yarn successfully"


# username that erxes will be installed in
username=erxes

# create a new user erxes if it does not exist
id -u erxes &>/dev/null || useradd -m -s /bin/bash -U -G sudo $username

cd /home/$username

# erxes repo
erxes_root_dir=/home/$username/erxes
erxes_dir=$erxes_root_dir/ui
erxes_widgets_dir=$erxes_root_dir/widgets

# erxes-api repo
erxes_api_dir=/home/$username/erxes-api
erxes_engages_dir=$erxes_api_dir/engages-email-sender
erxes_logger_dir=$erxes_api_dir/logger
erxes_syncer_dir=$erxes_api_dir/elkSyncer
#erxes_email_verifier_dir=$erxes_api_dir/email-verifier

# erxes-integrations repo
erxes_integrations_dir=/home/$username/erxes-integrations

su $username -c "mkdir -p $erxes_dir $erxes_api_dir $erxes_integrations_dir"

# download erxes
su $username -c "curl -L https://github.com/erxes/erxes/archive/0.14.0.tar.gz | tar --strip-components=1 -xz -C $erxes_root_dir"

# download erxes-api
su $username -c "curl -L https://github.com/erxes/erxes-api/archive/0.14.0.tar.gz | tar --strip-components=1 -xz -C $erxes_api_dir"

# download integrations
su $username -c "curl -L https://github.com/erxes/erxes-integrations/archive/0.14.0.tar.gz | tar --strip-components=1 -xz -C $erxes_integrations_dir"

# install packages and build erxes
su $username -c "cd $erxes_dir && yarn install && yarn build"

# install erxes widgets packages
su $username -c "cd $erxes_widgets_dir && yarn install && yarn build"

# install erxes api packages
su $username -c "cd $erxes_api_dir && yarn install && yarn build"

# install erxes engages packages
su $username -c "cd $erxes_engages_dir && yarn install && yarn build"

# install erxes logger packages
su $username -c "cd $erxes_logger_dir && yarn install && yarn build"

# install erxes email verifier packages
# su $username -c "cd $erxes_email_verifier_dir && yarn install && yarn build"

# install erxes integrations packages
su $username -c "cd $erxes_integrations_dir && yarn install && yarn build"

# install pm2 globally
yarn global add  pm2

JWT_TOKEN_SECRET=$(openssl rand -hex 16)

# create an ecosystem.json in erxes home directory and change owner and permission
cat <<EOF >/home/$username/ecosystem.json
{
  "apps": [
    {
      "name": "erxes-api",
      "cwd": "$erxes_api_dir",
      "script": "dist",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT": 3300,
        "NODE_ENV": "production",
        "DEBUG": "erxes-api:*",
        "MAIN_APP_DOMAIN": "http://$erxes_domain",
        "LOGS_API_DOMAIN": "http://127.0.0.1:3800",
        "ENGAGES_API_DOMAIN": "http://127.0.0.1:3900",
        "MONGO_URL": "mongodb://localhost/erxes?replicaSet=rs0",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": 6379,
        "REDIS_PASSWORD": "",
        "RABBITMQ_HOST": "amqp://localhost",
        "JWT_TOKEN_SECRET": "$JWT_TOKEN_SECRET",
        "ELASTICSEARCH_URL": "http://localhost:9200"
      }
    },
    {
      "name": "erxes-api-cronjob",
      "cwd": "$erxes_api_dir",
      "script": "dist/cronJobs",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT_CRONS": 3600,
        "NODE_ENV": "production",
        "PROCESS_NAME": "crons",
        "DEBUG": "erxes-crons:*",
        "MONGO_URL": "mongodb://localhost/erxes?replicaSet=rs0",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": 6379,
        "REDIS_PASSWORD": "",
        "RABBITMQ_HOST": "amqp://localhost"
      }
    },
    {
      "name": "erxes-api-worker",
      "cwd": "$erxes_api_dir",
      "script": "dist/workers",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT_WORKERS": 3700,
        "NODE_ENV": "production",
        "DEBUG": "erxes-workers:*",
        "MONGO_URL": "mongodb://localhost/erxes?replicaSet=rs0",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": 6379,
        "REDIS_PASSWORD": "",
        "RABBITMQ_HOST": "amqp://localhost",
        "JWT_TOKEN_SECRET": "$JWT_TOKEN_SECRET"
      }
    },
    {
      "name": "erxes-widgets",
      "cwd": "$erxes_widgets_dir",
      "script": "dist",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT": 3200,
        "NODE_ENV": "production",
        "ROOT_URL": "http://$erxes_domain/widgets",
        "API_URL": "http://$erxes_domain/api",
        "API_SUBSCRIPTIONS_URL": "ws://$erxes_domain/api/subscriptions"
      }
    },
    {
      "name": "erxes-engages",
      "cwd": "$erxes_engages_dir",
      "script": "dist",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT": 3900,
        "NODE_ENV": "production",
        "DEBUG": "erxes-engages:*",
        "MAIN_API_DOMAIN": "http://$erxes_domain/api",
        "MONGO_URL": "mongodb://localhost/erxes-engages?replicaSet=rs0",
        "RABBITMQ_HOST": "amqp://localhost",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": 6379,
        "REDIS_PASSWORD": ""
      }
    },
    {
      "name": "erxes-logger",
      "cwd": "$erxes_logger_dir",
      "script": "dist",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT": 3800,
        "NODE_ENV": "production",
        "DEBUG": "erxes-logs:*",
        "MONGO_URL": "mongodb://localhost/erxes_logs?replicaSet=rs0",
        "RABBITMQ_HOST": "amqp://localhost"
      }
    },
    {
      "name": "erxes-integrations",
      "cwd": "$erxes_integrations_dir",
      "script": "dist",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT": 3400,
        "NODE_ENV": "production",
        "DEBUG": "erxes-integrations:*",
        "DOMAIN": "http://$erxes_domain/integrations",
        "MAIN_APP_DOMAIN": "http://$erxes_domain",
        "MAIN_API_DOMAIN": "http://$erxes_domain/api",
        "MONGO_URL": "mongodb://localhost/erxes_integrations?replicaSet=rs0",
        "RABBITMQ_HOST": "amqp://localhost",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": 6379,
        "REDIS_PASSWORD": ""
      }
    }
  ]
}
EOF

chown $username:$username /home/$username/ecosystem.json
chmod 644 /home/$username/ecosystem.json


# set up mongod ReplicaSet
systemctl stop mongod
mv /etc/mongod.conf /etc/mongod.conf.bak
cat<<EOF >/etc/mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  bindIp: localhost,$(hostname),$(hostname -I | sed 's/ /,/')
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
replication:
  replSetName: "rs0"
EOF
systemctl start mongod
curl https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh > /usr/local/bin/wait-for-it.sh
chmod +x /usr/local/bin/wait-for-it.sh
/usr/local/bin/wait-for-it.sh --timeout=0 localhost:27017
while true; do
    healt=$(mongo --eval "rs.initiate().ok" --quiet)
    if [ $healt -eq 0 ]; then
        break
    fi
done
echo "Started MongoDB ReplicaSet successfully"


# generate env.js
cat <<EOF >$erxes_dir/build/js/env.js
window.env = {
  PORT: 3000,
  NODE_ENV: "production",
  REACT_APP_API_URL: "http://$erxes_domain/api",
  REACT_APP_API_SUBSCRIPTION_URL: "ws://$erxes_domain/api/subscriptions",
  REACT_APP_CDN_HOST: "http://$erxes_domain/widgets"
};
EOF
chown $username:$username $erxes_dir/build/js/env.js
chmod 664 $erxes_dir/build/js/env.js

# make pm2 starts on boot
pm2 startup -u $username --hp /home/$username
systemctl enable pm2-$username

# start erxes pm2 and save current processes
su $username -c "cd /home/$username && pm2 start ecosystem.json && pm2 save"

# pip3 packages for elkSyncer
pip3 install mongo-connector==3.1.1 \
    && pip3 install elasticsearch==7.5.1 \
    && pip3 install elastic2-doc-manager==1.0.0 \
    && pip3 install python-dotenv==0.11.0

mkdir -p /var/log/mongo-connector/

# elkSyncer env
cat <<EOF >$erxes_syncer_dir/.env
MONGO_URL=mongodb://localhost/erxes?replicaSet=rs0
ELASTICSEARCH_URL=http://localhost:9200
EOF

cat <<EOF >/lib/systemd/system/erxes-api-elk-syncer.service
[Unit]
Description=erxes-api-elk-syncer
Documentation=https://docs.erxes.io
After=network.target

[Service]
WorkingDirectory=$erxes_syncer_dir
ExecStart=/usr/bin/python3 $erxes_syncer_dir/main.py
ExecStop=/bin/kill -INT $MAINPID
ExecReload=/bin/kill -TERM $MAINPID
Restart=on-failure
Type=simple

[Install]
WantedBy=multi-user.target
EOF
chmod 644 /lib/systemd/system/erxes-api-elk-syncer.service
systemctl daemon-reload
systemctl enable erxes-api-elk-syncer.service
systemctl start erxes-api-elk-syncer.service


# Nginx erxes config
cat <<EOF >/etc/nginx/sites-available/default
server {
        listen 80;
        
        server_name $erxes_domain;

        root /home/erxes/;
        index index.html;
        
        error_log /var/log/nginx/erxes.error.log;

        location / {
                root $erxes_dir/build;
                index index.html;
                error_log /var/log/nginx/erxes.error.log;

                location / {
                        try_files \$uri /index.html;
                }
        }

        # widgets is running on 3200 port.
        location /widgets/ {
                proxy_pass http://127.0.0.1:3200/;
                proxy_set_header Host \$http_host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_http_version 1.1;
                proxy_set_header Upgrade \$http_upgrade;
                proxy_set_header Connection "Upgrade";
        }

        # api project is running on 3300 port.
        location /api/ {
                proxy_pass http://127.0.0.1:3300/;
                proxy_set_header Host \$http_host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_http_version 1.1;
                proxy_set_header Upgrade \$http_upgrade;
                proxy_set_header Connection "Upgrade";
        }
        # erxes integrations project is running on 3400 port.
        location /integrations/ {
                proxy_pass http://127.0.0.1:3400/;
                proxy_set_header Host \$http_host;
                proxy_set_header X-Real-IP \$remote_addr;
                proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                proxy_http_version 1.1;
                proxy_set_header Upgrade \$http_upgrade;
                proxy_set_header Connection "Upgrade";
        }
}
EOF
# reload nginx service
systemctl reload nginx

echo
echo -e "\e[32mInstallation complete\e[0m"