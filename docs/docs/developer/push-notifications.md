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

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-4.png" width="100%" height="100%">
  
  - Create the Firebase project [click here](https://console.firebase.google.com/)

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-5.png" width="100%" height="100%">

  - Go to project settings.

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-6.png" width="100%" height="100%">

  - We are going to use Firebase Admin SDK to send a push notification. Thus we have to authenticate, in order to use Firebase feature, here comes the Firebase service account. Create the JSON key and download it.

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-7.png" width="100%" height="100%">

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-8.png" width="100%" height="100%">

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-9.png" width="100%" height="100%">

  - Now we have the Firebase service account, copy all values of the file you downloaded and replace all values to <b>erxes-api/google_cred.json</b> file

  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-10.png" width="100%" height="100%">