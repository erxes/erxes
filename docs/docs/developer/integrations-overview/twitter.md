---
id: twitter
title: Twitter integration guide
---

Erxes app can be integrated with twitter developer API and that means we can receive our twitter accounts DMs, Tweets directly into our erxes app's inbox.

Requirements:

- [Create twitter app](https://developer.twitter.com/en/docs/basics/apps/overview) profile must be phone verified.

Notes:

- Twitter now allows you to receive DM from anyone. You don't have to follow each other. To enable this option
  go to https://twitter.com/settings/safety and select `Receive Direct Messages from anyone` from `Direct Messages` section.

**Configuration:**

- Go to Erxes Settings => System config => Integrations config => Twitter.

```

TWITTER_CONSUMER_KEY="your app consumer key"
TWITTER_CONSUMER_SECRET="your app consumer secret key"
TWITTER_ACCESS_TOKEN="your app consumer Secret"
TWITTER_ACCESS_TOKEN_SECRET=''
TWITTER_WEBHOOK_ENV=''

```

- `TWITTER_CONSUMER_KEY`, your twitter developer account's Consumer Key (API Key) here
- `TWITTER_CONSUMER_SECRET` your twitter developer account's Consumer Secret (API Secret) here
- `TWITTER_ACCESS_TOKEN` your twitter developer account's secret token ID (API Secret) here
- `TWITTER_ACCESS_TOKEN_SECRET` you should only change the domain of this env variables. This is twitter's callback url
- `TWITTER_WEBHOOK_ENV`='your twitter developer account`s dev environments value'

1. [Create twitter app](https://developer.twitter.com/en/docs/basics/apps/overview)
2. Fill the form with following example and create your application.

- Name: erxes.domain.com
- Website: erxes.domain.com
- Callback URL: https://erxes.domain.com/twitter/callback/add

3. Go to Permissions tab and select Read, Write and Access direct messages. Don't forget to Update settings button.

#### Erxes twitter integration settings.

1. Go to Erxes settings => App store
2. Click on **Add Twitter direct message**. Click on Authorize app.
3. Select your brand and click save.
4. Go to Setting=> Channel=> Add new channel=> Connect Twitter integration.