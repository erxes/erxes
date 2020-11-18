#!/bin/bash

# This script will install everything required to run a erxes and its related apps.
# This should be run on a clean Ubuntu 18.04 server.
#
# First, you will be asked to provide a domain name you are going to use for erxes.
# 
# Once the installation has completed you will be able to access the erxes.
# 
# * we expect you have configured your domain DNS settings already as per the instructions.

set -Eeuo pipefail

trap notify ERR

NODE_VERSION=v12.19.0

ELASTICSEARCH_URL="http://localhost:9200"

OS_NAME=notset
DISTRO=notset
RELEASE=notset
ARCH=`uname -m`

case "$OSTYPE" in
  solaris*) OS_NAME="solaris" ;;
  darwin*)  
  	OS_NAME="darwin" 
	  RELEASE=`uname -r`
  ;; 
  linux*)   
  	OS_NAME="linux" 
	
    if [ -f /etc/redhat-release ] ; then
      DistroBasedOn='RedHat'
      DISTRO=`cat /etc/redhat-release |sed s/\ release.*//`
      PSUEDONAME=`cat /etc/redhat-release | sed s/.*\(// | sed s/\)//`
      RELEASE=`cat /etc/redhat-release | sed s/.*release\ // | sed s/\ .*//`
    elif [ -f /etc/SuSE-release ] ; then
      DistroBasedOn='SuSe'
      PSUEDONAME=`cat /etc/SuSE-release | tr "\n" ' '| sed s/VERSION.*//`
      RELEASE=`cat /etc/SuSE-release | tr "\n" ' ' | sed s/.*=\ //`
    elif [ -f /etc/mandrake-release ] ; then
      DistroBasedOn='Mandrake'
      PSUEDONAME=`cat /etc/mandrake-release | sed s/.*\(// | sed s/\)//`
      RELEASE=`cat /etc/mandrake-release | sed s/.*release\ // | sed s/\ .*//`
    elif [ -f /etc/debian_version ] ; then
      DistroBasedOn='Debian'
      DISTRO=`lsb_release -is`
      PSUEDONAME=`lsb_release -cs`
      RELEASE=`lsb_release -rs`
    fi
  ;;
  bsd*)     OS_NAME="bsd" ;;
  msys*)    OS_NAME="windows" ;;
  *)        OS_NAME="unknown: $OSTYPE" ;;
esac

CPU_DATA=""
CPUs=`lscpu | awk '/^CPU\(s\)/{print $2}'`
MODEL_NAME=`lscpu | awk -F ":" '/Model name:/{gsub(/^[ \t]+/,"",$2); print $2}'`
CPU_SPEED=`lscpu | awk -F ":" '/CPU MHz:/{gsub(/^[ \t]+/,"",$2); print $2}'`

for ((i=1;i<=$CPUs;i++)); 
do 
   CPU_DATA="$CPU_DATA {	\"model\": \"$MODEL_NAME\", \"speed\": \"$CPU_SPEED\"	},"
done
CPU_DATA=`echo $CPU_DATA | sed 's/,*$//g'`;

POST_DATA="$(cat <<EOF
  "osInformation": {
    "nodeVersion" : "$NODE_VERSION",
    "platform" : "$OS_NAME",
    "distro": "$DISTRO",
    "release" : "$RELEASE",
    "arch": "$ARCH",
    "cpus": [$CPU_DATA]
  }
EOF
)"

NOW="$(date +'%Y-%m-%d %H:%M:%S')"

function notify() {
  FAILED_COMMAND="Something went wrong on line $LINENO : Failed command: ${BASH_COMMAND}"
  
  curl -s -X POST https://telemetry.erxes.io/events/ \
    -H 'content-type: application/json' \
    -d "$(cat <<EOF
      [{
        "eventType": "CLI_COMMAND_installation_status",
        "errorMessage": "$FAILED_COMMAND",
        "message": "error",
        "time": "$NOW",
        $POST_DATA
      }]
EOF
      )"
}

#
# Ask a domain name
#
echo "You need to configure erxes to work with your domain name. If you are using a subdomain, please use the entire subdomain. For example, 'erxes.examples.com'."
while true; do

    read -p "Please enter a domain name you wish to use: " erxes_domain

    if [ -z "$erxes_domain" ]; then
        continue
    else
        break
    fi
done

# install curl for telemetry
apt-get -qqy install -y curl 

curl -s -X POST https://telemetry.erxes.io/events/ \
  -H 'content-type: application/json' \
  -d "$(cat <<EOF
      [{
        "eventType": "CLI_COMMAND_installation_status",
        "message": "attempt",
        "time": "$NOW",
        $POST_DATA
      }]
EOF
      )"

#
# Ask ES option
#
esMessage="Would you like to install ElasticSearch on your server or use our free ElasticSearch service https://elasticsearch.erxes.io ?"
while true; do
  esChoice=$(whiptail --radiolist --nocancel --title "ElasticSearch" "$esMessage" 20 50 2 -- 1 "Install ElasticSearch" "ON" 2 "Use elasticsearch.erxes.io" "OFF" 3>&1 1>&2 2>&3)
  if [ -z "$esChoice" ]; then
      continue
  else
      break
  fi
done

if [ $esChoice -eq 1 ];
then
  echo "ElasticSearch will be installed"
  # Java , elasticsearch dependency
  echo "Installing Java"
  apt-get -qqy update
  apt-get -qqy install default-jre -y
  echo "Installed Java successfully"

  # Elasticsearch
  # https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html
  wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
  echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | tee -a /etc/apt/sources.list.d/elastic-7.x.list
  apt-get -qqy update
  apt-get -qqy install elasticsearch
  systemctl enable elasticsearch
  systemctl start elasticsearch
  echo "Installed Elasticsearch successfully"
else
  ELASTICSEARCH_URL="https://elasticsearch.erxes.io"
  echo "Using elasticsearch.erxes.io"
fi

# Dependencies
echo "Installing Initial Dependencies"
apt-get -qqy update
apt-get -qqy install -y wget gnupg apt-transport-https software-properties-common python3-pip ufw

# MongoDB
echo "Installing MongoDB"
# MongoDB version 3.6+
# Latest MongoDB version https://www.mongodb.org/static/pgp/ 
# https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.2.list
apt-get -qqy update
apt-get install -y mongodb-org
echo "Installed MongoDB 4.2 successfully"
echo "Enabling and starting MongoDB..."
systemctl enable mongod
systemctl start mongod
echo "MongoDB enabled and started successfully"

# Nginx
echo "Installing Nginx"
apt-get -qqy install -y nginx
echo "Installed Nginx successfully"

## setting up ufw firewall
echo 'y' | ufw enable
ufw allow 22
ufw allow 80
ufw allow 443

# install certbot
echo "Installing Certbot"
add-apt-repository universe -y
add-apt-repository ppa:certbot/certbot -y
apt-get -qqy update
apt-get -qqy install certbot python3-certbot-nginx
echo "Installed Certbot successfully"

# username that erxes will be installed in
echo "Creating a new user called 'erxes' for you to use with your server."
username=erxes

# create a new user erxes if it does not exist
id -u erxes &>/dev/null || useradd -m -s /bin/bash -U -G sudo $username

# erxes directory
erxes_root_dir=/home/$username/erxes.io

su $username -c "mkdir -p $erxes_root_dir"
cd $erxes_root_dir

MONGO_PASS=$(openssl rand -hex 16)

# set mongod password
result=$(mongo --eval "db=db.getSiblingDB('admin'); db.createUser({ user: 'erxes', pwd: \"$MONGO_PASS\", roles: [ 'root' ] })" )
echo $result

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
  bindIp: localhost
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
replication:
  replSetName: "rs0"
security:
  authorization: enabled
EOF
systemctl start mongod

echo "Starting MongoDB..."
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

# install nvm and install node using nvm
su $username -c "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash"
su $username -c "source ~/.nvm/nvm.sh && nvm install $NODE_VERSION && nvm alias default $NODE_VERSION && npm install -g yarn pm2"

# make pm2 starts on boot
env PATH=$PATH:/home/$username/.nvm/versions/node/$NODE_VERSION/bin pm2 startup -u $username --hp /home/$username
systemctl enable pm2-$username

MONGO_URL="mongodb://erxes:$MONGO_PASS@localhost/erxes?authSource=admin\&replicaSet=rs0"

sourceCommand="source ~/.nvm/nvm.sh && nvm use $NODE_VERSION"
su $username -c "$sourceCommand && yarn create erxes-app erxes --quickStart --domain=$erxes_domain --mongoUrl=\"$MONGO_URL\" --elasticsearchUrl=$ELASTICSEARCH_URL"
cd erxes
su $username -c "$sourceCommand && yarn start"
cp nginx.conf /etc/nginx/sites-enabled/erxes.conf

nginx -t

# reload nginx service
systemctl reload nginx

su $username -c "$sourceCommand && cd $erxes_root_dir/erxes/build/api && node ./commands/trackTelemetry \"success\""

certbot run -n --nginx --agree-tos -d $erxes_domain --redirect --register-unsafely-without-email