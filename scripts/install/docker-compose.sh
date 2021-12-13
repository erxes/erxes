#!/bin/bash
now=$(date +'%H:%M:%S')
echo "You need to configure erxes to work with your domain name. If you are using a subdomain, please use the entire subdomain. For example, 'erxes.examples.com'."
while true; do

    read -p "Please enter a domain name you wish to use: " erxes_domain

    if [ -z "$erxes_domain" ]; then
        continue
    else
        break
    fi
done
echo "your erxes will be works on $erxes_domain"
echo "Please enter username for mongo db"
while true; do
    read -p "username for mongo: " mongo_user
    if [ -z "$mongo_user" ]; then
        continue
    else
        break
    fi
done

echo "Please enter password for mongo db ->"
while true; do
    read -p "Password for mongo: " mongo_password
    if [ -z "$mongo_password" ]; then
        continue
    else
        break
    fi
done

echo "$now: generating docker-compose.yml file"



cat > docker-compose.yml << EOF
version: "2.4"
services:
  erxes:
    image: erxes/erxes:master
    container_name: erxes
    restart: unless-stopped
    environment:
      REACT_APP_CDN_HOST: https://$erxes_domain/widgets
      REACT_APP_API_URL: https://$erxes_domain/api
      REACT_APP_API_SUBSCRIPTION_URL: wss://$erxes_domain/api/subscriptions
      REACT_APP_DASHBOARD_URL: https://$erxes_domain/dashboard/front
      NGINX_HOST: $erxes_domain
    ports:
      - "127.0.0.1:3000:80"
    networks:
      - erxes-net

  erxes-api:
    image: erxes/erxes-api:master
    container_name: erxes-api
    restart: unless-stopped
    environment:
      # erxes-api
      PORT: "3300"
      NODE_ENV: production
      HTTPS: "true"
      DEBUG: "erxes-api:*"
      # public urls
      MAIN_APP_DOMAIN: https://$erxes_domain
      # non public urls
      LOGS_API_DOMAIN: http://erxes-logger:3800
      ENGAGES_API_DOMAIN: http://erxes-engages:3900
      WORKERS_API_DOMAIN: http://erxes-workers:3700
      AUTOMATIONS_API_DOMAIN: http://erxes-automations:4000
      # MongoDB
      MONGO_URL: mongodb://$mongo_user:$mongo_password@mongo:27017/erxes?authSource=admin&replicaSet=rs0
      # Elasticsearch
      ELASTICSEARCH_URL: http://elasticsearch:9200
      # Redis
      REDIS_HOST: "redis"
      REDIS_PORT: "6379"
      REDIS_PASSWORD: "erxes"
      # RabbitMQ
      RABBITMQ_URL: "amqp://rabbitmq:5672/erxes"
      JWT_TOKEN_SECRET: "erxes"
      # Email verifier
      EMAIL_VERIFIER_ENDPOINT: "https://email-verifier.erxes.io"
      # Dashboard domain
      DASHBOARD_DOMAIN: https://$erxes_domain/dashboard/front
      HELPERS_DOMAIN: https://helper.erxes.io
    ports:
      - "127.0.0.1:3300:3300"
    networks:
      - erxes-net

  erxes-automations:
    image: erxes/erxes-automations:master
    container_name: erxes-automations
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: "4000"
      MONGO_URL: mongodb://$mongo_user:$mongo_password@mongo:27017/erxes_automations?authSource=admin&replicaSet=rs0
      RABBITMQ_HOST: "amqp://rabbitmq:5672/erxes"
    ports:
      - "127.0.0.1:4000:4000"
    networks:
      - erxes-net

  erxes-crons:
    image: erxes/erxes-api:master
    container_name: erxes-crons
    entrypoint: ["node", "--max_old_space_size=8192", "dist/cronJobs"]
    restart: unless-stopped
    environment:
      # erxes-crons
      PORT_CRONS: "3600"
      NODE_ENV: production
      PROCESS_NAME: crons
      DEBUG: "erxes-crons:*"
      # MongoDB
      MONGO_URL: mongodb://$mongo_user:$mongo_password@mongo:27017/erxes?authSource=admin&replicaSet=rs0
      # RabbitMQ
      RABBITMQ_URL: "amqp://rabbitmq:5672/erxes"
      ELASTICSEARCH_URL: http://elasticsearch:9200
    ports:
      - "127.0.0.1:3600:3600"
    networks:
      - erxes-net

  erxes-workers:
    image: erxes/erxes-api:master
    container_name: erxes-workers
    entrypoint: ["node", "--max_old_space_size=8192", "--experimental-worker", "dist/workers"]
    restart: unless-stopped
    environment:
      # erxes-workers
      PORT_WORKERS: "3700"
      NODE_ENV: production
      DEBUG: "erxes-workers:*"
      # MongoDB
      MONGO_URL: mongodb://$mongo_user:$mongo_password@mongo:27017/erxes?authSource=admin&replicaSet=rs0
      # Redis
      REDIS_HOST: "redis"
      REDIS_PORT: "6379"
      REDIS_PASSWORD: "erxes"
      JWT_TOKEN_SECRET: "erxes"
      # RabbitMQ
      RABBITMQ_URL: "amqp://rabbitmq:5672/erxes"
      # Elasticsearch
      ELASTICSEARCH_URL: http://elasticsearch:9200
    ports:
      - "127.0.0.1:3700:3700"
    networks:
      - erxes-net

  erxes-widgets:
    image: erxes/erxes-widgets:master
    container_name: erxes-widgets
    restart: unless-stopped
    environment:
      # erxes widgets
      PORT: "3200"
      ROOT_URL: https://$erxes_domain/widgets
      API_URL: https://$erxes_domain/api
      API_SUBSCRIPTIONS_URL: wss://$erxes_domain/api/subscriptions
    ports:
      - "127.0.0.1:3200:3200"
    networks:
      - erxes-net

  erxes-integrations:
    image: erxes/erxes-integrations:master
    container_name: erxes-integrations
    restart: unless-stopped
    environment:
      PORT: "3400"
      NODE_ENV: production
      DEBUG: "erxes-integrations:*"

      # public urls
      DOMAIN: https://$erxes_domain/integrations
      MAIN_APP_DOMAIN: https://$erxes_domain
      MAIN_API_DOMAIN: https://$erxes_domain/api

      # MongoDB
      MONGO_URL: mongodb://$mongo_user:$mongo_password@mongo:27017/erxes_integrations?authSource=admin&replicaSet=rs0

      # RabbitMQ
      RABBITMQ_URL: "amqp://rabbitmq:5672/erxes"

      # Redis
      REDIS_HOST: "redis"
      REDIS_PORT: "6379"
      REDIS_PASSWORD: "erxes"

      # Dashboard
      ENDPOINT_URL: https://enterprise.erxes.io
    ports:
      - "127.0.0.1:3400:3400"
    networks:
      - erxes-net

  erxes-logger:
    image: erxes/erxes-logger:master
    container_name: erxes-logger
    restart: unless-stopped
    environment:
      PORT: "3800"
      DEBUG: "erxes-logs:*"
      # MongoDB
      MONGO_URL: mongodb://$mongo_user:$mongo_password@mongo:27017/erxes_logger?authSource=admin&replicaSet=rs0
      # RabbitMQ
      RABBITMQ_URL: "amqp://rabbitmq:5672/erxes"
    networks:
      - erxes-net

  erxes-engages:
    image: erxes/erxes-engages-email-sender:master
    container_name: erxes-engages
    restart: unless-stopped
    environment:
      PORT: "3900"
      NODE_ENV: production
      DEBUG: "erxes-engages:*"
      # public urls
      MAIN_API_DOMAIN: http://localhost:3300
      # MongoDB
      MONGO_URL: mongodb://$mongo_user:$mongo_password@mongo:27017/erxes_engages?authSource=admin&replicaSet=rs0
      # Redis
      REDIS_HOST: "redis"
      REDIS_PORT: "6379"
      REDIS_PASSWORD: "erxes"
      # RabbitMQ
      RABBITMQ_URL: "amqp://rabbitmq:5672/erxes"
    networks:
      - erxes-net

  erxes-elksyncer:
    image: erxes/erxes-elksyncer:master
    container_name: erxes-elksyncer
    restart: unless-stopped
    environment:
      DB_NAME: "erxes"
      ELASTICSEARCH_URL: http://elasticsearch:9200
      MONGO_URL: mongodb://$mongo_user:$mongo_password@mongo:27017/erxes?authSource=admin&replicaSet=rs0
    volumes:
        - ./mongoConnectorLog:/var/log/mongo-connector
    networks:
      - erxes-net

  erxes-dashboard-front:
    image: erxes/erxes-dashboard-front:master
    container_name: erxes-dashboard-front
    restart: unless-stopped
    ports:
      - "127.0.0.1:4200:80"
    environment:
      PORT: "4200"
      REACT_APP_API_URL: https://$erxes_domain/api
      REACT_APP_API_SUBSCRIPTION_URL: wss://$erxes_domain/api/subscriptions
      REACT_APP_DASHBOARD_API_URL: https://$erxes_domain/dashboard/api
      NGINX_HOST: $erxes_domain
    networks:
      - erxes-net

  erxes-dashboard-api:
    image: erxes/erxes-dashboard-api:master
    container_name: erxes-dashboard-api
    restart: unless-stopped
    ports:
      - "127.0.0.1:4300:4300"
    environment:
      DASHBOARD_DOMAIN: https://$erxes_domain/dashboard/front
      NODE_ENV: production
      PORT: "4300"
      CUBEJS_DB_TYPE: elasticsearch
      CUBEJS_DB_URL: http://elasticsearch:9200
      CUBEJS_URL: https://$erxes_domain/dashboard/api
      CUBEJS_API_SECRET: "erxes"
      REDIS_URL: redis://redis:6379
      REDIS_PASSWORD: "erxes"
      DB_NAME: "erxes"
    networks:
      - erxes-net

  mongo:
    hostname: mongo
    image: mongo:4.0.20
    container_name: mongo
    ports:
      - "127.0.0.1:27017:27017"
    healthcheck:
      test: test $$(echo "rs.initiate().ok || rs.status().ok" | mongo --quiet) -eq 1
      interval: 2s
      timeout: 2s
      retries: 200
    command: ["--replSet", "rs0", "--bind_ip_all"]
    # All erxes database will be saved into mounted directory below. <<IF YOU DELETE THIS MOUNTED DIRECTORY ALL OF YOUR ERXES DATA WILL BE LOST SO BE CAUTIOUS>>
    volumes:
      - ./data/db:/data/db
    networks:
      - erxes-net

  redis:
    image: 'redis'
    container_name: redis
    ports:
      - "127.0.0.1:6379:6379"
    networks:
      - erxes-net
    command: redis-server --requirepass erxes

  rabbitmq:
    image: rabbitmq:3.7.17-management
    container_name: rabbitmq
    restart: unless-stopped
    hostname: rabbitmq
    ports:
      - "127.0.0.1:15672:15672"
      - "127.0.0.1:5672:5672"
    networks:
      - erxes-net
    # RabbitMQ data will be saved into ./rabbitmq-data folder.
    volumes:
      - ./rabbitmq-data:/var/lib/rabbitmq

  elasticsearch:
    image: "docker.elastic.co/elasticsearch/elasticsearch:7.8.0"
    container_name: "elasticsearch"
    environment:
      - discovery.type=single-node
    ulimits:
      memlock:
        soft: -1
        hard: -1
      nofile:
        soft: 32768
        hard: 65536
    ports:
      - "127.0.0.1:9200:9200"
    networks:
      - erxes-net
    volumes:
      - ./elasticsearchData:/usr/share/elasticsearch/data

  kibana:
    image: "docker.elastic.co/kibana/kibana:7.5.2"
    container_name: "kibana"
    depends_on:
      - "elasticsearch"
    ports:
      - "127.0.0.1:5601:5601"
    networks:
      - erxes-net
networks:
  erxes-net:
    driver: bridge
EOF
echo "$now: docker-compose.yml generated successfuly"

#
# Creating ngxin config
#
cat > erxes.conf << EOF
server {
        server_name put_your_domain_here;
        index index.html;
	      client_max_body_size 80M;
        location / {
                access_log /var/log/nginx/erxes-front.access.log;
                error_log /var/log/nginx/erxes-front.error.log;
                proxy_pass http://127.0.0.1:3000;
                proxy_http_version 1.1;
                proxy_redirect off;
                proxy_set_header Host $http_host;
                proxy_set_header X-Real-IP ${remote_addr};
                proxy_set_header X-Forwarded-Host $host;
                proxy_set_header X-Forwarded-Server $host;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /widgets/ {
                access_log /var/log/nginx/erxes-widgets.access.log;
                error_log /var/log/nginx/erxes-widgets.error.log;
                proxy_pass http://127.0.0.1:3200/;
                proxy_http_version 1.1;
                proxy_redirect off;
                proxy_set_header Host $http_host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-Server $host;
                proxy_set_header X-Forwarded-Host $host;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/ {
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
                access_log /var/log/nginx/erxes-dashboard-front.access.log;
                error_log /var/log/nginx/erxes-dashboard-front.error.log;
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
                access_log /var/log/nginx/erxes-dashboard-api.access.log;
                error_log /var/log/nginx/erxes-dashboard-api.error.log;
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
EOF
echo "$now: Nginx configuration created successfully"



