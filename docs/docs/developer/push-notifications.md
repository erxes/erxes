---
id: push-notifications
title: Push notifications
sidebar_label: Push notifications
---

Push Notifications are an important feature to retain and re-engage users and monetize on their attention. We use Firebase's cloud messaging feature as a push notification service. Let's get started with following steps.

First things first, The Firebase is part of the Google product so we will need a Google project.

#### Configuration

- Create the Google Cloud Project [click here](/administrator/system-config#google)
- Enable Firebase Cloud Messaging API [click here](https://console.cloud.google.com/apis/library)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-4.png)

- Create the Firebase project [click here](https://console.firebase.google.com/)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-5.png)

- Go to project settings.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-6.png)

- We are going to use Firebase Admin SDK to send a push notification. Thus we have to authenticate, in order to use Firebase feature, here comes the Firebase service account. Create the JSON key and download it.

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-7.png)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-8.png)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-9.png)

- Now we have the Firebase service account, copy all values of the file you downloaded and replace all values to <b>erxes-api/google_cred.json</b> file

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-10.png)
