---
id: integrations
title: Integrations
---

## Facebook Integration

Erxes app can be integrated with facebook developer API and that means we can receive our Facebook pages' inbox messages directly to our erxes app's inbox. With the help of Facebook developer API we have many more possibilities, like receiving notifications about page comment, page post feed etc. There is an active development process going on this subject.

Requirements:

- working sub domain with SSL pointing to your erxes-api server.
- facebook app's owner also must be an admin of facebook page that's going to connect.

## Creating facebook app.

1. Go to https://developers.facebook.com and create new app.<br />
   ( Your application status must be "Live" )
2. Your application must have these permissions: <br />
   `manage_pages, pages_show_list, pages_messaging, publish_pages` <br />
   (You can get these permissions through your App Review)
3. Go to you `erxes-api` directory and edit `.env` file like below: <br />
   `FACEBOOK_APP_ID='Your Facebook application's ID'` <br />
   `FACEBOOK_APP_SECRET='Your Facebook application's Secret code'` <br />
   You can get these informations from `settings` => `basic` from right side menu.
4. You must have `Facebook Login` product set up.
5. Go to `Facebook Login` => `Settings` fill the field names `Valid OAuth Redirect URIs` like below: <br />
   `<your erxes-api domain>/fblogin`
6. Now we are done on configurations. Go to your `App Store` => `Linked Accounts` to link your facebook accounts

## Getting facebook permissions (*manage_pages*, *publish_pages*)

**manage_pages:**

Grants an app permission to retrieve Page Access Tokens for the Pages and Apps that the app user administers. Apps that allow users to publish as a Page must also have the ***publish_pages*** permission.

To take this permission, you must complete the following 2 steps.

1. **Provide verification details. In this step, you must provide detailed step-by-step instructions on how a reviewer can test your integration and how you are using the requested permissions or features.** To do so,
    - You provide the testing account & password. (Note: Do not provide your personal Facebook account credentials.)
    - Then you provide each steps required to test your integration. For example:
        1. Navigate to <www.example.com>
        2. Login using by username: admin password: password
        3. Once you've accessed the website, click the <App store> button to connect their managed Facebook pages
        4. Then click the <Channels> button navigated in <Settings> to sort their pages. After completing these steps, our users can receive their managed FB page messenger messages, post comments, and likes. <publish_pages> permission will give our users to reply back to their posts and comments.

2. **Tell facebook how you will use this permission.** In this step, you must provide
    - a. a detailed description of how your app uses the permission or feature requested, how it adds value for a person using your app, and why it's necessary for app functionality.
    - b. a step-by-step video walkthrough of above.
    - c. [Here](https://bit.ly/2J6j5Oi) is a sample video.

**publish_pages:**

Grants your app permission to publish posts, comments, and like Pages managed by a person using your app. Also requires the ***manage_pages*** permission.

To take this permission, you must complete the following 3 steps.

1. **Provide verification details. In this step, you must provide detailed step-by-step instructions on how a reviewer can test your integration and how you are using the requested permissions or features.** To do so,
    - You provide the testing account & password. (Note: Do not provide your personal Facebook account credentials.)
    - Then you provide each steps required to test your integration. For example:
        1. Navigate to <www.example.com>
        2. Login using by username: admin password: password
        3. Once you've accessed the website, click the <App store> button to connect their managed Facebook pages
        4. Then click the <Channels> button navigated in <Settings> to sort their pages. After completing these steps, our users can receive their managed FB page messenger messages, post comments, and likes. <publish_pages> permission will give our users to reply back to their posts and comments.

2. **Tell facebook how you will use this permission.** In this step, you must provide
    - a. a detailed description of how your app uses the permission or feature requested, how it adds value for a person using your app, and why it's necessary for app functionality.
    - b. a step-by-step video walkthrough of above.
    - c. your subbmission must include ***manage_pages*** permission
    - d. [Here](https://bit.ly/2J6j5Oi) is a sample video.

3. **Tell facebook how you will use *manage_pages* permission if you haven't taken it yet.**

## Twitter Integration

Erxes app can be integrated with twitter developer API and that means we can receive our twitter accounts DMs, Tweets directly into our erxes app's inbox.

Requirements:

- To create twitter app, profile must be phone verified.

Notes:

- Twitter now allows you to receive DM from anyone. You don't have to follow each other. To enable this option
  go to https://twitter.com/settings/safety and select `Receive Direct Messages from anyone` from `Direct Messages` section.

### Creating Twitter app.

1. Go to https://apps.twitter.com/ and create new app.
2. Fill the form with following example and create your application.

- Name: erxes.domain.com
- Website: erxes.domain.com
- Callback URL: https://erxes.domain.com/service/oauth/twitter_callback

3. Go to Permissions tab and select Read, Write and Access direct messages. Don't forget to Update settings button.
4. Go to Keys and Access Tokens tab and copy:
   Consumer Key (API Key), Consumer Secret (API Secret) values to `erxes-api/.env` file.

Your .env should look like:

`TWITTER_CONSUMER_KEY='Consumer Key (API Key) here'`

`TWITTER_CONSUMER_SECRET='Consumer Secret (API Secret) here'`

`TWITTER_REDIRECT_URL='https://erxes.domain.com/service/oauth/twitter_callback - Your callback url from app settings.'`

### Erxes twitter integration settings.

1. Go to your erxes.domain.com - settings - integrations page
2. Click on **Add Integrations** and select Twitter. Click on Authorize app.
3. Select your brand and click save.

## Gmail Integration

Erxes app can be integrated with Gmail API and that means we can receive our gmail inbox messages directly to our erxes app's inbox. With the help of gmail API we have many more possibilities, like realtime email synchronization, send & reply email etc. There is an active development process going on this subject.

Requirements:

- To create google project.
- Enable gmail api.
- Configure google cloud pub/sub.

Creating google project:

- Go to https://console.cloud.google.com/cloud-resource-manager and create new project.

Enable gmail api:

- Go to the APIs & Services/library & enable gmail api.
- Go to the APIs & Services/credentials & create new `OAuth client ID` credentials. If you see warning about `product name` follow the instruction, make it disappear. Afterwards select `Web application` & add `http://localhost:3000/service/oauth/gmail_callback` in `Authorized redirect URIs` & create.
- Copy `Client ID` & `Client secret` paste in your erxes-api/.env file. It looks like following example:

```shell
#.env
GOOGLE_CLIENT_ID = '234373437285-11asa2131kjk231231.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET = 'kE9K8W8A9KJSADQPWE'
GMAIL_REDIRECT_URL = 'http://localhost:3000/service/oauth/gmail_callback'
```

Configure google cloud pub/sub:

- Go to https://console.cloud.google.com/cloudpubsub/enableApi & select your project.
- Enable api & create topic.
- On the topic we must create subscription which is shown on the right of the topic as 3 dots. Select `New subscrition` & create.
- Now grant publish rights on your topic. To do this, select `permissions` from the menu shown as a 3 dots & add member `serviceAccount:gmail-api-push@system.gserviceaccount.com` role as a pub/sub publisher.
- Then copy the topic & subscrition put it in erxes-api/.env file. It should looks like following example:

```shell
#.env
GOOGLE_TOPIC = "projects/myproject/topics/erxes-topic"
GOOGLE_SUPSCRIPTION_NAME = "projects/myproject/subscriptions/erxes-subscription"
```

- Go to https://console.cloud.google.com/apis/credentials/serviceaccountkey
- Select your project & create new service account with role as project owner.
- Download json file, put file path in erxes/.env file. It should looks like following example:

```shell
#.env
GOOGLE_APPLICATION_CREDENTIALS = "/Users/user/Downloads/9bb5b70c121c.json"
```

Add integration:

- Go to erxes settings - App store - add gmail. (Make sure you create new brand beforehand)

## AWS S3 Integration

1. Configure AWS account settings in `erxes-api/.env` like below

```Shell
AWS_ACCESS_KEY_ID='your aws account access key id'
AWS_SECRET_ACCESS_KEY='your aws account secret key'

AWS_BUCKET='aws bucket name'
AWS_PREFIX=''
```

- You can get your aws access key id and region from [here](https://console.aws.amazon.com/console/home)
  , You can not get your current aws secret access key, however you can always create new one and claim newly created aws secret access key
- Make sure your IAM user has proper access to S3 services.

## AWS SES Integration

1. Configure AWS account settings in `erxes-api/.env` like below

```Shell
AWS_SES_ACCESS_KEY_ID='aws account access key id'
AWS_SES_SECRET_ACCESS_KEY='aws account secret access key'
AWS_REGION='aws account region'
AWS_SES_CONFIG_SET='could be anything that you wanted to name your config'
AWS_ENDPOINT='your erxes-api domain'
```

- You can get your aws access key id and region from [here](https://console.aws.amazon.com/console/home)
  , You can not get your current aws secret access key, however you can always create new one and claim newly created aws secret access key
- Make sure your IAM user has proper access to SNS and SES services.

2. Run `yarn engageSubscriptions` command to automatically create all the necessary configs for you

3. Before start sending email you should verify sender's email address through [here](https://console.aws.amazon.com/ses/home?#verified-senders-email:)

## Nylas Integration

1. Create the Nylas account go to [website](https://dashboard.nylas.com/register)
2. After you created the Nylas account, copy your clientId and clientSecret to `erxes-integrations.env` like below
```Shel
# Nylas
NYLAS_CLIENT_ID='nylas account CLIENT ID'
NYLAS_CLIENT_SECRET='nylas account CLIENT_SECRET'
NYLAS_WEBHOOK_CALLBACK_URL=http://localhost:3400/nylas/webhook
```
3. In order to receive email and updates, we need to have endpoint for our webhook.
  - Use ngrok service for erxes-integration repo as follows:
  ```Shell
  cd /path/to/erxes-integrations
  ngrok http 3400
  ```
  - Copy the IP address with https and replace `erxes-integrations.env` as follows:
  ```Shell
  NYLAS_WEBHOOK_CALLBACK_URL=http://localhost:3400/nylas/webhook
  NYLAS_WEBHOOK_CALLBACK_URL=https://NGROK_IP/nylas/webhook
  ```
  When you start erxes-integration repo webhook will automatically created according to `.env`
  #### Now we are ready to config our provider
### Gmail
1. Create the Google project and config gmail for the [Nylas guide](https://docs.nylas.com/docs/creating-a-google-project-for-dev)
    - Get the following config from your Google project and config as follows in `erxes-integrations.env`
    ```Shell
    GOOGLE_PROJECT_ID='google project id'
    GOOGLE_CLIENT_ID='google client id'
    GOOGLE_CLIENT_SECRET='google client secret'
    GOOGLE_APPLICATION_CREDENTIALS=./google_cred.json
    ```
    - In order to have Google OAuth token, add authorized redirect URIs to your google credentials
      - Select Google project
      - Go to credentials from left side menu
      - Select OAuth 2.0 client ID
      - Add following uri in authorized redirect URI `http://localhost:3400/nylas/oauth2/callback`
    - After you create the Google service account download json and replace with `google_cred.json`