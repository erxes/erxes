---
slug: release-0.12.0
title: Erxes v0.12.0 release information
author: Munkhjargal Gankhuyag
author_title: Project manager at Erxes Inc, an open source growth marketing platform
author_image_url: https://secure.gravatar.com/avatar/73467e8b969211b33f8d7f8fa30dc854?s=96&d=mm&r=g
tags: [release note, open source]
---

Erxes 0.12.0 release contains the number of new features, resolved issues and improvements. Therefore, the breaking changes has done in this release. Major features of the 0.12.0 series, compared to release 0.11.2\.

<!--truncate-->

#### What’s new:

- **Form: ability to change CSS from parent website.** In some cases, the developers want to hide form title, button or modify some auto-generated CSS, now it can pass  their desired CSS as a string config to install code.
- **Form: ability to call submit action from parent website.** In some cases, developers want to do some action user click as a submit button. Now there is able to listen for callSubmit action from outside to force submit action.
- **Added showErxesMessenger trigger in the messenger**. It was complicated to fix the position of launcher icon to the bottom, especially on mobile, since it overlapped with other elements, particularly bottom navbar. Hence, while it is attached to the scope of the body on a single page app, it will remain on other pages as well. Now it would be great if a messenger can be launched programmatically like erxes.launch() on some user interaction, "like clicking on request for help button". Rather than attaching to document, there should be an option to attach the erxes launcher to a specific element, as it causes the problem in single-page apps since it is not ideal to display the launcher icon in every page.
- **CallPro auto assign users:** Can be shown the integration number and assign the operator number**.** First, it is shown that which integration number is received incoming call. In order to assign the operator number, operator need to configure number on teammembers. Then automatically assigned operator number on that call.
- **Now it's possible to convert checklist items into card and remove in Deal, Ticket, task cards.**
- **Added new feature to insert your website within the Messenger window.**
- **Engage: verification management.** Currently, we are going to the AWS SES console to manage email verification. We will manage the email verification process in erxes platform.
- **Engage: show active process logs.** Currently, we are unable to show what's going on under the hood. This will give a clear understanding of the email sending process to users.
- **Email: Nylas forward feature.** Added forward button which allowed to forward email.

#### Improvements:

- **Improved permission filter.** Currently, even user has legal rights on user group, when filtering by email, it seems, they did not have right. Now it is updated to shown granted users. Added new selection for "Granted ". When unselect "Granted " and filter the users, it can be shown the forced deleted permission.
- **Using rabbitmq for communicating erxes-integrations.** Sending post request to erxes-api from integrations to save conversation, messages and customes is too risky. If erxes-api is temporarily unavailable when sending request from erxes-integrations those requests will be lost. Rabbitmq will create queue for not consumed messages until erxes-api is available.
- **Fixed issue that could not add checklist items sometimes.**
- **Improved attachment view in inbox.** When you show the images in the inbox, it shown clear with larger scaling.
- Shown all campaign in growthHack without any filtering.
- While uploading large file, it shows a warning.
- **Fixed move card labels bug in Deal, Ticket, Task card**. When a deal/task/ticket is moved between pipelines, labels inside of card does not move alongside. Now labels inside the deal/task/ticket card should also be available in the new pipeline.
- Able to add cc bcc in reply on email integration.
- **Mail: not receiving updates in realtime.** Before it was not clear to get email into inbox in a timely manner. Now while receive the new email, it is shown on bold email in inbox list without refreshing.
- Fixed checkbox field error and multiple submit bug in the form.

#### Breaking changes:

- widgets: **erxes-widgets-api** is making code duplication and difficult to maintain. So we decided that it is an unnecessary abstraction. Merged  erxes-widgets-api with erxes-api.

1.  Remove MAIN_API_URL env variable
2.  Point API_GRAPHQL_URL env variable to [http://localhost:3300/graphql](http://localhost:3300/graphql) AKA erxes-api

#### More Resources:

- [https://github.com/erxes/erxes/releases/tag/0.12.0](https://github.com/erxes/erxes/releases/tag/0.12.0)
- [https://github.com/erxes/erxes-api/releases/tag/0.12.0](https://github.com/erxes/erxes-api/releases/tag/0.12.0)
- [https://github.com/erxes/erxes-widgets/releases/tag/0.12.0](https://github.com/erxes/erxes-widgets/releases/tag/0.12.0)
- [https://github.com/erxes/erxes-integrations/releases/tag/0.12.0](https://github.com/erxes/erxes-integrations/releases/tag/0.12.0)
- [https://erxes.io/blog/post/erxes-v0-11-2-release-information](https://erxes.io/blog/post/erxes-v0-11-2-release-information)
