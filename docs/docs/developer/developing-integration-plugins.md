---
id: developing-integration-plugins
title: Create Integration plugin
sidebar_label: Create Integration plugin
---

Integration is the extent of the Inbox plugin, which allows third party softwares to be integrated to your shared Inbox. 

:::caution

Before you're moving forward, please have a read the **<a href="https://docs.erxes.io/docs/developer/developing-plugins">guideline</a>** how you create your own plugin and check out one of our existing integrations available at the **<a href="https://erxes.io/marketplace">marketplace</a>** called IMAP which can be found **<a href="https://github.com/erxes/erxes-community/tree/dev/packages">here</a>** as we're going to use IMAP integration as an example.

:::


So let's assume, you've already created your plugin using the above guideline and the name of your plugin is IMAP.

Add the following inbox related plugins to configs.json and start the services.

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
3. **Integration** - In imap's case, a set of configs that includes email address, password, smtp host etc.
4. **Customer** - In imap's case, the person to sent the email.
5. **Conversation** - In imap's case, whole email thread.
6. **Conversation Messages** - In imap's case, each email entry in single email thread.

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

When you click on the save button it will send message to ```plugin-imap-api```. So you have to write a consumer like following

```
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

```
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

it will send a createCustomer message to contacts plugin and contact plugin will store it in it's database

2.

```
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

it will send a create or update conversation message to inbox plugin and inbox plugin will store it in it's database

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
