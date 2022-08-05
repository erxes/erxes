---
id: plugin
title: Plugin development
sidebar_label: Plugins
---

### Important notes

Маш олон плагин ууд байх тул өөрсдийн плагиндаа тохирсон давхцахгүй нэр сонгох
шаардлагатай. Уг нэр нь api ийн graphql query, mutation ээс эхлээд маш олон газар ашиглагдана.

- plugin нэр нь зөвхөн жижиг үсгүүдээс бүрдсэн байх ёстой. Ямар нэг тусгай тэмдэгт, хоосон зай байж болохгүй
- Бүх graphql type, query, mutation заавал plugin нийхаа нэрээр эхэлсэн байх ёстой
- Бүх database collection ийн нэрүүд заавал plugin нийхаа нэрээр эхэлсэн байх ёстой
- UI ийн routes буюу url ууд нь заавал plugin ний нэрээр эхэлсэн байх ёстой

### Installing erxes
Erxes ийг ажилуулахын тулд доорх software уудыг суулгасан байх шаардлагатай


- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Node.js](http://nodejs.org)
- [Yarn](https://yarnpkg.com)
- [Docker](https://www.docker.com)

1. Татах
```
git clone git@github.com:erxes/erxes.git
```

2. federation branch руу шилжих
```
git checkout federation
```

3. node modules суулгах
```
cd erxes
yarn install
```

4. pm2 суулгах
```
sudo npm install -g pm2
```

### Installing dependencies using docker

docker-compose.yml file ийг доорх агуулгатайгаар үүсгэнэ

```
version: '3.6'
services:
  mongo:
    hostname: mongo
    image: mongo:4.0.10
    # container_name: mongo
    ports:
      - "27017:27017"
    networks:
      - erxes-net
    healthcheck:
      test: test $$(echo "rs.initiate().ok || rs.status().ok" | mongo --quiet) -eq 1
      interval: 2s
      timeout: 2s
      retries: 200
    command: ["--replSet", "rs0", "--bind_ip_all"]
    extra_hosts:
      - "mongo:127.0.0.1"
    volumes:
      - ./data/db:/data/db

  redis:
    image: 'redis'
    # container_name: redis
    # command: redis-server --requirepass pass
    ports:
      - "6379:6379"
    networks:
      - erxes-net

  rabbitmq:
    image: rabbitmq:3.7.17-management
    # container_name: rabbitmq
    restart: unless-stopped
    hostname: rabbitmq
    ports:
      - "15672:15672"
      - "5672:5672"
    networks:
      - erxes-net
    # RabbitMQ data will be saved into ./rabbitmq-data folder.
    volumes:
      - ./rabbitmq-data:/var/lib/rabbitmq

networks:
  erxes-net:
    driver: bridge
```

Тэгээд уг файл байгаа хавтас дотороо

```
docker-compose up -d
```

### Plugin api

api хэсэг нь дээр хөгжүүлэлт хийхийн тулд доорх технологуудийг эзэмшсэн байх шаардлагатай.

- [Typescript](https://www.typescriptlang.org/)
- [GraphQL](https://graphql.org/graphql-js/)
- [Express.js](https://expressjs.com)
- [MongoDB](https://www.mongodb.com)
- [Redis](https://redis.io)
- [RabbitMQ](https://www.rabbitmq.com)

api хавтас үүсгэх

```
cd erxes
yarn create-plugin-api demo
```

### Plugin ui

ui хэсэг нь дээр хөгжүүлэлт хийхийн тулд доорх технологуудийг эзэмшсэн байх шаардлагатай.

- [Typescript](https://www.typescriptlang.org/)
- [Webpack](https://webpack.js.org/)
- [ReactJS](https://reactjs.org)

ui хавтас үүсгэх

```
cd erxes
yarn create-plugin-ui demo
```

### Running

```
cd erxes/cli
yarn install
```

configs.json файлыг доорх байдлаар засна

```
{
	"jwt_token_secret": "token",
	"client_portal_domains": "",
	"elasticsearch": {},
	"redis": {
		"password": "pass"
	},
	"mongo": {
		"username": "",
		"password": ""
	},
	"rabbitmq": {
		"cookie": "",
		"user": "",
		"pass": "",
		"vhost": ""
	},
	"plugins": [
		{
			"name": "demo", "ui": "local"
		}
	]
}
```

Үүний дараа

```
cd packages/gateway
yarn dev
```

ctl + c дарж зогсоогоод


```
cd ../../cli
```

Ubuntu дээр
```
./bin/erxes.js dev --bash --deps
```

Mac дээр
```
./bin/erxes.js dev --deps
```

Комманд өгж асаана

### UI configs

UI ийн navigation хэсэгт шинэ цэс харуулхын тулд

1. packages/plugin-demo-ui/src/configs.js файлын menus хэсэгт шинэ блок нэмнэ

```
 menus: [
    {
      text: 'Demos',
      to: '/demos',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'demo'
    },


    {
      text: 'Demo new menu',
      to: '/demos-new',
      image: '/images/icons/erxes-18.svg',
      location: 'mainNavigation',
      scope: 'demo'
    }
  ]
```

2. packages/plugin-demo-ui/src/routes.tsx дараах байдлаар засна

```
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Demos" */ './containers/List')
);

const New = asyncComponent(() =>
  import(/* webpackChunkName: "List - Demos" */ './containers/New')
);

const demos = ({ history }) => {
  return <List history={history} />;
};

const demoNew = ({ history }) => {
  return <New />;
};

const routes = () => {
  return (
    <>
      <Route path="/demos/" component={demos} />;
      <Route path="/demos-new/" component={demoNew} />;
    </>
  );
};

export default routes;

```

3. packages/plugin-demo-ui/src/containers/New.tsx файлыг дараах агуулгатай үүсгээрэй

```
import React from 'react';
import New from '../components/New';

class NewContainer extends React.Component {
  render() {
    return <New {...this.props} />;
  }
}

export default NewContainer;
```

4. packages/plugin-demo-ui/src/components/New.tsx файлыг дараах агуулгатай үүсгээрэй

```
import React from 'react';

class New extends React.Component {
  render() {
    return (
      <div>New</div>
    );
  }
}

export default New;

```

```
./bin/erxes.js dev --ignoreRun
```

### Installing dependencies using home brew

1. redis

```
brew update
brew install redis
brew services start redis
```

2. rabbitmq

```
brew update
brew install rabbitmq
brew services start rabbitmq
```

3. mongodb

```
brew tap mongodb/brew
brew update
brew install mongodb-community@5.0
brew services start mongodb-community@5.0
```