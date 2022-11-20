---
id: developing-integration-plugins
title: Create Integration plugin
sidebar_label: Create Integration plugin
---

Integration is the extent of the Inbox plugin, which allows third party softwares to be integrated to your shared Inbox. 

:::caution

Before you're moving forward, please have a read the **<a href="https://docs.erxes.io/docs/developer/developing-plugins">guideline</a>** how you create your own plugin and check out one of our existing integrations available at the **<a href="https://erxes.io/marketplace">marketplace</a>** called IMAP which can be found **<a href="https://github.com/erxes/erxes-community/tree/dev/packages">here</a>** as we're going to use IMAP integration as an example.

:::


So let's assume, you've already created your plugin by using the above guideline and the name of your plugin is IMAP.

Add the following Inbox-related plugins to configs.json and start the services.

```
	"plugins": [
		{
			"name": "forms",
			"ui": "remote"
		},
		{
			"name": "contacts",
			"ui": "local"
		},
		{
			"name": "inbox",
			"ui": "local"
		},
		{
			"name": "imap",
			"ui": "local"
		}
```

## These are the core concepts of the inbox integration

1. **Brand** - Biggest level of data seperation. Let's assume your company is a group company that consists of 3 child companies. In that case each brand will represent each child companies.
2. **Channel** - Group of integrations and team members, which represents who is responsible for which integrations.
3. **Integration** - In IMAP's case, a set of configs that includes email address, password, smtp host etc.
4. **Customer** - In IMAP's case, the person to sent the email.
5. **Conversation** - In IMAP's case, whole email thread.
6. **Conversation Messages** - In IMAP's case, each email entry in single email thread.

## Lifecycle of integration

1. Create an integration instance with corresponing configs, which will be store in inbox's database and later you will use these to work with the apis you want to connect.
2. Receive data from your desired apis using integration configs in plugin-{integration-name}-api.
3. Store the data as conversations, conversation messages, and customers. You have to store conversations in inbox's and customers in contacts's database and you have to store conversation messages in your plugin's database.
4. Once you stored the conversations and customers. It will show up in inbox's sidebar. But you will be responsive for the conversation detail in inbox's UI.
5. Since you can show anything in conversation detail will also be responsible for further actions like sending response to customer.

## Let's demonstrate above steps using IMAP as an example
### Create an integration

Let's look at configs.js in plugin-imap-ui

```
  inboxIntegration: {
    name: 'IMAP',
    description:
      'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
    isAvailable: true,
    kind: 'imap',
    logo: '/images/integrations/email.png',
    createModal: 'imap',
    createUrl: '/settings/integrations/imap',
    category:
      'All integrations, For support teams, Marketing automation, Email marketing'
  }
```

It will create following in block in /settings/integrations location

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/imapInboxIntegration.png" width ="70%" alt="imapInboxIntegration" />

```
    "./inboxIntegrationForm": "./src/components/IntegrationForm.tsx",
```

and

```
  inboxIntegrationForm: './inboxIntegrationForm',
```

these lines will show ```./src/components/IntegrationForm.tsx``` component when you click on the add link in the above picture

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/imapIntegrationForm.png" width ="70%" alt="imapIntegrationForm" />

When you click on the "Save" button, it will send the message to ```plugin-imap-api```. So you have to write a consumer like the following

```ts
consumeRPCQueue(
  'imap:createIntegration',
  async ({ subdomain, data: { doc, integrationId } }) => {
    const models = await generateModels(subdomain);

    const integration = await models.Integrations.create({
      inboxId: integrationId,
      ...doc
    });

    await listenIntegration(subdomain, integration);

    await models.Logs.createLog({
      type: 'info',
      message: `Started syncing ${integration.user}`
    });

    return {
      status: 'success'
    };
  }
);
  ```

  <a href="https://github.com/erxes/erxes-community/blob/dev/packages/plugin-imap-api/src/messageBroker.ts">here is the example</a>

### Receive data from your desired APIs

<a href="https://github.com/erxes/erxes-community/blob/dev/packages/plugin-imap-api/src/utils.ts">here is the code example</a>

### Store the data

1.

```ts
const apiCustomerResponse = await sendContactsMessage({
  subdomain,
  action: 'customers.createCustomer',
  data: {
    integrationId: integration.inboxId,
    primaryEmail: from
  },
  isRPC: true
});
```

it will send a createCustomer message to contacts plugin and contact plugin will store it in it's database.

2.

```ts
const { _id } = await sendInboxMessage({
  subdomain,
  action: 'integrations.receive',
  data: {
    action: 'create-or-update-conversation',
    payload: JSON.stringify({
      integrationId: integration.inboxId,
      customerId,
      createdAt: msg.date,
      content: msg.subject
    })
  },
  isRPC: true
});
```

it will send a create or update conversation message to inbox plugin and inbox plugin will store it in it's database.

### Conversation detail

in configs.js of plugin-imap-ui


```
"./inboxConversationDetail": "./src/components/ConversationDetail.tsx",
```

and 

```
inboxConversationDetail: './inboxConversationDetail',
```

will render ```./src/components/ConversationDetail.tsx``` component in conversation detail section of inbox ui

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/imapInboxConversationDetail.png" width ="100%" alt="imapInboxConversationDetail" />

## Creating new integration plugin


Each plugin is composed of two parts, `API` and `UI`

1. Create new folders for both using the following command.

```
cd erxes
yarn create-plugin
```

The command above starts CLI, prompting for few questions to create a new integration plugin as shown below. In this example we create twitter integration.

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/integration_create_cli.gif" width ="100%"alt="CLI screenshot"></img>

The example below is a new integration plugin, created from an example template, placed at the settings integration.

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/integration_list.png" width ="100%" alt="Integration list"></img>

The example below is a new integration plugins configuration, created from an example template, placed at the settings integrations config.

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/integration_config.png" width ="100%" alt="Integration config"></img>

The example below is a creating new example integration using the form.

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/integration_create.gif" width ="100%" alt="Integration create"></img>


The example below is a creating new integration with detail page. If you choose **with detail** choice in integration plugin UI template. You will link to detail page when clicking add button. 

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/integration_detail_page.gif" width ="100%" alt="Integration create"></img>

### API file structure

After creating an integration plugin, the following files are generated automatically in your integration plugin API. 

```
📦plugin-twitter-api
 ┣ 📂src
 ┃ ┣ 📂graphql
 ┃ ┃ ┣ 📂resolvers
 ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┣ mutations.ts
 ┃ ┃ ┃ ┗ queries.ts
 ┃ ┃ ┣ index.ts
 ┃ ┃ ┗ typeDefs.ts
 ┃ ┣ configs.ts
 ┃ ┣ controller.ts
 ┃ ┣ messageBroker.ts
 ┃ ┗ models.ts
 ┣ .env.sample
 ┣ package.json
 ┗ tsconfig.json
```
#### Main files

Following files are generated automatically in plugin-[pluginName]-api/src.

##### configs.ts

This file contains main configuration of an integration plugin.

<details>
  <summary>Click to see configs.ts file:</summary>

  ```ts showLineNumbers
    // path: ./packages/plugin-[pluginName]-api/src/configs.ts 

    import typeDefs from './graphql/typeDefs';
    import resolvers from './graphql/resolvers';

    import { initBroker } from './messageBroker';
    import init from './controller';

    export let mainDb;
    export let graphqlPubsub;
    export let serviceDiscovery;

    export let debug;

    export default {
      name: 'twitter',
      graphql: sd => {
        serviceDiscovery = sd;
        return {
          typeDefs,
          resolvers
        };
      },
      meta: {
        // this code will show the integration in UI settings -> integrations
        inboxIntegration: {
          kind: 'twitter',
          label: 'Twitter'
        }
      },
      apolloServerContext: async (context) => {
        return context;
      },

      onServerInit: async options => {
        const app = options.app;
        mainDb = options.db;

        debug = options.debug;
        graphqlPubsub = options.pubsubClient;

        initBroker(options.messageBrokerClient);

        // integration controller
        init(app);
      }
    };
  ```
</details>

##### controller.ts

This file contains integration controllers such as listening integration, connecting integration with erxes, and create conversation and customer. In this example shows message savings.

<details>
  <summary>Click to see controller.ts file: </summary>  

  ```ts showLineNumbers
    import { sendContactsMessage, sendInboxMessage } from './messageBroker';
    import { Customers, Messages } from './models';

    // util function
    const searchMessages = (linkedin, criteria) => {
      return new Promise((resolve, reject) => {
        const messages: any = [];

      });
    };

    // Example for save messages to inbox and create or update customer
    const saveMessages = async (
      linkedin,
      integration,
      criteria
    ) => {
      const msgs: any = await searchMessages(linkedin, criteria);

      for (const msg of msgs) {
        const message = await Messages.findOne({
          messageId: msg.messageId
        });

        if (message) {
          continue;
        }

        const from = msg.from.value[0].address;
        const prev = await Customers.findOne({ email: from });

        let customerId;

        if (!prev) {
          // search customer from contacts api
          const customer = await sendContactsMessage({
            subdomain: 'os',
            action: 'customers.findOne',
            data: {
              primaryEmail: from
            },
            isRPC: true
          });

          if (customer) {
            customerId = customer._id;
          } else {
            // creating new customer
            const apiCustomerResponse = await sendContactsMessage({
              subdomain: 'os',
              action: 'customers.createCustomer',
              data: {
                integrationId: integration.inboxId,
                primaryEmail: from
              },
              isRPC: true
            });

            customerId = apiCustomerResponse._id;
          }

          await Customers.create({
            inboxIntegrationId: integration.inboxId,
            contactsId: customerId,
            email: from
          });
        } else {
          customerId = prev.contactsId;
        }

        let conversationId;

        const relatedMessage = await Messages.findOne({
          $or: [
            { messageId: msg.inReplyTo },
            { messageId: { $in: msg.references || [] } },
            { references: { $in: [msg.messageId] } },
            { references: { $in: [msg.inReplyTo] } }
          ]
        });

        if (relatedMessage) {
          conversationId = relatedMessage.inboxConversationId;
        } else {
          const { _id } = await sendInboxMessage({
            subdomain: 'os',
            action: 'integrations.receive',
            data: {
              action: 'create-or-update-conversation',
              payload: JSON.stringify({
                integrationId: integration.inboxId,
                customerId,
                createdAt: msg.date,
                content: msg.subject
              })
            },
            isRPC: true
          });

          conversationId = _id;
        }

        await Messages.create({
          inboxIntegrationId: integration.inboxId,
          inboxConversationId: conversationId,
          createdAt: msg.date,
          messageId: msg.messageId,
          inReplyTo: msg.inReplyTo,
          references: msg.references,
          subject: msg.subject,
          body: msg.html,
          to: msg.to && msg.to.value,
          cc: msg.cc && msg.cc.value,
          bcc: msg.bcc && msg.bcc.value,
          from: msg.from && msg.from.value,
        });
      }
    };


    // controller for twitter
    const init = async app => {
      // write integration login method below
      app.get('/login', async (req, res) => {
        res.send("login")
      });
      
      app.post('/receive', async (req, res, next) => {
        try {
          // write receive message from integration code here

          res.send("Successfully receiving message");
        } catch (e) {
          return next(new Error(e));
        }

        res.sendStatus(200);
      });

    };

    export default init;
  ```
</details>


##### messageBroker.ts

This file uses for connect with other plugins. You can see message broker functions from <a href="https://docs.erxes.io/docs/code-reference/api/common-functions#message-broker-functions" target="_blank">**Common functions**</a>.

<details>
  <summary>Click to see messageBroker.ts file:</summary>

  ```ts showLineNumbers

  // path: ./packages/plugin-[pluginName]-api/src/messageBroker.ts 

    import * as dotenv from 'dotenv';
    import {
      ISendMessageArgs,
      sendMessage as sendCommonMessage
    } from '@erxes/api-utils/src/core';
    import { serviceDiscovery } from './configs';
    import { Customers, Integrations, Messages } from './models';

    dotenv.config();

    let client;

    export const initBroker = async cl => {
      client = cl;

      const { consumeRPCQueue } = client;

      consumeRPCQueue(
        'twitter:createIntegration',
        async ({ data: { doc, integrationId } }) => {

          await Integrations.create({
            inboxId: integrationId,
            ...(doc || {})
          });

          return {
            status: 'success'
          };
        }
      );

      consumeRPCQueue(
        'twitter:removeIntegration',
        async ({ data: { integrationId } }) => {

          await Messages.remove({ inboxIntegrationId: integrationId });
          await Customers.remove({ inboxIntegrationId: integrationId });
          await Integrations.remove({ inboxId: integrationId });

          return {
            status: 'success'
          };
        }
      );
    };

    export default function() {
      return client;
    }

    export const sendContactsMessage = (args: ISendMessageArgs) => {
      return sendCommonMessage({
        client,
        serviceDiscovery,
        serviceName: 'contacts',
        ...args
      });
    };

    export const sendInboxMessage = (args: ISendMessageArgs) => {
      return sendCommonMessage({
        client,
        serviceDiscovery,
        serviceName: 'inbox',
        ...args
      });
    };
  ```
</details>

#### GraphQL development

Inside `packages/plugin-<new_plugin>-api/src`, we have a <code>graphql</code> folder. The folder contains code related to GraphQL.

```
 📂src
 ┣ 📂graphql
 ┃ ┣ 📂resolvers 
 ┃ ┃ ┣ index.ts
 ┃ ┃ ┣ mutations.ts
 ┃ ┃ ┗ queries.ts
 ┃ ┣ index.ts
 ┃ ┗ typeDefs.ts
```

##### GraphQL resolvers

Inside `/graphql/resolvers/mutations` GraphQL mutation codes. 

<details>
  <summary>Click to see mutation examples:</summary>

  ```ts showLineNumbers
    import { Accounts } from '../../models';
    import { IContext } from "@erxes/api-utils/src/types"

    const twitterMutations = {
      async twitterAccountRemove(_root, {_id}: {_id: string}, _context: IContext) {
        await Accounts.removeAccount(_id);

        return 'deleted';
      }
    };

    export default twitterMutations;
  ```

</details>

Inside `/graphql/resolvers/queries` folder contains GraphQL query codes. 

<details>
  <summary>Click to see query examples:</summary>

  ```ts showLineNumbers
    import { IContext } from '@erxes/api-utils/src/types';
    import { Accounts, Messages } from '../../models';

    const queries = {
      async twitterConversationDetail(
        _root,
        { conversationId },
        _context: IContext
      ) {
        const messages = await Messages.find({
          inboxConversationId: conversationId
        });

        const convertEmails = emails =>
          (emails || []).map(item => ({ name: item.name, email: item.address }));

        return messages.map(message => {
          return {
            _id: message._id,
            mailData: {
              messageId: message.messageId,
              from: convertEmails(message.from),
              to: convertEmails(message.to),
              cc: convertEmails(message.cc),
              bcc: convertEmails(message.bcc),
              subject: message.subject,
              body: message.body,
            }
          };
        });
      },

      async twitterAccounts(_root, _args, _context: IContext) {
        return Accounts.getAccounts();
      }
    };

    export default queries;
  ```

</details>

##### GraphQL typeDefs
Inside `/graphql/typeDefs.ts` file contains GraphQL typeDefs. 

<details>
  <summary>Click to see typeDefs:</summary>

  ```ts showLineNumbers
    import { gql } from 'apollo-server-express';

    const types = `
      type Twitter {
        _id: String!
        title: String
        mailData: JSON
      }
    `;

    const queries = `
      twitterConversationDetail(conversationId: String!): [Twitter]
      twitterAccounts: JSON
    `;

    const mutations = `
      twitterAccountRemove(_id: String!): String
    `;

    const typeDefs = gql`
      scalar JSON
      scalar Date

      ${types}

      extend type Query {
        ${queries}
      }

      extend type Mutation {
        ${mutations}
      }
    `;

    export default typeDefs;
  ```
</details>


#### Database development

Inside `packages/plugin-<new_plugin>-api/src`, we have a <code>models</code> file. The file contains code related to MongoDB and mongoose.

```
📂src
┗ models.ts
```


##### Mongoose schema and model
Inside `src/models.ts`, file contains Mongoose schema and models.

<details>
  <summary>Click to see Mongoose schema and model example:</summary>

  ```ts showLineNumbers

  ```
</details>


### UI file structure
Automatically generated integration plugin UI's file structure same as general plugin. Only difference is configuring UI. If you want to see general plugin UI file structure <a href="https://docs.erxes.io/docs/developer/developing-plugins#ui-file-structure">click here</a>.


## Configuring UI

---

### Running port for plugin

Inside `packages/plugin-<new_plugin>-ui/src/configs.js`, running port for plugin UI is set as shown below. Default value is 3024. Please note that each plugin has to have its UI running on an unique port. You may need to change the port manually (inside `configs.js`) if developing multiple plugins.

```js 
module.exports = {
  name: 'twitter',
  scope: 'twitter',
  port: 3024,
  exposes: {
    './routes': './src/routes.tsx',

    // below components will work dynamically. In our case we call this components in inbox-ui.
    './inboxIntegrationSettings': './src/components/IntegrationSettings.tsx',
    './inboxIntegrationForm': './src/components/IntegrationForm.tsx',
    './inboxConversationDetail': './src/components/ConversationDetail.tsx'

  },
  routes: {
    url: 'http://localhost:3024/remoteEntry.js',
    scope: 'twitter',
    module: './routes'
  },

  // calling exposed components
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxIntegrationForm: './inboxIntegrationForm',
  inboxConversationDetail: './inboxConversationDetail',

  inboxIntegration: {
    name: 'Twitter',

    // integration desciption will show in integration box.
    description:
      'Please write integration description on plugin config file',
    
    // this variable shows that integration available in production mode. In development mode we always set true value.
    isAvailable: true,

    // integration kind will useful for call integration form dynamically 
    kind: 'twitter',

    // integration logo
    logo: '/images/integrations/twitter.png',
    
    // if you choose with detail page when creating an integration plugin using cli. When you click add button in integration box, integration will link to this url.
    createUrl: '/settings/integrations/twitter',
  }
};
```

### Plugins dynamic components 

Files where exposed components are called dynamically in plugin inbox UI.

#### inboxIntegrationSettings.tsx component

Inside `packages/plugin-inbox-ui/src/settings/integrationsConfig/components/IntegrationConfigs.tsx`, we have a `loadDynamicComponent` function. The code below shows the integrationConfigs component being called dynamically in the plugin inbox UI.

```ts
  {loadDynamicComponent(
    'inboxIntegrationSettings',
    {
      renderItem: this.renderItem
    },
    true
  )}
```


#### inboxIntegrationForm.tsx component

Inside `packages/plugin-inbox-ui/src/settings/integrations/containers/common/IntegrationForm.tsx`, we have a `loadDynamicComponent` function. The code below shows the integrationForm component being called dynamically in the plugin inbox UI.


```ts
return loadDynamicComponent(
  'inboxIntegrationForm',
  updatedProps,
  false,
  type
);
``` 

#### inboxConversationDetail.tsx component

Inside `packages/plugin-inbox-ui/src/inbox/components/conversationDetail/workarea/WorkArea.tsx`, we have a `loadDynamicComponent` function. The code below shows the inboxConversationDetail component being called dynamically in the plugin inbox UI.

```ts
content = loadDynamicComponent('inboxConversationDetail', {
  ...this.props
});
``` 

### Enabling plugins

"plugins" section inside `cli/configs.json` contains plugin names that run when erxes starts. Please note to configure this section if you decide to enable other plugins, remove or recreate plugins.

```json
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

## Running erxes

---

Please note that `create-plugin` command automatically adds a new line inside `cli/configs.json`, as well as installs the dependencies necessary.

```json
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
			"name": "forms",
			"ui": "remote"
		},
		{
			"name": "contacts",
			"ui": "local"
		},
		{
			"name": "inbox",
			"ui": "local"
		},
		{
			"name": "twitter",
			"ui": "local"
		},
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
