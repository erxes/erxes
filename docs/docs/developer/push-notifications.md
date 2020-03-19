---
id: push-notifications
title: Push notifications
sidebar_label: Push notifications
---
Push Notifications are an important feature to retain and re-engage users and monetize on their attention. We use Firebase's cloud messaging feature as a push notification service. Let's get started with following steps.

First things first, The Firebase is part of the Google product so we will need a Google project.

1. [Go to the Google Cloud Console website.](https://console.cloud.google.com/)
2. [Create Google project.](/administrator/system-config#create-a-google-cloud-project) 
3. Select the project.

<div><img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-3.png" width="100%" height="100%"></div>

4. We need to enable Firebase API for our Google project </br>
5. Select a newly created project </br>
6. Click on Library from the left side menu </br>
7. Search Firebase Cloud Messaging API and click on the enable button </br>
</p>
<div><img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-4.png" width="100%" height="100%"></div>
<p>
  
  8. Now we need a Firebase Project, let's create one </br>
  9. <a href="https://console.firebase.google.com/">Go to the Firebase Console website</a> </br>
  10. Click on create a project, enter your firebase project name and continue, it might take a while. </br>
</p>
<div><img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-5.png" width="100%" height="100%"></div>
<p>

  11. Go to project settings.
</p>
<div><img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-6.png" width="100%" height="100%"></div>
<p>

  12. We are going to use Firebase Admin SDK to send a push notification. Thus we have to authenticate, in order to use Firebase feature, here comes the Firebase service account. Create the JSON key and download it.
</p>
<div><img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-7.png" width="100%" height="100%"></div> </br>
<div><img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-8.png" width="100%" height="100%"></div> </br>
<div><img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-9.png" width="100%" height="100%"></div> </br>
<p>

  13. Now we have the Firebase service account, copy all values of the file you downloaded and replace all values to <b>erxes-api/google_cred.json</b> file
</p>
<div><img src="https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google-project-10.png" width="100%" height="100%"></div> </br>