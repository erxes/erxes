---
id: aws-ses
title: AWS SES integration
---

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