#!/bin/bash

# This script will install everything required to run a erxes and its related apps.
# This should be run on a clean CentOS 8 server.
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
yum -qqy update
yum -qqy install -y wget gnupg

# MongoDB
cat <<EOF >/etc/yum.repos.d/mongodb-org-4.2.repo
[mongodb-org-4.2]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/4.2/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.2.asc
EOF
yum -qqy install -y mongodb-org
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

# create an user erxes if does not exist
id -u erxes &>/dev/null || useradd -m -s /bin/bash -U -G wheel $username

cd /home/$username

erxes_dir=/home/$username/erxes
erxes_api_dir=/home/$username/erxes-api
erxes_widgets_dir=/home/$username/erxes-widgets
erxes_engages_dir=/home/$username/erxes-engages
erxes_logger_dir=/home/$username/erxes-logger
erxes_integrations_dir=/home/$username/erxes-integrations

su $username -c "mkdir -p $erxes_dir $erxes_api_dir $erxes_widgets_dir $erxes_engages_dir $erxes_logger_dir $erxes_integrations_dir"

# download erxes
su $username -c "curl -L https://github.com/erxes/erxes/archive/0.12.0.tar.gz | tar --strip-components=1 -xz -C $erxes_dir"

# download erxes-api
su $username -c "curl -L https://github.com/erxes/erxes-api/archive/0.12.3.tar.gz | tar --strip-components=1 -xz -C $erxes_api_dir"

# download erxes-widgets
su $username -c "curl -L https://github.com/erxes/erxes-widgets/archive/0.12.0.tar.gz | tar --strip-components=1 -xz -C $erxes_widgets_dir"

# download engages email sender
su $username -c "curl -L https://github.com/erxes/erxes-engages-email-sender/archive/0.12.0.tar.gz | tar --strip-components=1 -xz -C $erxes_engages_dir"

# download logger
su $username -c "curl -L https://github.com/erxes/erxes-logger/archive/0.12.0.tar.gz | tar --strip-components=1 -xz -C $erxes_logger_dir"

# download integrations
su $username -c "curl -L https://github.com/erxes/erxes-integrations/archive/0.12.0.tar.gz | tar --strip-components=1 -xz -C $erxes_integrations_dir"

# install packages and build erxes
su $username -c "cd $erxes_dir && yarn install && yarn build"

# install erxes api packages
su $username -c "cd $erxes_api_dir && yarn install && yarn build"

# install erxes widgets packages
su $username -c "cd $erxes_widgets_dir && yarn install && yarn build"

# install erxes engages packages
su $username -c "cd $erxes_engages_dir && yarn install && yarn build"

# install erxes logger packages
su $username -c "cd $erxes_logger_dir && yarn install && yarn build"

# install erxes integrations packages
su $username -c "cd $erxes_integrations_dir && yarn install && yarn build"

# install pm2 globally
# yarn global add pm2 # somehow it didn't work in RHEL8
npm i -g pm2

JWT_TOKEN_SECRET=$(openssl rand -hex 16)

# create ecosystem.json in erxes home directory and change owner and permission
cat <<EOF >/home/$username/ecosystem.json
{
  "apps": [
    {
      "name": "erxes-api",
      "cwd": "erxes-api",
      "script": "dist",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT": 3300,
        "NODE_ENV": "production",
        "HTTPS": false,
        "DEBUG": "erxes-api:*",
        "DOMAIN": "http://$erxes_domain/api",
        "MAIN_APP_DOMAIN": "http://$erxes_domain",
        "WIDGETS_DOMAIN": "http://$erxes_domain/widgets",
        "INTEGRATIONS_API_DOMAIN": "http://$erxes_domain/integrations",
        "CRONS_API_DOMAIN": "http://127.0.0.1:3600",
        "WORKERS_API_DOMAIN": "http://127.0.0.1:3700",
        "LOGS_API_DOMAIN": "http://127.0.0.1:3800",
        "ENGAGES_API_DOMAIN": "http://127.0.0.1:3900",
        "MONGO_URL": "mongodb://localhost/erxes",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": 6379,
        "REDIS_PASSWORD": "",
        "RABBITMQ_HOST": "amqp://localhost",
        "PORT_CRONS": 3600,
        "PORT_WORKERS": 3700,
        "JWT_TOKEN_SECRET": "$JWT_TOKEN_SECRET"
      }
    },
    {
      "name": "erxes-api-cronjob",
      "cwd": "erxes-api",
      "script": "dist/cronJobs",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT_CRONS": 3600,
        "NODE_ENV": "production",
        "MONGO_URL": "mongodb://localhost/erxes",
        "DEBUG": "erxes-crons:*"
      }
    },
    {
      "name": "erxes-api-worker",
      "cwd": "erxes-api",
      "script": "dist/workers",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT_WORKERS": 3700,
        "NODE_ENV": "production",
        "MONGO_URL": "mongodb://localhost/erxes",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": 6379,
        "REDIS_PASSWORD": "",
        "DEBUG": "erxes-workers:*"
      }
    },
    {
      "name": "erxes-widgets",
      "cwd": "erxes-widgets",
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
      "cwd": "erxes-engages",
      "script": "dist",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT": 3900,
        "NODE_ENV": "production",
        "MAIN_API_DOMAIN": "http://$erxes_domain/api",
        "MONGO_URL": "mongodb://localhost/erxes-engages",
        "RABBITMQ_HOST": "amqp://localhost",
        "DEBUG": "erxes-engages:*"
      }
    },
    {
      "name": "erxes-logger",
      "cwd": "erxes-logger",
      "script": "dist",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT": 3800,
        "NODE_ENV": "production",
        "MONGO_URL": "mongodb://localhost/erxes_logs",
        "DEBUG_PREFIX": "erxes-logs"
      }
    },
    {
      "name": "erxes-integrations",
      "cwd": "erxes-integrations",
      "script": "dist",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      "env": {
        "PORT": 3400,
        "NODE_ENV": "production",
        "MONGO_URL": "mongodb://localhost/erxes_integrations",
        "DOMAIN": "http://$erxes_domain/integrations",
        "MAIN_APP_DOMAIN": "http://$erxes_domain",
        "MAIN_API_DOMAIN": "http://$erxes_domain/api",
        "RABBITMQ_HOST": "amqp://localhost"
      }
    }
  ]
}
EOF

chown $username:$username /home/$username/ecosystem.json
chmod 644 /home/$username/ecosystem.json

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

# erxes api load initial data
su $username -c "cd $erxes_api_dir && yarn loadInitialData && yarn loadPermission"

# make pm2 starts on boot
pm2 startup -u $username --hp /home/$username
systemctl enable pm2-$username

# start erxes pm2 and save current processes
su $username -c "cd /home/$username && pm2 start ecosystem.json && pm2 save"


# Nginx erxes config
cat <<EOF >/etc/nginx/conf.d/erxes.conf
server {
        listen 80;
        
        server_name $erxes_domain;

        root /home/erxes/;
        index index.html;
        
        error_log /var/log/nginx/erxes.error.log;

        location / {
                root /home/erxes/erxes/build;
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

chmod 750 /home/$username
chmod -R 750 $erxes_dir

# allow nginx to server build dir
chcon -Rt httpd_sys_content_t $erxes_dir/build/
setsebool -P httpd_can_network_connect on

# reload nginx service
systemctl reload nginx

echo
echo -e "\e[32mInstallation complete\e[0m"