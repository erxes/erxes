---
id: nylas-integrations
title: Nylas integrations
---

Connect your application to every email, calendar, and contacts provider in the world. Learn how to integrate Nylas Accounts With Erxes.

1. Create the Nylas account [here](https://dashboard.nylas.com/register)
2. Copy **NYLAS_CLIENT_ID**, **NYLAS_CLIENT_SECRET** from your app dashboard [here](https://dashboard.nylas.com/applications/)

**Configuration:**

- Go to Erxes Settings => System config => Integrations config => Nylas.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/nylas-1.png)

**For then test purpose you can use [ngrok](http://ngrok.io/) for your webhook**

```Shell
cd /path/to/erxes-integrations
ngrok http 3400
```

When you start erxes-integration repo webhook will automatically created according to your configuration and you can find in your Nylas app [dashboard](https://dashboard.nylas.com/)

#### Now we are ready to config our Nylas provider