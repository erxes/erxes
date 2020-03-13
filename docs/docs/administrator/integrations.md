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

### Create a Google Cloud Project
  - Go to the [ Google Cloud Project ](https://console.cloud.google.com/)
  - Navigate to Select a project => NEW PROJECT 
  
  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-1.png" width="70%" height="70%" />

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-1.png" width="70%" height="70%" />

### Enable Gmail API
  - Now we need to enable Gmail API in order to add scopes
  - Side menu => APIs & Services => Library => Search => Gmail API and enable

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-7.png" width="70%" height="70%" />

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-8.png" width="70%" height="70%" />

### Create consent screen 
  - Side menu => APIs Services => OAuth Consent screen => Create

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-3.png" width="70%" height="70%" />
  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-4.png" width="70%" height="70%" />

  Fill out the form below and click on add scope the button

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-5.png" width="70%" height="70%" />

  Since we already enabled the Gmail API, we are able to add the Gmail scopes. Search Gmail API and select the following scopes and add. Afterward, do not forget to click on save on bottom

  ```Shell
    https://mail.google.com/
    https://www.googleapis.com/auth/gmail.modify
    https://www.googleapis.com/auth/gmail.compose
    https://www.googleapis.com/auth/gmail.send
    https://www.googleapis.com/auth/gmail.readonly
  ```

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-9.png" width="70%" height="70%" />

### Create an OAuth client
  - In order to enable Google Cloud Project, we need to have a OAuth client for authorization

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-2.png" width="70%" height="70%" />

  - In application, type select web application and fill out the rest of the form

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-10.png" width="70%" height="70%" />

  - Keep the client id and client secret we're going to use later on

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-11.png" width="70%" height="70%" />

### Add authorization callback
  - Now we need to add authorization callback for our OAuth2 client
  - Go to => Side menu => APIs and Services => Credentials and select an OAuth client you just created.

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-12.png" width="70%" height="70%" />

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-13.png" width="70%" height="70%" />

  - erxes-integrations repo works on PORT 3400, so that for the test purpose you can add as follows

  ```shell
    http://localhost:3400/gmaillogin
  ```

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-14.png" width="70%" height="70%" />

### Enable PubSub API
  -In order to send and receive an email we will need the PubSub API

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-15.png" width="70%" height="70%"/>

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-16.png" width="70%" height="70%"/>

### Create a service account
  - Go to => IAM & Admin => Service Accounts => CREATE SERVICE ACCOUNTS
  - Enter service account name and Create

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-17.png" width="70%" height="70%" />

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-18.png" width="70%" height="70%" />
  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-19.png" width="70%" height="70%" />

  - You will automatically download the JSON file
  - Let's grant publish topic right to Gmail's service account.

  - Go to => Side menu => IAM & Admin => IAM => Add

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-22.png" width="70%" height="70%" />

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-23.png" width="70%" height="70%" />

  - In new members add the following value

  ```shell
    gmail-api-push@system.gserviceaccount.com
  ```

  - In role select PubSub/Publisher
  
  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-21.png" width="70%" height="70%" />

### Shell env
  - You also need to set env to your shell session
  ```shell
  export GOOGLE_APPLICATION_CREDENTIALS='path/to/your/google_cred.json' # service account json file
  ```

### Config env
  - Now we are good to config our env as follows, 

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-gmail-20.png" width="70%" height="70%" />

  You need to restart the erxes-integration repo after configuring .env

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

Amazon Simple Email Service enables you to send and receive email using a reliable and scalable email platform. Set up your custom amazon simple email service account. 

### Configure Amazon SES and Amazon SNS to track each email responses.

1.	[ Log in to your AWS Management Console. ](https://console.aws.amazon.com)
2.	Click on your user name at the top right of the page.
3.	Click on the My Security Credentials link from the drop-down menu.
4.	Click on the Users menu from left Sidebar.
5.	Click on the Add user.
6.	Then create your username and check Programmatic access type and click next.
7.	Click on the Create group then write group name and check amazonSesFullAccess and amazonSNSFullAccess.
8.	Then check your created group and click on the Next button.
9.	Finally click on the create user and copy the Access Key Id and Secret Access Key.


### To find your Region.

1.	[ Log in to your AWS Management Console.](https://console.aws.amazon.com)
2.	Click on services menu at the top left of the page.
3.	Find Simple Email Service and Copy region code from url.

**If you choose not available region**
1.	Click on your region at the top right of the menu.
2.	Select any active region from list.
3.	Copy the selected Region code.
_(example: us-east-1, us-west-2, ap-south-1, ap-southeast-2, eu-central-1, eu-west-1)_


### To determine if your account is in the sandbox.
1.	[Open the Amazon SES console at https://console.aws.amazon.com/ses/](https://console.aws.amazon.com/ses/)
2.	Use the Region selector to choose an AWS Region.
3.	If your account is in the sandbox in the AWS Region that you selected, you see a banner at the top of the page that resembles the example in the following figure.

<img  src="https://erxes-docs.s3-us-west-2.amazonaws.com/amazon.png"/>

4.	If the banner doesn't appear on this page, then your account is no longer in the sandbox in the current Region.

<aside class="notice">
You can also determine whether your account is in the sandbox by sending email to an address that you haven't verified. If your account is in the sandbox, you receive an error message stating that the destination address isn't verified.
</aside> 


5. **If you move out of the Sandbox,** follow the instructions described [here](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html) to move out of the Amazon SES Sandbox.


### Paste Amazon-Ses Access Keys to Erxes AWS-SES engage.

1.	Login Erxes, go to Settings menu => Appstore.
2.	Click on the “Appstore” menu 
3.	Click manage to AWS-SES engage configuration

<img  src="https://erxes-docs.s3-us-west-2.amazonaws.com/Amazon-ses/Amazon+setting+aws.png"/>

4.	Paste the AWS-SES  access key ID, AWS-SES secret access key and AWS-SES region which you have created user in AWS Management console. 

<img  src="https://erxes-docs.s3-us-west-2.amazonaws.com/Amazon-ses/amazon-ses+key.png"/>

### Test configuration.

Amazon places all new accounts in the Amazon SES sandbox. While your account is in the sandbox, you can use all of the features of Amazon SES. However, when your account is in the sandbox, Amazon have applied the following restrictions to your account:

+ You can only send mail to verified email addresses and domains, or to the Amazon SES mailbox simulator.

+ You can only send mail from verified email addresses and domains.

<img  src="https://erxes-docs.s3-us-west-2.amazonaws.com/Amazon-ses/amazon+test+conf.png"/>

## Nylas Integration

1. Create the Nylas account go to [website](https://dashboard.nylas.com/register)
2. After you created the Nylas account, copy your clientId and clientSecret from [here](https://dashboard.nylas.com/applications/) and config in `erxes-integrations/.env` like below
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
  - Copy the IP address with https and replace `erxes-integrations/.env` as follows:
  ```Shell
  NYLAS_WEBHOOK_CALLBACK_URL=http://localhost:3400/nylas/webhook
  NYLAS_WEBHOOK_CALLBACK_URL=https://NGROK_IP/nylas/webhook
  ```
  When you start erxes-integration repo webhook will automatically created according to `.env`
  #### Now we are ready to config our provider
### Gmail
1. Create the Google project and config gmail for the [Nylas guide](https://docs.nylas.com/docs/creating-a-google-project-for-dev)
    - Get the following config from your Google project and config as follows in `erxes-integrations/.env`
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
### Yahoo
2. In order to integrate the Yahoo you will need to generate app password for the Erxes, please follow below steps.
  - Go to Settings/App Store and click on Add button of the Yahoo section
    <div>
      <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-1.png" />
    </div>

  - You will see a modal, then click on add account

    <div>
      <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-2.png"/>
    </div>

  - Now you need to generate password for erxes, go ahead and click the link.

    <div>
      <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-3.png"/>
    </div>

  - You will be jump into Yahoo, sign in and click on Account Security in Settings as follows. 

    <div>
      <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-4.png"/>
    </div>

  - Scroll to bottom and click on <b>Generate app password</b> link.

    <div>
      <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-5.png"/>
    </div>
    
  - Click on the <b>Select an app</b> and select Other app.

    <div>
      <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-6.png"/>
    </div>

  - Then name your app as <b>Erxes</b> and click on the <b>Generate</b> button.

    <div>
      <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-7.png"/>
    </div>

  - Great, you got the password, Now copy password and navigate back to the Erxes Settings/App Store

    <div>
      <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-8.png"/>
    </div>

  - Fill your email address and paste your password, that is it click on the save button and create yahoo integration.

    <div>
      <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-9.png"/>
    </div>

### Outlook
3. Integrating the Outlook is easy peasy lemon squeezy, all we need is email and password no additional steps.
  - Go to Settings/App Store and click on Add button of the Outlook section
    <div>
      <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-outlook-1.png"/>
    </div>

  - Click on the Add account button then you will see form
    <div>
      <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-outlook-2.png"/>
    </div>
    
  - Enter your outlook email, password and click on save button that's it now you can create your Outlook integration.
    <div>
      <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-outlook-3.png"/>
    </div>