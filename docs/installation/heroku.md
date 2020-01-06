---
id: heroku
title: Heroku
---

## Deploying erxes on Heroku

Heroku is a container-based cloud Platform as a Service (PaaS).

In order to deploy erxes and other related apps, you will need `mLab MongoDB` (MongoDB), `Heroku Redis` (Redis), and `CloudAMQP` (RabbitMQ) addons.

To add any addon to an app, you will need to register your credit card. So please add your creadit card and verify your account prior to proceeding further.

### One Click deployment

In this installation guide, we pretend the following app names will be available on Heroku and they will be used to demonstrate - we expect you to choose any available names on Heroku.

- **bat-erxes** - for `erxes`
- **bat-erxes-api** - for `erxes API`
- **bat-erxes-widget** - for `erxes Widget`
- **bat-erxes-widget-api** - for `erxes Widget API`

Try following the 4 steps to install all required apps on Heroku.

**Note** - When setting up config vars (environment vars), do not change the PORT numbers of all apps.

1.**Install erxes**

Please try clicking the deploy button below, then set all the config vars and hit the Deploy app button.

**Config vars:**

`REACT_APP_API_SUBSCRIPTION_URL = ws://bat-erxes-api.herokuapp.com/subscriptions` - **update it based on your app name you have chosen for erxes api**  
`REACT_APP_API_URL = https://bat-erxes-api.herokuapp.com` - **update it based on your app name you have chosen for erxes api**  
`REACT_APP_CDN_HOST = https://bat-erxes-widget.herokuapp.com` - **update it based on your app name you have chosen for erxes widget**  
`REACT_APP_CDN_HOST_API = https://bat-erxes-widget-api.herokuapp.com` - **update it based on your app name you have chosen for erxes widget api**

[![Deploy erxes](https://www.herokucdn.com/deploy/button.svg#heroku "Deploy erxes")](https://heroku.com/deploy?template=https://github.com/erxes/erxes)

2.**Install erxes API**

Now it's time to install erxes API - click the button below and set the config vars.

**Config vars:**

`AWS_ACCESS_KEY_ID = your_acess_key_id`  
`AWS_BUCKET = bucket_name`  
`AWS_PREFIX = prefix`  
`AWS_REGION = your_bucket_region`  
`AWS_SECRET_ACCESS_KEY = secret_key`  
`AWS_SES_ACCESS_KEY_ID = access_key`  
`AWS_SES_CONFIG_SET = config`  
`AWS_SES_SECRET_ACCESS_KEY = secret_key`  
`COMPANY_EMAIL_FROM = noreply@erxes.io`  
`DEFAULT_EMAIL_SERVICE = sendgrid`  
`DOMAIN = https://bat-erxes-api.herokuapp.com` - **update it based on your app name you have chosen for erxes api**  
`FILE_SYSTEM_PUBLIC = false`  
`HTTPS = true`  
`INTEGRATIONS_API_DOMAIN = https://ERXESINTEGRATIONSAPINAME.herokuapp.com`  
`MAIL_HOST = your_mail_host`  
`MAIL_PASS = pass`  
`MAIL_PORT = port`  
`MAIL_SERVICE = sendgrid`  
`MAIL_USER = your_user`  
`MAIN_APP_DOMAIN = https://bat-erxes.herokuapp.com` - **update it based on your app name you have chosen for erxes**  
`MONGO_URL = mongodb://` - leave it as is, we will update it later on  
`PORT = 3300`  
`PUBSUB_TYPE = REDIS`  
`REDIS_HOST = REDIS_HOST` - we will update it later on  
`REDIS_PASSWORD = REDIS_PASS` - we will update it later on  
`REDIS_PORT = 28229` - update it later on  
`UPLOAD_FILE_TYPES = image/png,image/jpeg,image/jpg,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,`  
`UPLOAD_SERVICE_TYPE = AWS`  
`USE_BRAND_RESTRICTIONS = false`  
`WIDGETS_API_DOMAIN = https://bat-erxes-widget-api.herokuapp.com` - **update it based on your app name you have chosen for widget api**  
`WIDGETS_DOMAIN = https://bat-erxes-widget.herokuapp.com` - **update it based on your app name you have chosen for widget**

[![Deploy erxes API](https://www.herokucdn.com/deploy/button.svg#heroku "Deploy erxes API")](https://heroku.com/deploy?template=https://github.com/erxes/erxes-api)

3.**Install erxes Widgets**

Now install erxes Widget app by clicking the deploy button below and set config vars.

**Config vars:**

`API_GRAPHQL_URL = https://bat-erxes-widget-api.herokuapp.com/graphql` - **update it based on your app name you have chosen for widget api**  
`API_SUBSCRIPTIONS_URL = ws://bat-erxes-api.herokuapp.com/subscriptions` - **update it based on your app name you have chosen for erxes api**  
`MAIN_API_URL = https://bat-erxes.herokuapp.com` - **update it based on your app name you have chosen for erxes**  
`PORT = 3200`  
`ROOT_URL = https://bat-erxes-widget.herokuapp.com` - **update it based on your app name you have chosen for widget**

[![Deploy Widgets](https://www.herokucdn.com/deploy/button.svg#heroku "Deploy erxes Widgets")](https://heroku.com/deploy?template=https://github.com/erxes/erxes-widgets)

4.**Install erxes Widgets API**

You are doing great! And now it's time to install last app - erxes Widgets API.

**Config vars:**

`MONGO_URL = mongodb://localhost/erxes`  
`PORT = 3100`  
`RABBITMQ_HOST = amqp://localhost` - we will update it later on  
`WIDGET_URL = https://bat-erxes-widget.herokuapp.com` - we will update it later on

[![Deploy Widgets API](https://www.herokucdn.com/deploy/button.svg#heroku "Deploy erxes Widgets API")](https://heroku.com/deploy?template=https://github.com/erxes/erxes-widgets-api)

Now go to Heroku dashboard and select the **erxes api app** from the Apps tab.

Go to Resources tab where you can manage your resources. You need to share MongoDB and RabbitMQ addons with **erxes widget api** app so that the erxes widget api will be able to access these two addons.

To do that, click a button 'Attached as RABBITMQ' in Add-ons section and then click 'Manage Attachments'.  
Now click '+ Attach to another app' button and search for 'erxes widget app' name you have chosen and select it.
Repeat the step for MongoDB.

If you find it difficult, please go to [Heroku Dev Center](https://devcenter.heroku.com/articles/managing-add-ons#using-the-dashboard-attaching-an-add-on-to-another-app).

Finally, you need to update config vars of **bat-erxes-api** and **bat-erxes-widget-api** apps.

Please go to **bat-erxes-api** app and select Settings tab.  
In the Config Vars section, click a button 'Reveal Config Vars'.  
Now you will be able to see all the config vars.  
Copy MONGO_URI's value and paste it into MONGO_URL.  
Copy RABBITMQ_URL's value and paste into RABBITMQ_HOST.  
Update REDIS_HOST, REDIS_PASSWORD, and REDIS_PORT values using REDIS_URL's value.

Now please go to **bat-erxes-widget-api** and update RABBITMQ_HOST and MONGO_URL config vars.  
Use CLOUDAMQP_URL and MONGODB_URI config vars values'.

Now it's time to grab yourself a cup of coffee and enjoy using **Erxes**.
