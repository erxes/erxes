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

### Google

Google Cloud Platform (GCP), offered by Google, is a suite of cloud computing services that runs on the same infrastructure that Google uses internally for its end-user products, such as Firebase, Gmail and Pubsub. Alongside a set of management tools, it provides a series of modular cloud services including computing, data storage, data analytics and machine learning.

Following steps explain the Google Cloud Project. Which allows us to use Google Cloud Platform's services to our Erxes app.

- Create a Google Cloud Project [click here](https://console.cloud.google.com/)
- Click on the Select Project

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-1.png)

- Click on the New Project

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-2.png)

- Enter project name and click on the Create button

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-3.png)

#### Service account

- Navigate to sidebar IAM & Admin => Service Accounts

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-4.png)

- Now let's create service account for our app

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-5.png)

- Enter service account name and description then click on the Create button

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-6.png)

- Select Owner role and click on the Continue button

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-7.png)

- Create key for service account, you will download json file automatically and keep it

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-8.png)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-9.png)

- Successfully created service account

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-10.png)

- Copy the service account file's content to google_cred.json in **erxes-integrations/google_cred.json.sample**, and rename it to **google_cred.json**

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-11.png)

- export GOOGLE_APPLICATION_CREDENTIALS="/Path/to/your/[google_cred].json"

- One last touch, we need to configure erxes, Go to Settings => System Config => General System config
  And configure **GOOGLE PROJECT ID**, **GOOGLE APPLICATION CREDENTIALS** fields as in the sceenshot

  - **GOOGLE APPLICATION CREDENTIALS** is google_cred file's path by default it's ./google_cred.json no need to change
  - **GOOGLE APPLICATION CREDENTIALS JSON** is google_cred (service account) file's content for **Firebase** configuration

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-12.png)

That's it, now you are good use Google Cloud Platform Services which you can find them [here](https://console.cloud.google.com/apis/library)

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

![](https://erxes-docs.s3-us-west-2.amazonaws.com/system-config/1+fileupload.png)

- `UPLOAD_FILE_TYPES`, `UPLOAD_FILE_TYPES_OF_WIDGET` have to set same file type. [Here is a list of MIME types, associated by type of documents, ordered by their common extensions.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types)
- You can upload the files through **Amazon Web Services** or **Google Cloud Service** on `UPLOAD_SERVICE_TYPE`.

- You can select the permission as **public** or **private** on `BUCKET_FILE_SYSTEM_TYPE`.

You have to ensure that public access to all your S3 buckets and objects is blocked or not. You can configure block public access settings for an individual S3 bucket or for all the buckets in your account. [Learn more about access permission.](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/block-public-access.html)

### Google Cloud Storage

Cloud Storage provides worldwide, highly durable object storage that scales to exabytes of data. You can access data instantly from any storage class, integrate storage into your applications with a single unified API, and easily optimize price and performance.

#### Requirement:

- Google Cloud Platform project, follow [this](#google) guide to create one

- Enable Google Cloud Storage API [here](https://console.cloud.google.com/apis/library)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-storage-2.png)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-storage-1.png)

- Navigate to [here](https://console.cloud.google.com/storage/browser) and Create bucket for file upload

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-storage-3.png)

- Enter bucket name and fill out rest of the form

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-storage-4.png)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-storage-5.png)

- Copy your bucket name and configure it in the Erxes app as follows

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-storage-6.png)

Now final step, set upload service type to Google in [here](#file-upload)

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

1. [ Log in to your AWS Management Console. ](https://console.aws.amazon.com)
2. Click on your user name at the top right of the page.
3. Click on the My Security Credentials link from the drop-down menu.
4. Click on the Users menu from left Sidebar.
5. Click on the Add user.
6. Then create your username and check Programmatic access type and click next.
7. Click on the Create group then write group name and check amazonSesFullAccess and amazonSNSFullAccess.
8. Then check your created group and click on the Next button.
9. Finally click on the create user and copy the `AWS_SES_ACCESS_KEY_ID` and `AWS_SES_SECRET_ACCESS_KEY`.

#### To find your `AWS_REGION`.

1. [ Log in to your AWS Management Console.](https://console.aws.amazon.com)
2. Click on services menu at the top left of the page.
3. Find Simple Email Service and Copy region code from url.

**If you choose not available region**

1. Click on your region at the top right of the menu.
2. Select any active region from list.
3. Copy the selected Region code.
   _(example: us-east-1, us-west-2, ap-south-1, ap-southeast-2, eu-central-1, eu-west-1)_

#### Determine whether your account is in the sandbox or not.

Amazon places all new accounts in the Amazon SES sandbox. While your account is in the sandbox, you can use all of the features of Amazon SES. However, when your account is in the sandbox, Amazon have applied the following restrictions to your account:

- You can only send mail to verified email addresses and domains, or to the Amazon SES mailbox simulator.

- You can only send mail from verified email addresses and domains.

**Verify it for following steps:**

1. [Open the Amazon SES console at https://console.aws.amazon.com/ses/](https://console.aws.amazon.com/ses/)
2. Use the Region selector to choose an AWS Region.
3. If your account is in the sandbox in the AWS Region that you selected, you see a banner at the top of the page that resembles the example in the following figure.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/amazon.png)

4. If the banner doesn't appear on this page, then your account is no longer in the sandbox in the current Region.

You can also determine whether your account is in the sandbox by sending email to an address that you haven't verified. If your account is in the sandbox, you receive an error message stating that the destination address isn't verified.

5. **If you move out of the Sandbox,** follow the instructions described [here](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html) to move out of the Amazon SES Sandbox.

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

### Gmail

Read and send messages, manage drafts and attachments, search threads and messages, work with labels, setup push notifications, and manage Gmail settings.

Setting up the Gmail is easy with the script we made. You will see gmail-script.sh file in your integrations repo.

First, you need to have [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) on your computer.
Now let's make it executable. In your terminal run the following command <br/>

`chmod +x gmail-setup.sh`

Run script as follows <br/>

`./gmail-setup.sh`

This script basically will do most of the things for you. However there are a few steps you will have to make manually. When you successfully run the script it will show the rest of the steps.

### Facebook

Erxes app can be integrated with facebook developer API and that means we can receive our Facebook pages' inbox messages and posts directly to our erxes app's inbox. With the help of Facebook developer API we have many more possibilities, like receiving notifications about page comment, page post feed etc. There is an active development process going on this subject.

<!-- #### Requirements:

- Working sub domain with SSL pointing to your erxes-api server.
- [Create a Facebook App](https://developers.facebook.com/docs/apps/)
- [Create a Facebook Page](https://www.facebook.com/pages/creation/)

**Configuration:**

- Go to Erxes Settings => System config => Integrations config => Facebook.

```
FACEBOOK_APP_ID="your faceboook application's app id"
FACEBOOK_APP_SECRET="your faceboook application's secret key"
FACEBOOK_VERIFY_TOKEN="insert facebook application verify token"

``` -->

#### Creating a Facebook App

1.  The first step is to go to [developers.facebook.com](https://developers.facebook.com) to create an App

    ![](https://erxes-docs.s3-us-west-2.amazonaws.com/facebook/facebook-1.png)

2.  From the various options that are given, please choose “something else”.

    ![](https://erxes-docs.s3-us-west-2.amazonaws.com/facebook/facebook-2.png)

3.  After creating the App, please go to Settings and choose the Basic option. On this page everything has to be filled such as the display name, app domains, privacy policy URLS. Moreover, please keep in mind that your business profile has to be connected in order to complete the business verification process as well. By completing this step, you’ll be able to use Facebook Application.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/facebook/facebook-3.png)

#### Connecting Erxes with your Facebook

Please go to Settings > System Configuration > Integrations configurations in order to integrate your Facebook on your erxes.

```
FACEBOOK_APP_ID="your faceboook application's app id"Note: Facebook App Id can be found on the basic page on your Facebook App.
FACEBOOK_APP_SECRET="your faceboook application's secret key" Note: Facebook Secret can be found on the basic page on your Facebook App.
FACEBOOK_VERIFY_TOKEN="insert facebook application verify token" Note: In terms of Facebook App Token, you’ll receive it once you generate the token
FACEBOOK PERMISSIONS="insert facebook application permissions" Note: You’ll find the Facebook Permissions from your Facebook application review section and it’s specifically called “my permissions and features

```

![](https://erxes-docs.s3-us-west-2.amazonaws.com/facebook/facebook-5.png)

#### The configurations that needs to be done on your Facebook Applications are :

In order to integrate your Facebook application with your erxes there are three products that need to be used which are the Messenger, Facebook Login, and Webhook.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/facebook/facebook-4.png)

**1. _Facebook login:_**

In order to adjust this product in a section called Valid OAuth Redirect URLs, the url of your Facebook login has to be copied following your erxes login. For examplem, it should look like this

```
Valid OAuth Redirect URLs="yourerxesintegrationsdomain/fblogin"
```

Moreover, in detail it should look like this : https://exampledomain/integration/fblogin

![](https://erxes-docs.s3-us-west-2.amazonaws.com/facebook/facebook-7.png)

**2. _Messenger:_**

The Messenger used for receiving messages and responding to messages as well.
In order to activate the Messenger the callback url has to be adjusted.
In the CallBack URL section : /facebook/receive has to be added following your integration URL.
In the token section, the facebook token you’ve generated has to be added which will be found on the System Configuration section of your erxes.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/facebook/facebook-10.png)

```
Callback Url="https://yourintegrationdomain/facebook/recieve"
Verify Token="your generated token (FACEBOOK APP TOKEN)"

```

![](https://erxes-docs.s3-us-west-2.amazonaws.com/facebook/facebook-11.png)

**3. _Webhook_**

The role of the Webhook is to receive posts and comments. In order to adjust the Webhook, select the Page and choose to fill the subscription form.

In order to fill the edit subscription form there are few steps that need to be made. First of all, in the CallBack Url Box please write /facebook/receive. In the token box, the token should be copied that you’ve added in the system configuration on your erxes.

```
Callback Url="https://yourintegrationdomain/facebook/recieve"
Verify Token="your generated token (FACEBOOK APP TOKEN)"
```

![](https://erxes-docs.s3-us-west-2.amazonaws.com/facebook/facebook-13.png)

#### The permissions that needs to be done on your Facebook Applications are :

##### [Here is the example of how to get permissions](https://developers.facebook.com/docs/app-review/resources/sample-submissions/messenger-platform/)

**_For messenger:_**

There are two kinds of Facebook Permissions which are required. For example, the first one is using the Facebook Messenger integration. Please allow these permissions for Facebook Messenger Integration :

- pages_messaging

Enables your app to send and receive messages using a Facebook Page.

- pages_show_list

The pages_show_list permission allows your app to access the list of Pages a person manages.

**_For post & comment: _**

The second permission is used for receiving posts which is called Facebook Post Integration. If you want to use the Facebook Post Integration, please allow these permissions :

- pages_read_engagement

The pages_read_engagement permission allows your app the ability to read content (posts, photos, videos, events) posted by the Page, read followers data including name, PSID, and profile picture, and read metadata about the Page. You can use this permission if you need it to help the Page Admin administer and manage the Page.

- pages_manage_metadata

The pages_manage_metadata permission allows your app the ability to subscribe and receive web hooks about activity on the Page, and to update settings on the Page. You can use this permission if you need it to help the Page Admin administer and manage the Page.

- pages_read_user_content

The pages_read_user_content permission allows your app the ability to read user generated content on the Page, such as posts, comments and ratings by users or other Pages. It also allows your app to read posts that the Page is tagged in. You can use this permission to read users and other Page's content posted on the Page if you need it to help manage the Page. You can also use pages_read_user_content to delete comments posted by users on the Page.

- pages_manage_engagement

The pages_manage_engagement permission allows your app the ability to create, edit and delete comments posted by the Page. If you have access to pages_read_user_content, you can also use pages_manage_engagement to delete comments posted other Pages. It also allows your app the ability to create, edit, and delete your own Page's likes to Page content. You can use this permission if you need it to help manage and moderate content on the Page.

- pages_show_list

The pages_show_list permission allows your app to access the list of Pages a person manages.

### Twitter

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

### Video calls

Erxes app can be integrated with the Daily.co API for video calls. It allows us to easy to create and configure on-demand video call URLs. Learn how to integrate Daily integration.

#### Requirements:

- [Create a Daily account](https://www.daily.co)
- Create new custom domain (subdomain) on the account. For instance: example.daily.co

**Configuration:**

- Go to Erxes Settings => System config => Integrations config => Daily.

```

VIDEO_CALL_TYPE = 'select the video calls integration server'
DAILY_API_KEY="your daily application's api key"
DAILY_END_POINT="your daily application's end point"

```

- `DAILY_API_KEY='######'` Get API key from Daily account Developers tab.
- `DAILY_END_POINT ='https://example.daily.co'` is your subdomain name.
  - **Note:** You must have `https://` before the url endpoint, and there is **no trailing slash**.

Integrated video chat is used on the Erxes messenger widget. It is assumed that the one conversation can be activated one video call.

## Nylas Integrations

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

  ![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-outlook-1.png)

* Click on the Add account button then you will see form

  ![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-outlook-2.png)

- Enter your outlook email, password and click on save button that's it now you can create your Outlook integration.

  ![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-outlook-3.png)

### Gmail

Erxes app can be integrated with Gmail API by Nylas and that means we can receive our gmail inbox messages directly to our erxes app's inbox. With the help of Gmail API we have many more possibilities, like realtime email synchronization, send & reply email etc.

**Configuration**

- Create a Google Cloud Project and config gmail for Nylas [click here](https://docs.nylas.com/docs/creating-a-google-project-for-dev)

- In order to have Google OAuth token, add authorized callback (redirect URIs) to your google credentials.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-nylasgmail-1.png)

- Add following scopes in your OAuth consent screen

  ```Shell
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send'
    'https://www.googleapis.com/auth/gmail.readonly'
    'https://www.googleapis.com/auth/gmail.modify'
    'https://www.googleapis.com/auth/userinfo.email'
    'https://www.googleapis.com/auth/userinfo.profile'
  ```

- After you create the [Google service account (refer to the link)](/administrator/system-config#service-account) download JSON and replace with **erxes-integrations/google_cred.json**

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/nylas-2.png)

Basic integration setting has done. Now you need to connect your account to Erxes.

**Erxes Gmail integration settings:**

1. Go to Erxes settings => App store
2. Click on Add Gmail by Nylas. Connect your account.
3. Select your brand and click save.
4. Go to Setting => Channel=> Add new channel=> Connect gmail integration.

### Gmail IMAP

In Erxes you can also integrate your Gmail as IMAP.

- Go to Erxes settings => App Store => IMAP.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/gmail_imap_1.png)

- Click on the Add account and fill out the form as follows:

```
IMAP HOST: imap.gmail.com
IMAP PORT: 993
SMTP HOST : smtp.gmail.com
SMTP PORT: 465
```

> You can also read Google IMAP Settings in [Google Help Center](https://support.google.com/mail/answer/7126229?hl=en)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/gmail_imap_2.png)

- In order to integrate your Gmail, you also need to make some config in [gmail](https://gmail.com/). Go to Settings => See all settings.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/gmail_imap_3.png)

- In the Settings section click on the Forwarding and POP/IMAP.
- Enable IMAP and click on the Save changes button on the bottom of the page.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/gmail_imap_4.png)

- Enable Less secure app access in [Google settings](https://myaccount.google.com/lesssecureapps) because Google automatically blocks third party access.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/gmail_imap_5.png)

- If you're using GSuite account, please the admin should go to the [Google Admin console](https://admin.google.com/u/5/ac/security/lsa) and allow users to manage their access to less secure apps.

- Allow access to your Google account

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-imap.png)

> Please make sure that you selected the correct account in the right sidebar of your browser.
> if you have a multiple accounts https://accounts.google.com/b/0/DisplayUnlockCaptcha - in this URL **/0/** is your first account
> **/1/** is second account and so on.

### Yahoo

In order to integrate the Yahoo you will need to generate app password for the Erxes, please follow below steps.

- Go to Settings/App Store and click on Add button of the Yahoo section

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-1.png)

- You will see a modal, then click on add account

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-2.png)

- Now you need to generate password for erxes, go ahead and click the link.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-3.png)

- You will be jump into Yahoo, sign in and click on Account Security in Settings as follows.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-4.png)

- Scroll to bottom and click on <b>Generate app password</b> link.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-5.png)

- Click on the <b>Select an app</b> and select Other app.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-6.png)

- Then name your app as <b>Erxes</b> and click on the <b>Generate</b> button.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-7.png)

- Great, you got the password, Now copy password and navigate back to the Erxes Settings/App Store

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-8.png)

- Fill your email address and paste your password, that is it click on the save button and create yahoo integration.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/nylas-yahoo-9.png)

## WhatsApp Integration

1. Create the Chat-API account go to [website](https://app.chat-api.com/registration)
2. Copy **API key** from [here](https://app.chat-api.com/user/settings)

- Click on your profile, then select settings.

![](https://erxes-docs.s3.us-west-2.amazonaws.com/integration/chat-api-whatsapp-3.png)

- Copy API key value

![](https://erxes-docs.s3.us-west-2.amazonaws.com/integration/chat-api-whatsapp-4.png)

**Configuration:**

- Go to Erxes Settings => System config => Integrations config => WhatsApp Chat-API.

![](https://erxes-docs.s3.us-west-2.amazonaws.com/integration/chat-api-whatsapp-1.png)

- Paste API key to corresponding field.

- Put your webhook url into CHAT-API WEBHOOK CALLBACK URL field.
- For example 'https://erxes-integrations/whatsapp/webhook'

When you start erxes-integration repo webhook will automatically created according to your configuration

### Erxes WhatsApp integration settings.

1. Go to your erxes.domain.com - settings - integrations page

2. Copy your instanceId and token from [here](https://app.chat-api.com/dashboard)

   ![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/chat-api-whatsapp-2.png)

3. To connect to api, you need to scan the QR code from the device on which WhatsApp is registered.

- If your account is registered less than a month ago, you need to pass a secure authorization to reduce the likelihood of blocking or authorization failure.

  ![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/chat-api-whatsapp-1.gif)

4. Click on **Add Integrations** and select WhatsApp.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/chat-api-whatsapp-5.png)

5. Paste instanceId and token into corresponding fields

6. Select your brand and click save.

7. Go to Setting=> Channel=> Add new channel=> Connect WhatsApp integration.

## Sunshine Conversations API Integration

1. Create your Sunshine Conversations API account [here](https://smooch.io/signup/).

2. After you create a account. Sign in to [smooch.io](https://app.smooch.io/login).

3. Create new Sunshine Conversations app

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-1.png)

4. Go to your created app. Then select Settings tab.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-3.png)

5. In order to create api key click on "Generate API key".

6. Copy and paste your App id, API Key ID and secret to Erxes Settings => System config => Integrations config => Sunshine Conversations API

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-4.png)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-5.png)

7. Put your webhook url into SMOOCH WEBHOOK CALLBACK URL field.

- For example 'https://erxes-integrations/smooch/webhook'

### Viber

1. Create a Public Account

- You can create an account for testing and development purpose by registering on the [Viber admin panel](https://partners.viber.com/).
- Fill out all required fields and create your Bot account.
- You can share the QR code with your customers and partners.

2. Once you have your Public Account token, copy and paste it into Viber token field on the Add Viber page from erxes App Store. Then click on “Save”.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-viber-2.png)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-viber-1.png)

3. Go to Setting=> Channel=> Add new channel=> Connect Viber integration.

### Telegram

1. Sign in to telegram [here](https://web.telegram.org/#/login).

2. In order to create telegram bot go to [BotFather](https://telegram.me/botfather).

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-telegram-3.png)

3. Type /newbot and send it to BotFather. Then follow the instructions from BotFather to create a bot.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-telegram-4.png)

- You can share the link with your customers and partners and they can connect with you.

4. Then copy your bot token and paste it into Telegram Bot Token field on the add Telegram page from erxes App Store. Then click on “Save”

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-telegram-1.png)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-telegram-2.png)

5. Go to Setting=> Channel=> Add new channel=> Connect Telegram integration.

### LINE

- A Channel ID and Channel Secret will need to be retrieved from the Line Developers Platform

- The Smooch Webhook URL will need to be added to the LINE Developers Platform.

1. Sign in to a [Line Developer Console](https://developers.line.biz/console/)

2. Select the Provider you created in the LINE Official Accounts platform previously or create new one.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-line-1.png)

3. Create Channel and select it to connect.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-line-2.png)

- Then you will get your channel id and secret.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-line-3.png)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-line-4.png)

4. Go to Erxes settings => App store => **add line**.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-line-5.png)

5. Copy and paste your channel id and secret to corresponding fields on the add LINE page from erxes App Store. Then click on “Save”. Then erxes will give you a webhook url.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-line-6.png)

6. Navigate to the Messaging API tab and add the Webook URL found in the previous step to the Webhook URL field.

7. Press Update and then Verify.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-line-7.png)

8. Turn on the Use Webhook switch.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-line-8.png)

9. Get your QR Code from Messaging API tab and share the QR Code with your customers and partners. This code will allow them to connect with you using LINE chat.

10. Go to Setting=> Channel=> Add new channel=> Connect LINE integration.

### Twilio SMS

1. Sign in to a [Twilio Console](https://www.twilio.com/console)

2. Go to the [Twilio Console](https://www.twilio.com/console) and press the red "Get a Trial Number" button. Twilio will recommend a phone number based on your location.

- If you don't have a preference, you can click on the red "Choose this Number" button. However, if you would like to purchase a number from a different country or you just would like a different number from the one recommended, you can click on "Search for a different number".

- You can select a number from any country available on Twilio. The only prerequisite for Erxes integration to work is SMS capability. Bear in mind that Twilio does offer numbers without SMS functionality, those won't work.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-twilio-1.png)

3. Copy and paste your ACCOUNT SID and AUTH TOKEN to corresponding fields on the add Twilio SMS page from erxes App Store.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-twilio-1.png)

4. Get your phone number sid from [twilio](https://www.twilio.com/console/phone-numbers/incoming)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-twilio-2.png)

5. Copy and paste your PHONE NUMBER SID to PHONE NUMBER SID field on the add Twilio SMS page from erxes App Store. Then click on “Save”.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/smooch-twilio-3.png)

6. Go to Setting=> Channel=> Add new channel=> Connect Twilio integration.

### Telnyx SMS

**1. Sign in to [telnyx portal](https://portal.telnyx.com).**

**2. Create an API key.**

With API keys, you can "talk" to the telnyx API.
![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/telnyx-api-key.png)

**3. Purchase phone numbers.**

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/telnyx-numbers-buy.png)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/telnyx-numbers.png)

**4. Create messaging profiles.**

Messaging profiles let you set configurations like destination countries, webhooks to send or receive messages.
![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/telnyx-msg-profile.png)

**5. Setup the API key in integration settings.**

Configure the telnyx API at **"settings > system config > integration config".**
![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/integration-telnyx.png)

**6. Create telnyx integrations with purchased phone number & messaging profile.**

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/add-telnyx-integration.png)

## Engage configurations

### AWS SES

Amazon SES service enables on Erxes Engage system. Another custom mail service is not allowed on Engage system.
AWS SES configuration is similar with Integration AWS SES. [Go to settings here](https://erxes.org/administrator/system-config#aws-ses)

### Verify email

Amazon places all new accounts in the Amazon SES sandbox. While your account is in the sandbox, you can use all of the features of Amazon SES. However, when your account is in the sandbox, Amazon have applied the following restrictions to your account:

- You can only send mail to verified email addresses and domains, or to the Amazon SES mailbox simulator.

- You can only send mail from verified email addresses and domains.

Insert emails and verify it.

### Send test email

![](https://erxes-docs.s3-us-west-2.amazonaws.com/Amazon-ses/amazon+test+conf.png)

```

```
