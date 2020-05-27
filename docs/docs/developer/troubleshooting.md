---
id: troubleshooting
title: Troubleshooting
sidebar_label: Troubleshooting
---

## Nylas
Having troubles with your own Nylas App? We recommend you to read this [developer guide](https://docs.nylas.com/docs).

## Integration
*  After you create an integration do not forget to add it to a channel, Otherwise, you will not see an email or message integration in Inbox.

## Revoke Google app
* After removing your **Nylas-Gmail** or **Gmail** account from Erxes you will also need to revoke your Erxes app [Google App permissions]( https://myaccount.google.com/permissions).

## Password Encryption
In **Outlook**, **Yahoo**, **IMAP** providers your password needs to be encrypted so following configs are required before you create an account.
- ALGORITHM
- ENCRYPTION KEY

<img src="https://erxes-docs.s3-us-west-2.amazonaws.com/troubleshooting/troubleshoot-3.png" />

## Nylas IMAP
> Before you add IMAP account please make sure that you already config ENCRYPTION KEY, ALGORITHM [here](#password-encryption).

When you create the IMAP account check you entered correct values for example:

<img src="https://erxes-docs.s3-us-west-2.amazonaws.com/troubleshooting/troubleshoot-2.png" />

* Common [a List of SMTP and IMAP Server](https://www.arclab.com/en/kb/email/list-of-smtp-and-imap-servers-mailserver-list.html).
* If you have Nylas IMAP specific problem read [here](https://docs.nylas.com/docs/imap).

## Gmail
* Before you use Gmail integration please make sure that you enter correct GOOGLE TOPIC, GOOGLE GMAIL SUBSCRIPTION NAME it should be single string otherwise you will get invalid_format error.

<img src="https://erxes-docs.s3-us-west-2.amazonaws.com/troubleshooting/troubleshoot-1.png" />

* Permission Denied, when creating or checking Google Topic and Subscription make sure your service account has owner role in IAM & Admin -> IAM.

* If you are not receiving any emails, please check you add Grant Publish Topic right to **gmail-api-push@system.gserviceaccount.com** in IAM & Admin -> IAM -> Add.

* When the Integration repository starts it will automatically create a topic and subscription for syncing, receiving emails. But if you have not configured your system environment you might see the following error - [ Google Cloud Getting started ]( ttps://cloud.google.com/docs/authentication/getting-started)
```
7 PERMISSION_DENIED: User not authorized to perform this action.
```
To fix the above error set the following variable to your environment.
```
export GOOGLE_APPLICATION_CREDENTIALS="/Path/to/your/[google_cred].json"
```