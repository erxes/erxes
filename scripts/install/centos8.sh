#!/bin/bash

# This script will install everything required to run a erxes and its related apps.
# This should be run on a clean CentOS 8 server.
#
# First, you will be asked to provide a domain name you are going to use for erxes.
# 
# Once the installation has completed you will be able to access the erxes.
# 
# * we expect you have configured your domain DNS settings already.

set -Eeuo pipefail

trap notify ERR

function notify() {
  FAILED_COMMAND="Something went wrong on line $LINENO : Failed command: ${BASH_COMMAND}"
  # send data via curl
}

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
yum -qqy update
yum -qqy install -y wget gnupg python3 python3-pip

# MongoDB
cat <<EOF >/etc/yum.repos.d/mongodb-org-3.6.repo
[mongodb-org-3.6]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/8/mongodb-org/3.6/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-3.6.asc
EOF
yum -qqy install mongodb-org
systemctl enable mongod
systemctl start mongod

# Redis server
yum -qqy install -y redis
systemctl enable redis
systemctl start redis

# RabbitMQ
cat <<EOF >/etc/yum.repos.d/rabbitmq_erlang.repo
# In /etc/yum.repos.d/rabbitmq_erlang.repo
[rabbitmq_erlang]
name=rabbitmq_erlang
baseurl=https://packagecloud.io/rabbitmq/erlang/el/8/\$basearch
repo_gpgcheck=1
gpgcheck=1
enabled=1
# PackageCloud's repository key and RabbitMQ package signing key
gpgkey=https://packagecloud.io/rabbitmq/erlang/gpgkey
       https://dl.bintray.com/rabbitmq/Keys/rabbitmq-release-signing-key.asc
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300

[rabbitmq_erlang-source]
name=rabbitmq_erlang-source
baseurl=https://packagecloud.io/rabbitmq/erlang/el/8/SRPMS
repo_gpgcheck=1
gpgcheck=0
enabled=1
# PackageCloud's repository key and RabbitMQ package signing key
gpgkey=https://packagecloud.io/rabbitmq/erlang/gpgkey
       https://dl.bintray.com/rabbitmq/Keys/rabbitmq-release-signing-key.asc
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
metadata_expire=300
EOF
yum -qqy install erlang -y

rpm --import https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc
cat <<EOF > /etc/yum.repos.d/rabbitmq-3.8.repo
[bintray-rabbitmq-server]
name=bintray-rabbitmq-rpm
baseurl=https://dl.bintray.com/rabbitmq/rpm/rabbitmq-server/v3.8.x/el/8/
gpgcheck=0
repo_gpgcheck=0
enabled=1
EOF
yum -qqy update
yum -qqy install rabbitmq-server -y
systemctl enable rabbitmq-server
rabbitmq-plugins enable rabbitmq_management
systemctl start rabbitmq-server

# Java 
yum -qqy install java-11-openjdk -y

# Elasticsearch
rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
cat <<EOF | sudo tee /etc/yum.repos.d/elasticsearch.repo
[elasticsearch-7.x]
name=Elasticsearch repository for 7.x packages
baseurl=https://artifacts.elastic.co/packages/7.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
EOF
yum -qqy update
yum -qqy install elasticsearch -y
systemctl daemon-reload
systemctl enable elasticsearch.service
systemctl start elasticsearch.service

# Nginx
yum -qqy install -y nginx
systemctl enable nginx
systemctl start nginx

# nodejs 10
yum -qqy install -y nodejs

# Yarn package manager
curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | cat > /etc/yum.repos.d/yarn.repo
yum -qqy install -y yarn


# username that erxes will be installed on
username=erxes

NODE_VERSION=v12.16.3

# create an user erxes if does not exist
id -u erxes &>/dev/null || useradd -m -s /bin/bash -U -G wheel $username

# erxes user home directory
erxes_root_dir=/home/$username/erxes.io

su $username -c "mkdir -p $erxes_root_dir"
cd $erxes_root_dir

# erxes repo
erxes_ui_dir=$erxes_root_dir/ui
erxes_widgets_dir=$erxes_root_dir/widgets

# erxes-api repo
erxes_api_dir=$erxes_root_dir/erxes-api
erxes_engages_dir=$erxes_root_dir/engages-email-sender
erxes_logger_dir=$erxes_root_dir/logger
erxes_syncer_dir=$erxes_root_dir/elkSyncer
erxes_email_verifier_dir=$erxes_root_dir/email-verifier

# erxes-integrations repo
erxes_integrations_dir=$erxes_root_dir/erxes-integrations

su $username -c "mkdir -p $erxes_ui_dir $erxes_widgets_dir $erxes_api_dir $erxes_engages_dir $erxes_logger_dir $erxes_syncer_dir $erxes_email_verifier_dir $erxes_integrations_dir"

# download erxes ui
su $username -c "curl -L https://github.com/erxes/erxes/releases/download/0.15.5/erxes-0.15.5.tar.gz | tar --strip-components=1 -xz -C $erxes_ui_dir"

# download erxes widgets
su $username -c "curl -L https://github.com/erxes/erxes/releases/download/0.15.5/erxes-widgets-0.15.5.tar.gz | tar -xz -C $erxes_widgets_dir"

# download erxes-api
su $username -c "curl -L https://github.com/erxes/erxes-api/releases/download/0.15.5/erxes-api-0.15.5.tar.gz | tar -xz -C $erxes_api_dir"

# download engages-email-sender
su $username -c "curl -L https://github.com/erxes/erxes-api/releases/download/0.15.5/erxes-engages-email-sender-0.15.5.tar.gz | tar -xz -C $erxes_engages_dir"

# download logger
su $username -c "curl -L https://github.com/erxes/erxes-api/releases/download/0.15.5/erxes-logger-0.15.5.tar.gz | tar -xz -C $erxes_logger_dir"

# download elkSyncer
su $username -c "curl -L https://github.com/erxes/erxes-api/releases/download/0.15.5/erxes-elkSyncer-0.15.5.tar.gz | tar --strip-components=1 -xz -C $erxes_syncer_dir"

# download email-verifier
su $username -c "curl -L https://github.com/erxes/erxes-api/releases/download/0.15.5/erxes-email-verifier-0.15.5.tar.gz | tar -xz -C $erxes_email_verifier_dir"

# download integrations
su $username -c "curl -L https://github.com/erxes/erxes-integrations/releases/download/0.15.5/erxes-integrations-0.15.5.tar.gz | tar -xz -C $erxes_integrations_dir"

# install pm2 globally
# yarn global add pm2 # somehow it didn't work in RHEL8
# npm i -g pm2

JWT_TOKEN_SECRET=$(openssl rand -base64 24)
MONGO_PASS=$(openssl rand -hex 16)

API_MONGO_URL="mongodb://erxes:$MONGO_PASS@localhost/erxes?authSource=admin&replicaSet=rs0"

ENGAGES_MONGO_URL="mongodb://erxes:$MONGO_PASS@localhost/erxes-engages?authSource=admin&replicaSet=rs0"

EMAIL_VERIFIER_MONGO_URL="mongodb://erxes:$MONGO_PASS@localhost/erxes-email-verifier?authSource=admin&replicaSet=rs0"

LOGGER_MONGO_URL="mongodb://erxes:$MONGO_PASS@localhost/erxes_logs?authSource=admin&replicaSet=rs0"

INTEGRATIONS_MONGO_URL="mongodb://erxes:$MONGO_PASS@localhost/erxes_integrations?authSource=admin&replicaSet=rs0"

# create an ecosystem.json in $erxes_root_dir directory and change owner and permission
cat > $erxes_root_dir/ecosystem.json << EOF
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
        "MONGO_URL": "$API_MONGO_URL",
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
        "MONGO_URL": "$API_MONGO_URL",
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
      "node_args": "--experimental-worker",
      "env": {
        "PORT_WORKERS": 3700,
        "NODE_ENV": "production",
        "DEBUG": "erxes-workers:*",
        "MONGO_URL": "$API_MONGO_URL",
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
        "MONGO_URL": "$ENGAGES_MONGO_URL",
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
        "MONGO_URL": "$LOGGER_MONGO_URL",
        "RABBITMQ_HOST": "amqp://localhost"
      }
    },
    {
      "name": "erxes-email-verifier",
      "cwd": "$erxes_email_verifier_dir",
      "script": "dist",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT": 4100,
        "NODE_ENV": "production",
        "MONGO_URL": "$EMAIL_VERIFIER_MONGO_URL",
        "RABBITMQ_HOST": "amqp://localhost",
        "TRUE_MAIL_API_KEY": "",
        "CLEAR_OUT_PHONE_API_KEY": ""
      }
    },
    {
      "name": "erxes-elkSyncer",
      "cwd": "$erxes_syncer_dir",
      "script": "main.py",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "interpreter": "python3",
      "env": {
        "MONGO_URL": "$API_MONGO_URL",
        "ELASTICSEARCH_URL": "http://localhost:9200"
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
        "MONGO_URL": "$INTEGRATIONS_MONGO_URL",
        "RABBITMQ_HOST": "amqp://localhost",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": 6379,
        "REDIS_PASSWORD": ""
      }
    }
  ]
}
EOF

chown $username:$username $erxes_root_dir/ecosystem.json
chmod 644 $erxes_root_dir/ecosystem.json

# set mongod password
result=$(mongo --eval "db=db.getSiblingDB('admin'); db.createUser({ user: 'erxes', pwd: \"$MONGO_PASS\", roles: [ 'root' ] })" )
echo $result

# set up mongod ReplicaSet
systemctl stop mongod
mv /etc/mongod.conf /etc/mongod.conf.bak
cat<<EOF >/etc/mongod.conf
storage:
  dbPath: /var/lib/mongo
  journal:
    enabled: true
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  bindIp: localhost
processManagement:
  fork: true  # fork and run in background
  pidFilePath: /var/run/mongodb/mongod.pid
  timeZoneInfo: /usr/share/zoneinfo
replication:
  replSetName: "rs0"
security:
  authorization: enabled
EOF
systemctl start mongod
curl https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh > /usr/local/bin/wait-for-it.sh
chmod +x /usr/local/bin/wait-for-it.sh
/usr/local/bin/wait-for-it.sh --timeout=0 localhost:27017
while true; do
    healt=$(mongo --eval "db=db.getSiblingDB('admin'); db.auth('erxes', \"$MONGO_PASS\"); rs.initiate().ok" --quiet)
    if [ $healt -eq 0 ]; then
        break
    fi
done
echo "Started MongoDB ReplicaSet successfully"


# generate env.js
cat <<EOF >$erxes_ui_dir/js/env.js
window.env = {
  PORT: 3000,
  NODE_ENV: "production",
  REACT_APP_API_URL: "http://$erxes_domain/api",
  REACT_APP_API_SUBSCRIPTION_URL: "ws://$erxes_domain/api/subscriptions",
  REACT_APP_CDN_HOST: "http://$erxes_domain/widgets"
};
EOF
chown $username:$username $erxes_ui_dir/js/env.js
chmod 664 $erxes_ui_dir/js/env.js

# pip3 packages for elkSyncer
pip3 install -r $erxes_syncer_dir/requirements.txt

# elkSyncer env
cat <<EOF >$erxes_syncer_dir/.env
MONGO_URL=$API_MONGO_URL
ELASTICSEARCH_URL=http://localhost:9200
EOF

# install nvm and install node using nvm
su $username -c "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash"
su $username -c "source ~/.nvm/nvm.sh && nvm install $NODE_VERSION && nvm alias default $NODE_VERSION && npm install -g yarn pm2"

# make pm2 starts on boot
env PATH=$PATH:/home/$username/.nvm/versions/node/$NODE_VERSION/bin pm2 startup -u $username --hp /home/$username
systemctl enable pm2-$username

# start erxes pm2 and save current processes
su $username -c "source ~/.nvm/nvm.sh && nvm use $NODE_VERSION && cd $erxes_root_dir && pm2 start ecosystem.json && pm2 save"

# Nginx erxes config
cat <<EOF >/etc/nginx/conf.d/erxes.conf
server {
        listen 80;
        
        server_name $erxes_domain;

        root $erxes_ui_dir;
        index index.html;
        
        error_log /var/log/nginx/erxes.error.log;

        location / {
                root $erxes_ui_dir;
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

# add user nginx to erxes group
gpasswd -a nginx $username

chmod 750 /home/$username $erxes_root_dir
chmod -R 750 $erxes_ui_dir

# allow nginx to server build dir
chcon -Rt httpd_sys_content_t $erxes_ui_dir/
setsebool -P httpd_can_network_connect on

# reload nginx service
systemctl reload nginx

## setting up firewalld
yum install firewalld -y
systemctl enable firewalld
systemctl start firewalld
firewall-cmd --zone=public --add-service=ssh
firewall-cmd --zone=public --add-service=https
firewall-cmd --zone=public --add-service=http
firewall-cmd --zone=public --permanent --add-service=ssh
firewall-cmd --zone=public --permanent --add-service=https
firewall-cmd --zone=public --permanent --add-service=http

su $username -c "source ~/.nvm/nvm.sh && nvm use $NODE_VERSION && cd $erxes_api_dir && node ./dist/commands/trackTelemetry \"Installation completed successfully\""

echo
echo -e "\e[32mInstallation complete\e[0m"