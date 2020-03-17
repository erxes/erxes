---
id: system-config
title: System config
---

In this tutorials enable you to set up administration system configurations, which allows you work on sysadmin without require coding skills. 

---


## General system configuration

### General settings

In the general setting, you can configure the system language, currency and the unit of measurement. Select the variables relied upon your requirement.   

**Configuration:** 
- Go to Erxes Settings => System config => General System Config => General settings.

```
LANGUAGE='English'
CURRENCY='United Stated Dollar'
UNIT_OF_MEASUREMENT='Pieces PCS'

```
### File upload

**A media type** (Multipurpose Internet Mail Extensions or MIME type) is a standard that indicates the nature and format of a document, file, or assortment of bytes. The simplest MIME type consists of a type and a subtype **(type/subtype)**. 


**Configuration:** 
- Go to Erxes Settings => System config => General System Config => File upload. 

```
UPLOAD_FILE_TYPES='image/png, application/pdf'
UPLOAD_FILE_TYPES_OF_WIDGET='image/png, application/pdf'
UPLOAD_SERVICE_TYPE='Amazon Web Services'
BUCKET_FILE_SYSTEM_TYPE='Public'
```

See the following figure which approves the **png**, **pdf** files and other type of media do not allowed to upload the server. If there is nothing configured media type, it accepts all media types. 

<img src="https://erxes-docs.s3-us-west-2.amazonaws.com/system-config/1+fileupload.png" />


- `UPLOAD_FILE_TYPES`, `UPLOAD_FILE_TYPES_OF_WIDGET` have to set same file type. [Here is a list of MIME types, associated by type of documents, ordered by their common extensions.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types)
- You can upload the files through **Amazon Web Services** or **Google Cloud Service** on `UPLOAD_SERVICE_TYPE`. 

- You can select the permission as **public** or **private** on `BUCKET_FILE_SYSTEM_TYPE`. 

<aside class="notice">

You have to ensure that public access to all your S3 buckets and objects is blocked or not. You can configure block public access settings for an individual S3 bucket or for all the buckets in your account. [Learn more about access permission.](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/block-public-access.html)

</aside>


### AWS S3

Amazon Simple Storage Service (Amazon S3) is storage for the internet. You can use Amazon S3 to store and retrieve any amount of data at any time, from anywhere on the web. 

**Configuration:** 
- Go to Erxes Settings => System config => General System Config => AWS S3.

```
AWS_ACCESS_KEY_ID='your aws account access key id'
AWS_SECRET_ACCESS_KEY='your aws account secret key'
AWS_BUCKET='aws bucket name'
AWS_PREFIX='you can use prefix names to specify the names of the files to be uploaded'
AWS_COMPATIBLE_SERVICE_ENDPOINT=''
AWS_FORCE_PATH_STYLE=''
```
- [ Log in to your AWS Management Console. ](https://console.aws.amazon.com)
- You can get your `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from AWS My Security Credentials=> Access keys (access key ID and secret access key). 
- [Create new bucket](https://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html) and insert name in `AWS_BUCKET`, make sure bucket permission configuration. 

- Make sure your IAM user has proper access to S3 services. [Learn more about public access.](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/block-public-access.html)

- `AWS_COMPATIBLE_SERVICE_ENDPOINT`, if you need to override an endpoint for a service, you can set the endpoint on a service by passing the endpoint object with the endpoint option key. [Refer to AWS service endpoint.](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Endpoint.html)

- `AWS_FORCE_PATH_STYLE`, some services have very specific configuration options that are not shared by other services. [Refer to AWS force path style.](https://docs.aws.amazon.com/sdkforruby/api/Aws/Plugins/GlobalConfiguration.html)



### AWS SES 

Amazon Simple Email Service enables you to send and receive email using a reliable and scalable email platform. Set up your custom Amazon simple email service account. 

**Configuration:** 
- Go to Erxes Settings => System config => General System Config => AWS SES.  

```
AWS_SES_ACCESS_KEY_ID='your aws account access key id'
AWS_SES_SECRET_ACCESS_KEY='your aws account secret key'
AWS_REGION='region of your account'
AWS_SES_CONFIG_SET=''
```
`AWS_SES_CONFIG_SET` is detect bounce, complaints, click and open events which you can be use this option. This name can be anything.

#### Configure Amazon SES and Amazon SNS to track each email responses.

1.	[ Log in to your AWS Management Console. ](https://console.aws.amazon.com)
2.	Click on your user name at the top right of the page.
3.	Click on the My Security Credentials link from the drop-down menu.
4.	Click on the Users menu from left Sidebar.
5.	Click on the Add user.
6.	Then create your username and check Programmatic access type and click next.
7.	Click on the Create group then write group name and check amazonSesFullAccess and amazonSNSFullAccess.
8.	Then check your created group and click on the Next button.
9.	Finally click on the create user and copy the `AWS_SES_ACCESS_KEY_ID` and `AWS_SES_SECRET_ACCESS_KEY`.


#### To find your `AWS_REGION`.

1.	[ Log in to your AWS Management Console.](https://console.aws.amazon.com)
2.	Click on services menu at the top left of the page.
3.	Find Simple Email Service and Copy region code from url.

**If you choose not available region**
1.	Click on your region at the top right of the menu.
2.	Select any active region from list.
3.	Copy the selected Region code.
_(example: us-east-1, us-west-2, ap-south-1, ap-southeast-2, eu-central-1, eu-west-1)_


#### Determine whether your account is in the sandbox or not.

Amazon places all new accounts in the Amazon SES sandbox. While your account is in the sandbox, you can use all of the features of Amazon SES. However, when your account is in the sandbox, Amazon have applied the following restrictions to your account:

+ You can only send mail to verified email addresses and domains, or to the Amazon SES mailbox simulator.

+ You can only send mail from verified email addresses and domains.

**Verify it for following steps:** 
1.	[Open the Amazon SES console at https://console.aws.amazon.com/ses/](https://console.aws.amazon.com/ses/)
2.	Use the Region selector to choose an AWS Region.
3.	If your account is in the sandbox in the AWS Region that you selected, you see a banner at the top of the page that resembles the example in the following figure.

<img  src="https://erxes-docs.s3-us-west-2.amazonaws.com/amazon.png"/>

4.	If the banner doesn't appear on this page, then your account is no longer in the sandbox in the current Region.

<aside class="notice">
You can also determine whether your account is in the sandbox by sending email to an address that you haven't verified. If your account is in the sandbox, you receive an error message stating that the destination address isn't verified.
</aside> 

5. **If you move out of the Sandbox,** follow the instructions described [here](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html) to move out of the Amazon SES Sandbox.



### Google

**Configuration:** 
- Go to Erxes Settings => System config => General System Config => Google.  

```
GOOGLE_PROJECT_ID="your google project's id"
GOOGLE_APPLICATION_CREDENTIALS="your downloaded google's credentials which is json file"
GOOGLE_CLIENT_ID="your google project's client id"
GOOGLE_CLIENT_SECRET="your google project's secret key"
```

Requirements:

- To create Google project.
- Enable Gmail API.
- Configure Google cloud pub/sub.

Creating Google project:

- Go to https://console.cloud.google.com/cloud-resource-manager and create new project.

Enable Gmail API:

- Go to the APIs & Services/library & enable Gmail API.
- Go to the APIs & Services/credentials & create new `OAuth client ID` credentials. If you see warning about `product name` follow the instruction, make it disappear. Afterwards select `Web application` & add `http://localhost:3000/service/oauth/gmail_callback` in `Authorized redirect URIs` & create.
- Copy `Client ID` & `Client secret` paste in your erxes-api/.env file. It looks like following example:


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


### Common mail config
Common mail config enables you to your transaction emails will be sent by the specified email address(`FROM_EMAIL`). You can define whether transaction emails sent by AWS SES or other email services which is configured in custom mail service (`DEFAULT_EMAIL_SERVICE`).

**Configuration:** 
- Go to Erxes Settings => System config => General System Config => Common mail config. 

```
FROM_EMAIL='your email address'
DEFAULT_EMAIL_SERVICE='your configured email service name'

```



### Custom mail service
Mail service enables you to delivering your transactional and marketing emails through the cloud-based email delivery platform. You can set any custom mail service in this fields. For example, Sendgrid custom mail service. Create your account in Sendgrid and fill it into the fields. 

**Configuration:** 
- Go to Erxes Settings => System config => General System Config => Custom mail service. 

```
MAIL_SERVICE_NAME='Sendgrid'
PORT='Sendgrid port id'
USERNAME='your account user name'
PASSWORD='your account password'
HOST='smtp.sendgrid.net'
```

## Integrations configuration
 
Erxes app enables you to integrate with developer API and that means we can receive our integrated applications inbox messages directly to our erxes app's inbox. With the developer API, we have many more possibilities, like receiving notifications about page comment, page post feed etc. Learn how to integrate the Erxes platform into your applications as stated follows.

### Facebook 


Erxes app can be integrated with facebook developer API and that means we can receive our Facebook pages' inbox messages directly to our erxes app's inbox. With the help of Facebook developer API we have many more possibilities, like receiving notifications about page comment, page post feed etc. There is an active development process going on this subject.

#### Requirements:

- Working sub domain with SSL pointing to your erxes-api server.
- [Create a Facebook App](https://developers.facebook.com/docs/apps/)
- [Create a Facebook Page](https://www.facebook.com/pages/creation/)


**Configuration:** 
- Go to Erxes Settings => System config => Integrations config => Facebook. 

```
FACEBOOK_APP_ID="your faceboook application's app id"
FACEBOOK_APP_SECRET="your faceboook application's secret key"
FACEBOOK_VERIFY_TOKEN="insert facebook application verify token"

```


#### Creating facebook app.

1. Create new app.<br />
   ( Your application status must be "Live" )
2. Your application must have these permissions: <br />
   `manage_pages, pages_show_list, pages_messaging, publish_pages, pages_messaging_phone_number, pages_messaging_subscriptions` <br />
   (You can get these permissions through your App Review)
3. Go to developer application setting=> basic=> get variables<br />
   `FACEBOOK_APP_ID`, your Facebook application's ID <br />
   `FACEBOOK_APP_SECRET`, your Facebook application's Secret code<br />
  
4. You must have `Facebook Login` product set up.
5. Go to `Facebook Login` => `Settings` fill the field names `Valid OAuth Redirect URIs` like below: <br />
   `<your erxes-api domain>/fblogin`
6. Now we are done on configurations. 

#### Erxes facebook integration settings.

1. Go to Erxes settings => App store
2. Click on **Add Facebook messenger**.  Click on Authorize app.
3. Select your brand and click save.
4. Go to Setting=> Channel=> Add new channel=> Connect facebook integration.


#### Getting facebook permissions (*manage_pages*, *publish_pages*)

**manage_pages:**

Grants an app permission to retrieve Page Access Tokens for the Pages and Apps that the app user administers. Apps that allow users to publish as a Page must also have the ***publish_pages*** permission. To take this permission, you must complete the following 2 steps.

1. Provide verification details. In this step, you must provide detailed step-by-step instructions on how a reviewer can test your integration and how you are using the requested permissions or features. To do so,
    - You provide the testing account & password. (Note: Do not provide your personal Facebook account credentials.)
    - Then you provide each steps required to test your integration. For example:
        1. Navigate to <www.example.com>
        2. Login using by username: admin password: password
        3. Once you've accessed the website, click the <App store> button to connect their managed Facebook pages
        4. Then click the <Channels> button navigated in <Settings> to sort their pages. After completing these steps, our users can receive their managed FB page messenger messages, post comments, and likes. <publish_pages> permission will give our users to reply back to their posts and comments.

2. You need to send request to facebook and explain that how you will use this permission. In this step, you must provide
    - a. a detailed description of how your app uses the permission or feature requested, how it adds value for a person using your app, and why it's necessary for app functionality.
    - b. a step-by-step video walkthrough of below.
    - c. [Here](https://bit.ly/2J6j5Oi) is a sample video.

**publish_pages:**

Grants your app permission to publish posts, comments, and like Pages managed by a person using your app. Also requires the ***manage_pages*** permission.

To take this permission, you must complete the following 3 steps.

1. Provide verification details. In this step, you must provide detailed step-by-step instructions on how a reviewer can test your integration and how you are using the requested permissions or features. To do so,
    - You provide the testing account & password. (Note: Do not provide your personal Facebook account credentials.)
    - Then you provide each steps required to test your integration. For example:
        1. Navigate to <www.example.com>
        2. Login using by username: admin password: password
        3. Once you've accessed the website, click the <App store> button to connect their managed Facebook pages
        4. Then click the <Channels> button navigated in <Settings> to sort their pages. After completing these steps, our users can receive their managed FB page messenger messages, post comments, and likes. <publish_pages> permission will give our users to reply back to their posts and comments.

2. Tell facebook how you will use this permission. In this step, you must provide
    - a. a detailed description of how your app uses the permission or feature requested, how it adds value for a person using your app, and why it's necessary for app functionality.
    - b. a step-by-step video walkthrough of above.
    - c. your subbmission must include ***manage_pages*** permission
    - d. [Here](https://bit.ly/2J6j5Oi) is a sample video.

3. Tell facebook how you will use *manage_pages* permission if you haven't taken it yet.

### Twitter 

Erxes app can be integrated with twitter developer API and that means we can receive our twitter accounts DMs, Tweets directly into our erxes app's inbox.

Requirements:

- [Create twitter app,](https://developer.twitter.com/en/docs/basics/apps/overview) profile must be phone verified.

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
- `TWITTER_WEBHOOK_ENV`='https://erxes.domain.com/service/oauth/twitter_callback'

1. [Create twitter app,](https://developer.twitter.com/en/docs/basics/apps/overview)
2. Fill the form with following example and create your application.

- Name: erxes.domain.com
- Website: erxes.domain.com
- Callback URL: https://erxes.domain.com/service/oauth/twitter_callback

3. Go to Permissions tab and select Read, Write and Access direct messages. Don't forget to Update settings button.



#### Erxes twitter integration settings.

1. Go to Erxes settings => App store
2. Click on **Add Twitter direct message**.  Click on Authorize app.
3. Select your brand and click save.
4. Go to Setting=> Channel=> Add new channel=> Connect Twitter integration. 

### Daily
Erxes app can be integrated with the Daily.co API for video calls. It allows us to easy to create and configure on-demand video call URLs. Learn how to integrate Daily integration.

#### Requirements:

- [Create a Daily account](https://www.daily.co)
- Create new custom domain (subdomain) on the account. For instance: example.daily.co 


**Configuration:** 
- Go to Erxes Settings => System config => Integrations config => Daily. 

```
DAILY_API_KEY="your daily application's api key"
DAILY_END_POINT="your daily application's end point"
```
- `DAILY_API_KEY='######'` Get API key from Daily account Developers tab.  
- `DAILY_END_POINT ='example.daily.co'` is your subdomain name. 

Integrated video chat is used on the Erxes messenger widget. It is assumed that the one conversation can be activated one video call. 

### Nylas 
Learn how to integrate Nylas Accounts With Erxes.

**Configuration:** 
- Go to Erxes Settings => System config => Integrations config => Nylas. 

```
NYLAS_CLIENT_ID='nylas account client id'
NYLAS_CLIENT_SECRET='nylas account client secret'
NYLAS_WEBHOOK_CALLBACK_URL='https://ID.ngrok.io/nylas/webhook'
```


1. Create the Nylas account go to [website](https://dashboard.nylas.com/register)
2. After you created the Nylas account [here](https://dashboard.nylas.com/applications/), copy the variables as following.

`NYLAS_CLIENT_ID`, nylas account client id
`NYLAS_CLIENT_SECRET`, nylas account client secret
`NYLAS_WEBHOOK_CALLBACK_URL`, insert nylas webhook call back URL

3. In order to receive email and updates, we need to have endpoint for our webhook.
  - Use ngrok service for erxes-integration repo as follows:
  ```Shell
  cd /path/to/erxes-integrations
  ngrok http 3400
  ```
 
  When you start erxes-integration repo webhook will automatically created according to your configuration.
  #### Now we are ready to config our Nylas provider



### Outlook
Learn how to integrate Outlook Accounts With Erxes. 
Integrating the Outlook is easy peasy lemon squeezy, all we need is email and password no additional steps.

**Configuration:** 
- Go to Erxes Settings => System config => Integrations config => Outlook. 

```
# 32 bit characters
# ex: aes-256-cbc
ALGORITHM = '';
ENCRYPTION_KEY=''
```

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



### Gmail 

Erxes app can be integrated with Gmail API by Nylas and that means we can receive our gmail inbox messages directly to our erxes app's inbox. With the help of gmail API we have many more possibilities, like realtime email synchronization, send & reply email etc. 

**Requirements:**

- Create Google project and OAuth Client ID.
- Enable Gmail API.


**Configuration:** 
- Go to Erxes Settings => System config => General system config => Google. 


```
GOOGLE_PROJECT_ID="your google project's id"
GOOGLE_APPLICATION_CREDENTIALS="./google_cred.json"
GOOGLE_CLIENT_ID="your google project's client id"
GOOGLE_CLIENT_SECRET="your google project's secret key"
```


#### Creating Google project
According to [Nylas guide](https://docs.nylas.com/docs/creating-a-google-project-for-dev), follow the configurations to set variables.
1. Create the Google project and config gmail.
2. Enable APIs.
3. Configure OAuth Consent Screen.
4. Create an OAuth Credential.  In order to have Google OAuth token, add authorized redirect URIs to your google credentials. 
- Select Google project
- Go to credentials from left side menu
- Select OAuth 2.0 client ID
- Add **Authorized JavaScript origins**

 `Add URI = https://nylas.com `
 
- Add **Authorized redirect URI**

 `Add URI = http://localhost:3400/nylas/oauth2/callback`

 `Add URI = https://api.nylas.com/oauth/callback`

After you create the Google service account download json and replace with google_cred.json. 



**Erxes Gmail integration settings:**

1. Go to Erxes settings => App store
2. Click on Add Gmail by Nylas. Connect your account.
3. Select your brand and click save.
4. Go to Setting=> Channel=> Add new channel=> Connect gmail integration.

### Yahoo
In order to integrate the Yahoo you will need to generate app password for the Erxes, please follow below steps.
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



## Engage configuration

### AWS SES

Amazon SES service enables on Erxes Engage system. Another custom mail service is not allowed on Engage system.  
AWS SES configuration is similar with Integration AWS SES. [Go to settings here](https://docs.erxes.io/docs/administrator/system-config#aws-ses)

### Verify email

Amazon places all new accounts in the Amazon SES sandbox. While your account is in the sandbox, you can use all of the features of Amazon SES. However, when your account is in the sandbox, Amazon have applied the following restrictions to your account:

+ You can only send mail to verified email addresses and domains, or to the Amazon SES mailbox simulator.

+ You can only send mail from verified email addresses and domains.

Insert emails and verify it. 


### Send test email

<img  src="https://erxes-docs.s3-us-west-2.amazonaws.com/Amazon-ses/amazon+test+conf.png"/>
