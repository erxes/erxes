---
id: developing-plugins
title: Developing Plugins
sidebar_label: Developing Plugins
---

With erxes, you can create your own plugins or extend the existing ones, which would help you to enhance your experience and increase your revenue by adding the value on your products/services or selling it on our **<a href="https://erxes.io/marketplace" target="_blank">our marketplace</a>**. This guideline will help you to develop your own plugins.

:::caution

- Before you start developing your own plugins, ensure there is no plugins with the same name or similar name in our marketplace that would bring any confusion as the name would be used many places starting from your `API`, `GraphQL`, `query`, `mutation`, etc.
- Name must be in small letters with no symbols and space in between.
- Name of All your `GraphQL` type, `query`, `mutation` must start with your plugin name.
- Names of your database collection also must start with your plugin name.
- Name of your **UIroutes** or `url`-s also must be start with you pluging name.

:::

## Installing erxes

---

Please go to **<a href="https://docs.erxes.io/docs/developer/ubuntu">the installation guideline</a>** to install erxes XOS, but no need to run the erxes with the same direction.

:::warning

We assume you've already installed erxes XOS on your device. Otherwise the guideline below would not work out properly. Please make sure you should be back after you install erxes XOS using **<a href="https://docs.erxes.io/docs/developer/ubuntu">the installation guideline</a>**.

:::

### Plugin API

Plugin development in API part requires the following software prerequisites to be already installed on your computer.

- **[Typescript](https://www.typescriptlang.org/)**
- **[GraphQL](https://graphql.org/graphql-js/)**
- **[Express.js](https://expressjs.com)**
- **[MongoDB](https://www.mongodb.com)**
- **[Redis](https://redis.io)**
- **[RabbitMQ](https://www.rabbitmq.com)**

### Plugin UI

Plugin development in UI part requires the following software prerequisites to be already installed on your computer.

- **[Typescript](https://www.typescriptlang.org/)**
- **[Webpack](https://webpack.js.org/)**
- **[ReactJS](https://reactjs.org)**

### Creating New Plugin

Each plugin is composed of two parts, `API` and `UI`

1. Create new folders for both using the following command.

```
cd erxes
yarn create-plugin
```

The command above starts CLI, prompting for few questions to create a new plugin as shown below.

<img src="/img/developing-plugins/plugin1.png" width ="100%"alt="CLI screenshot"></img>

The example below is a new plugin, created from an example template, placed at the main navigation.

<img src="/img/developing-plugins/plugin2.png" width ="100%"alt="CLI screenshot"></img>

Creating from an empty template will result in as shown below, as we give you the freedom and space to develop your own plugin on erxes.

<img src="/img/developing-plugins/plugin3.png" width ="100%"alt="CLI screenshot"></img>

## Running erxes

---

Please note that `create-plugin` command automatically adds a new line inside `cli/configs.json`, as well as installs the dependencies necessary.

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
	    "name": "new_plugin", "ui": "local"
		}
	]
}
```

2. Run the following command

```
cd erxes/cli
yarn install
```

3. Then run the following command to start erxes with your newly installed plugin

```
./bin/erxes.js dev
```

## Configuring UI

---

### Running port for plugin

Inside `packages/plugin-<new_plugin>-ui/src/configs.js`, running port for plugin UI is set as shown below. Default value is 3017. Please note that each plugin has to have its UI running on an unique port. You may need to change the port manually (inside `configs.js`) if developing multiple plugins.

```
module.exports = {
  name: 'new_plugin',
  port: 3017,
  scope: 'new_plugin',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'new_plugin',
    module: './routes'
  },
  menus: []
};
```

### Location for plugin

Inside `packages/plugin-<new_plugin>-ui/src/configs.js`, we have a configuration section. The example below places new plugin at the main navigation menu.

```
menus: [
  {
    text: 'New plugin',
    url: '/new_plugins',
    icon: 'icon-star',
    location: 'mainNavigation',
  }
]
```

If you want to place it only inside settings, example is illustrated below.

```
menus: [
  {
    text: 'New plugin',
    to: '/new_plugins',
    image: '/images/icons/erxes-18.svg',
    location: 'settings',
    scope: 'new_plugin'
  }
]
```

### Enabling plugins

"plugins" section inside `cli/configs.json` contains plugin names that run when erxes starts. Please note to configure this section if you decide to enable other plugins, remove or recreate plugins.

```
{
 "jwt_token_secret": "token",
 "dashboard": {},
 "client_portal_domains": "",
 "elasticsearch": {},
 "redis": {
   "password": ""
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
     "name": "logs"
   },
   {
     "name": "new_plugin",
     "ui": "local"
   }
 ]
}

```

### Installing dependencies using home brew

1. `redis`

````

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
```
````
