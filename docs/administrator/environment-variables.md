---
id: environment-variables
title: Environment Variables
---

## MongoDB

```
MONGO_URL=mongodb://localhost/erxes
TEST_MONGO_URL=mongodb://localhost/test
```

- MONGO_URL is your application's database URL

- TEST_MONGO_URL is when you run

```
yarn test
```

it will create mongo database on that URL

- USE_REPLICATION Set this variables as True if you are using replication set in MONGO_URL which means Collection.watch method works as expected and can send notification

## Redis

```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

Redis is necessary for reactive subscriptions

- REDIS_HOST is your redis server's URL
- REDIST_PORT defines which port is redis running
- REDIS_PASSWORD fill this if you have password on your redis server

## General configs

```
HTTPS=false
MAIN_APP_DOMAIN=http://localhost:3000
WIDGETS_DOMAIN=http://localhost:3200
DOMAIN=http://localhost:3300
NODE_ENV=development
PORT=3300

ERXES_PATH=''
API_PATH=''
WIDGET_PATH=''
WIDGET_API_PATH=''

UPLOAD_SERVICE_TYPE=''
GOOGLE_CLOUD_STORAGE_BUCKET=''
```

- HTTPS this is boolean variables, set true if you are using secure ssl
- MAIN_APP_DOMAIN this is your main application's domain where is erxes/erxes repository is running
- WIDGETS_DOMAIN your widget application's domain where is erxes/widgets repository is running
- DOMAIN this is your erxes-api application's domain where is erxes/erxes-api repository is running
- NODE_ENV set to production on live mode, set to development on development mode
- PORT this option will define which port is your application running, you can change to any port you want
- UPLOAD_SERVICE_TYPE this is upload service type amazon s3 or gcs. GCS is short for Google Cloud Service
- GOOGLE_CLOUD_STORAGE_BUCKET defines the bucket of gcs

## Email settings

```
COMPANY_EMAIL_FROM=noreply@erxes.io
DEFAULT_EMAIL_SERVICE=sendgrid
MAIL_SERVICE=sendgrid
MAIL_PORT=''
MAIL_USER=''
MAIL_PASS=''
MAIL_HOST=''
```

- COMPANY_EMAIL_FROM transaction emails will be sent by this email address
- DEFAULT_EMAIL_SERVICE defines whether transaction emails sent by ses or other email services
- MAIL_SERVICE defines your email service's name
- MAIL_PORT your email service's port
- MAIL_USER defines your email service's login username
- MAIL_PASS defines your email service's login password
- MAIL_HOST your email service's host

## Twitter Settings

```
TWITTER_CONSUMER_KEY=''
TWITTER_CONSUMER_SECRET=''
TWITTER_REDIRECT_URL='https://erxes.domain.com/service/oauth/twitter_callback'
```

- TWITTER_CONSUMER_KEY Your twitter developer account's Consumer Key (API Key) here
- TWITTER_CONSUMER_SECRET Your twitter developer account's Consumer Secret (API Secret) here
- TWITTER_REDIRECT_URL you should only change the domain of this env variables. This is twitter's callback url

## Aws S3

```
AWS_ACCESS_KEY_ID=''
AWS_SECRET_ACCESS_KEY=''
AWS_BUCKET=''
AWS_PREFIX=''
```

- AWS_ACCESS_KEY_ID your amazon account's access key id
- AWS_SECRET_ACCESS_KEY your amazon account's secret access key
- AWS_BUCKET your s3 service's bucket name to use
- AWS_PREFIX you can use prefix names to specify the names of the files to be uploaded

## Aws SES

Engages are sent by ses service

```
AWS_SES_ACCESS_KEY_ID=''
AWS_SES_SECRET_ACCESS_KEY=''
AWS_SES_CONFIG_SET=''
AWS_REGION=''
AWS_ENDPOINT=''
```

- AWS_SES_ACCESS_KEY_ID your amazon account's access key id
- AWS_SES_SECRET_ACCESS_KEY your amazon account's secret access key
- AWS_SES_CONFIG_SET to detect bounce, complaints, click, open events you will need this option. This name can be anything
- AWS_REGION your amazon account's region
- AWS_ENDPOINT this is the URL where the amazon events sent to. Basically it is your erxes/erxes-api repository's path or domain

To be able to detect the ses events you should run this command in console

```
yarn engageSubscriptions
```

## Facebook

```
FACEBOOK_APP_ID=''
FACEBOOK_APP_SECRET=''
FACEBOOK_PERMISSIONS='manage_pages, pages_show_list, pages_messaging, publish_pages, pages_messaging_phone_number, pages_messaging_subscriptions'

```

- FACEBOOK_APP_ID is your faceboook application's app id
- FACEBOOK_APP_SECRET is your faceboook application's secret key
- FACEBOOK_PERMISSIONS you should not have to modify this option. Those are the necessary permissions for facebook integration

### Gmail

```
GOOGLE_CLIENT_ID=''
GOOGLE_CLIENT_SECRET=''
GOOGLE_APPLICATION_CREDENTIALS=''
GOOGLE_TOPIC=''
GOOGLE_SUBSCRIPTION_NAME=''
GOOGLE_PROJECT_ID=''
GMAIL_REDIRECT_URL = 'http://localhost:3000/service/oauth/gmail_callback'
```

- GOOGLE_CLIENT_ID your google project's Clint id
- GOOGLE_CLIENT_SECRET your google project's secret key
- GOOGLE_APPLICATION_CREDENTIALS Your downloaded google's credentials which is json file
- GOOGLE_TOPIC Your google cloud project's subscribed topic's name
- GOOGLE_SUBSCRIPTION_NAME Your google cloud project's subscription name
- GOOGLE_PROJECT_ID your google project's id
- GMAIL_REDIRECT_URL this is gmail's callback URL you should only change the domain of it
