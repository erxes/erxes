---
id: developing-integration-plugins
title: Create Integration plugin
sidebar_label: Create Integration plugin
---

Integration is a kind of plugin that extends inbox plugin. Before reading this please checkout the <a href="https://docs.erxes.io/docs/developer/developing-plugins">Create plugin guide</a>.

These are the core concepts of the inbox integration
1. Brand
2. Channel
3. Integration
4. Conversation
5. Conversation Messages

In order to explain new integration creation let's usage already existing imap integration which can be found <a href="https://github.com/erxes/erxes-community/tree/main/packages">here</a>

So let's assume already created our plugin using above guide and let's say it's name is imap.

Add the flowing inbox related plugins to configs.json 
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

Let's look at configs.js in plugin-imap-ui

1.

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

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/imapInboxIntegration.png" width ="100%" alt="imapInboxIntegration" />

2.

```
    "./inboxIntegrationForm": "./src/components/IntegrationForm.tsx",
```

and

```
  inboxIntegrationForm: './inboxIntegrationForm',
```

these lines will show ```./src/components/IntegrationForm.tsx``` component when you click on the add link in the above picture

<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/imapIntegrationForm.png" width ="100%" alt="imapIntegrationForm" />

4.
When you click on the save button it will send message to ```plugin-imap-api```. So you have to write a consumer like following

```
  consumeRPCQueue(
    'imap:createIntegration',
    async ({ subdomain, data: { doc, integrationId } }) => {
      const models = await generateModels(subdomain);

      const integration = await models.Integrations.create({
        inboxId: integrationId,
        ...JSON.parse(doc.data || '{}')
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