---
id: amazon-ses
title: AWS SES engage configuration
sidebar_label: AWS SES engage
---
Amazon Simple Email Service enables you to send and receive email using a reliable and scalable email platform. Set up your custom amazon simple email service account. 

## Configure Amazon SES and Amazon SNS to track each email responses.

1.	[ Log in to your AWS Management Console. ](https://console.aws.amazon.com)
2.	Click on your user name at the top right of the page.
3.	Click on the My Security Credentials link from the drop-down menu.
4.	Click on the Users menu from left Sidebar.
5.	Click on the Add user.
6.	Then create your username and check Programmatic access type and click next.
7.	Click on the Create group then write group name and check amazonSesFullAccess and amazonSNSFullAccess.
8.	Then check your created group and click on the Next button.
9.	Finally click on the create user and copy the Access Key Id and Secret Access Key.


## To find your Region.

1.	[ Log in to your AWS Management Console.](https://console.aws.amazon.com)
2.	Click on services menu at the top left of the page.
3.	Find Simple Email Service and Copy region code from url.

**If you choose not available region**
1.	Click on your region at the top right of the menu.
2.	Select any active region from list.
3.	Copy the selected Region code.
_(example: us-east-1, us-west-2, ap-south-1, ap-southeast-2, eu-central-1, eu-west-1)_


## To determine if your account is in the sandbox.
1.	[Open the Amazon SES console at https://console.aws.amazon.com/ses/](https://console.aws.amazon.com/ses/)
2.	Use the Region selector to choose an AWS Region.
3.	If your account is in the sandbox in the AWS Region that you selected, you see a banner at the top of the page that resembles the example in the following figure.

<img  src="https://erxes-docs.s3-us-west-2.amazonaws.com/amazon.png"/>

4.	If the banner doesn't appear on this page, then your account is no longer in the sandbox in the current Region.

<aside class="notice">
You can also determine whether your account is in the sandbox by sending email to an address that you haven't verified. If your account is in the sandbox, you receive an error message stating that the destination address isn't verified.
</aside> 


5. **If you move out of the Sandbox,** follow the instructions described [here](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html) to move out of the Amazon SES Sandbox.


## Paste Amazon-Ses Access Keys to Erxes AWS-SES engage.

1.	Login Erxes, go to Settings menu => Appstore.
2.	Click on the “Appstore” menu 
3.	Click manage to AWS-SES engage configuration

<img  src="https://erxes-docs.s3-us-west-2.amazonaws.com/Amazon-ses/Amazon+setting+aws.png"/>

4.	Paste the AWS-SES  access key ID, AWS-SES secret access key and AWS-SES region which you have created user in AWS Management console. 

<img  src="https://erxes-docs.s3-us-west-2.amazonaws.com/Amazon-ses/amazon-ses+key.png"/>

## Test configuration.

Amazon places all new accounts in the Amazon SES sandbox. While your account is in the sandbox, you can use all of the features of Amazon SES. However, when your account is in the sandbox, Amazon have applied the following restrictions to your account:

+ You can only send mail to verified email addresses and domains, or to the Amazon SES mailbox simulator.

+ You can only send mail from verified email addresses and domains.

<img  src="https://erxes-docs.s3-us-west-2.amazonaws.com/Amazon-ses/amazon+test+conf.png"/>