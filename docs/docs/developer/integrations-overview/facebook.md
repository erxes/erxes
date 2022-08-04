---
id: facebook
title: Facebook integration guide
---

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