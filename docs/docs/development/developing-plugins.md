---
id: developing-plugins
title: Developing Plugins
sidebar_label: Developing Plugins
---

With erxes, you can create your own plugins or extend the existing ones. This would help you to enhance your experience as well as increase your revenue by adding the value on your products and services or selling it on <a href="https://erxes.io/marketplace" target="_blank">our marketplace</a>. This guideline will help you to develop your own plugins.

:::caution

- Before you start developing plugins, please make sure there is no plugins with the same name or similar name that would be not bring any confusion as the name would be used many places starting from your api, graphql query, mutation, etc.
- Name must be in small letters with no symbols and space.
- Name of All your graphql type, query, mutation must start with your plugin name. 
- Names of your database collection also must start with your plugin name. 
- Name of UI routes or url-s also must be start with you pluging name. 

:::


## Installing erxes
---

Please go to **<a href="https://www.erxes.org/developer/ubuntu" target="_blank">the installation guideline</a>** to install erxes XOS, but no need to run the erxes with the same direction. 

:::warning

Before running erxes you need several other actions required in order to develop your own plugins at erxes XOS. Please make sure you shoul be back straight after you install erxes XOS using **<a href="https://www.erxes.org/developer/ubuntu" target="_blank">the installation guideline</a>**.

:::


### Plugin api

Plugin development in API part requires the following software prerequisites to be already installed on your computer.

- **[Typescript]**(https://www.typescriptlang.org/)
- **[GraphQL]**(https://graphql.org/graphql-js/)
- **[Express.js]**(https://expressjs.com)
- **[MongoDB]**(https://www.mongodb.com)
- **[Redis]**(https://redis.io)
- **[RabbitMQ]**(https://www.rabbitmq.com)

1. Create new `api` folder using the following command.

```
cd erxes
yarn create-plugin-api demo
```

### Plugin ui

Plugin development in UI part requires the following software prerequisites to be already installed on your computer.

- **[Typescript]**(https://www.typescriptlang.org/)
- **[Webpack]**(https://webpack.js.org/)
- **[ReactJS]**(https://reactjs.org)

2. Create new `ui` folder.

```
cd erxes
yarn create-plugin-ui demo
```

## Running erxes
---

3. Run the following command

```
cd erxes/cli
yarn install
```

4. Change the `configs.json` using the following command.

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

5. Then run the following command.

```
cd packages/gateway
yarn dev
```

6. Stop by pressing `ctl + c` with the following command.


```
cd ../../cli
```

7.  Run the following command to start if you're using Ubuntu.

```
./bin/erxes.js dev --bash --deps
```

Or MacOS

```
./bin/erxes.js dev --deps
```

### Configuring UI
---

### Placing new menu in UI navigation part 

1. Add new block in menu part of `packages/plugin-demo-ui/src/configs.js` file using the foloowing command.

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

2. Change `packages/plugin-demo-ui/src/routes.tsx` using the following command. 

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

3. Create `packages/plugin-demo-ui/src/containers/New.tsx` file with following content.  

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

4. Then run the following command to create your new `packages/plugin-demo-ui/src/components/New.tsx`file. 

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

1. `redis`

```
brew update
brew install redis
brew services start redis
```

2. `rabbitmq`

```
brew update
brew install rabbitmq
brew services start rabbitmq
```

3. `mongodb`

```
brew tap mongodb/brew
brew update
brew install mongodb-community@5.0
brew services start mongodb-community@5.0
```

Here you have everything in hand to develop your own plugins. If you still have questions, please contact us through **<a href="https://github.com/erxes/erxes/discussionsGithub" target="_blank">our community discussion</a>** or start conversation on **<a href="https://discord.com/invite/aaGzy3gQK5" target="_blank" target="_blank">Discord</a>**! We are happy to help 🤗🤗🤗
