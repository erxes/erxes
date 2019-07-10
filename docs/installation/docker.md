---
id: docker
title: Docker
---

[erxes on docker hub](https://hub.docker.com/u/erxes/)

Try out erxes app on your machine under 5 minutes, without installing additional software on your machine.

1. Create a new directory somewhere on your machine
2. Save the following code as `docker-compose.yml` file.
3. Run `docker-compose up -d` (To stop: `docker-compose down`)
4. Run `docker exec -it erxes-api yarn initProject` command to create default admin account for you.
5. Go to `localhost:3000` on your browser, and you're ready to login.

```
(username: admin@erxes.io , password: erxes)
```


By default:
* erxes main frontend app will run on port 3000
* erxes-widgets-api will run on port 3100
* erxes-widgets will run on port 3200
* erxes-api will run on port 3300


**docker-compose.yml** file

```yaml
version: "3"
services:
  erxes:
    image: erxes/erxes:0.9.17
    container_name: erxes
    environment:
      REACT_APP_CDN_HOST: http://localhost:3200
      REACT_APP_CDN_HOST_API: http://localhost:3100
      REACT_APP_API_URL: http://localhost:3300
      REACT_APP_API_SUBSCRIPTION_URL: ws://localhost:3300/subscriptions
      NGINX_HOST: localhost
    ports:
      - "3000:80"
    networks:
      - erxes-net

  erxes-widgets-api:
    image: erxes/erxes-widgets-api:0.9.17
    container_name: erxes-widgets-api
    environment:
      NODE_ENV: production
      WIDGET_URL: http://localhost:3200
      MAIN_API_URL: http://localhost:3300/graphql
      MONGO_URL: mongodb://mongo/erxes
    ports:
      - "3100:3100"
    depends_on:
      - mongo
    networks:
      - erxes-net

  erxes-api:
    image: erxes/erxes-api:0.9.17
    container_name: erxes-api
    environment:
      REDIS_HOST: redis
      NODE_ENV: production
      MONGO_URL: mongodb://mongo/erxes
      USE_REPLICATION: "false"
      HTTPS: "false"
      WIDGETS_DOMAIN: http://localhost:3200
      MAIN_APP_DOMAIN: http://localhost:3000
      DOMAIN: http://localhost:3300
    ports:
      - "3300:3300"
    depends_on:
      - mongo
      - redis
    networks:
      - erxes-net

  erxes-widgets:
    image: erxes/erxes-widgets:0.9.17
    container_name: erxes-widgets
    environment:
      MAIN_API_URL: http://localhost:3300
      API_SUBSCRIPTIONS_URL: ws://localhost:3300/subscriptions
      API_GRAPHQL_URL: http://localhost:3100/graphql
      ROOT_URL: http://localhost:3200
    ports:
      - "3200:3200"
    networks:
      - erxes-net

  redis:
    image: redis:5.0.5
    container_name: redis
    ports:
      - "6379:6379"
    networks:
      - erxes-net
    # Redis data will be saved into ./redisdata folder.
    volumes:
      - ./redisdata:/data

  mongo:
    image: mongo:3.6
    container_name: mongo
    ports:
      - "27017:27017"
    networks:
      - erxes-net
    # MongoDB data will be saved into ./mongodata folder.
    volumes:
      - ./mongodata:/data/db

networks:
  erxes-net:
    driver: bridge
```

# Run erxes application as a service.

1. `docker-compose down` (stop current running apps)
2. `sudo vi /etc/systemd/system/docker-compose-erxes.service` (Paste the following code)
3. `sudo systemctl enable docker-compose-erxes` (Enables erxes app at startup)
4. `sudo systemctl start docker-compose-erxes` (Starts erxes app)

```
# /etc/systemd/system/docker-compose-erxes.service

[Unit]
Description=Docker Compose Erxes Application Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/erxes/
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

If you have trouble running erxes docker images, feel free to open [issue](https://github.com/erxes/erxes/issues).
