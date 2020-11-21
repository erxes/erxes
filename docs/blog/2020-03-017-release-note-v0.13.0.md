---
slug: release-0.13.0
title: Erxes v0.13.0 release information
author: Munkhjargal Gankhuyag
author_title: Project manager at Erxes Inc, an open source growth marketing platform
author_image_url: https://secure.gravatar.com/avatar/73467e8b969211b33f8d7f8fa30dc854?s=96&d=mm&r=g
tags: [release note, open source]
---

Welcome to the March 2020 release of Erxes. The number of updates and new features are highlighted in this version. Therefore, the breaking change has done in this release. Major features of the 0.13.0 series, compared to release 0.12.0\.

<!--truncate-->

#### What’s new:

- **Added mandatory fields as BIRTHDAY and GENDER in customer basic info field.** In gender field, there is options as Not known, Male, Female and not Applicable.
- The Deal, Ticket, Task cards can be shown their first 20 items list on each sections respectively.
- **Added activity logs on Deal, ticket, Task cards.** It shows checklists log which created and deleted log in main activity tab by click on "show details".
- **Store environment variables into database.** Updating environment variables like UPLOAD FILE TYPES requiring backend services to restarted. It is complicated that non-technical users manage to backend service variables. Now it would be simple to restore env variables from the database with frontend interfaces.
- **Ability to call submit action in form from parent website as well as ability to change css from parent.**
- **Changed UI of Gowthhack page entirely.** Also UI of channel and brand pages are improved.
- **Erxes user manual has updated according to new release with novel features.** Doing everything manually by ourselves is time-consuming and it can be frustrating as everyone does not have the proper knowledge to do so. There are added some technical tutorials on documentations such install the services, integrate the API services, set up our developed features. For instance, Added more explaining that how to install Erxes on Debian 10, how to integrate Google API services, Nylas integration on Erxes etc.
- **Heroku deployment:** Erxes has successfully built to supporting services on Heroku.
- **Erxes language has expanded to support by Indonesian and** **Italian languages.**
- The contacts feature is added more FILTER value BY BRAND.
- The knowledgebase feature can be reacted reaction as a Happy, Sad, Like, Dislike go on. Also KB able to run without iframe.
- **Reimplement segments using elasticsearch.** We introduced elasticsearch to our architecture. Using [https://github.com/yougov/mongo-connector](https://github.com/yougov/mongo-connector) to sync customers and companies collection on MongoDB with elasticsearch. Every time if there is any change in these collections those changes will be synced to elasticsearch automatically. By doing this we are performing all customer and company-related filters using elasticsearch which is very efficient, fast and scalable segment method. Additionally we have implemented events feature in segments.

- **Added showErxesMessenger trigger in the messenger**. It was complicated to fix the position of launcher icon to the bottom, especially on mobile, since it overlapped with other elements, particularly bottom navbar. Hence, while it is attached to the scope of the body on a single page app, it will remain on other pages as well. Now it would be great if a messenger can be launched programmatically like erxes.launch() on some user interaction, “like clicking on request for help button”. Rather than attaching to document, there should be an option to attach the erxes launcher to a specific element, as it causes the problem in single-page apps since it is not ideal to display the launcher icon in every page. Additionally, Erxes messenger has an ability to hide launcher from admin.
- **Erxes now supports video calls service.** It allows us to easy to create and configure on-demand video call URLs by using the Daily.co API integration.
- **Added archive function in Deal, Task, Ticket and Growth hacking cards.** All cards can be archived and then it can be looked back and sent to board task or list.
- **Added email verification service.** Some email services such AWS SES possible to directly block for unverified emails. So it is necessary to verify email using email verification service like TrueMail before sending email in order to prevent the server would block verified emails.

#### Improvements and Bug fixes:

- **Fixed copy card with labels in Deal, Ticket, Task , GrowthHack** **cards.** It was lost labels on the copied version whilst copy the cards.

- **Allowed docker file permission.** Docker allows the root user to change the owner and group assigned to files, directories and links.
- **Erxes alert to show wrong version information.**
- **In the form:** It is checked whether multiple submit or not, then shows for loading information.Also fixed error of checkbox for event trigger when values are entered or changed in the input.
- While upload the forbidden file in the messenger, it alerts the error message.
- **Fixed bug in mail send and resolve button to send mail as to be resolved automatically.** Therefore, if there is missed the argument for submitting, it will alert us the missed arguments.
- Fixed bug in async initialization of Rabbitmq and Redis server.
- Fixed bug in Pop-up can not cancelling.
- **In the conversation will not be counted the number of left and joined message.** We considered it is unnecessary information to count in messsageCount field.
- Rename locale files according to standard and load only selected translation file.
- Reset submit state after fail for loading.
- **Fixed error to remove contacts from import history list.** It was can not remove contacts if there were too many.
- **Fixed bug which shows activity log in Deal, Ticket, Task , GrowthHack** **cards.**
- There will be removed account automatically which is not integrated to any Erxes integrations.

#### Breaking changes:

- **Translation**: Renamed some language codes (np -> hi, jp -> ja, kr -> ko, ptBr -> pt-br, vn -> vi, zh -> zh-cn)

#### More Resources:

- [https://github.com/erxes/erxes/releases/tag/0.13.0](https://github.com/erxes/erxes/releases/tag/0.13.0)
- [https://github.com/erxes/erxes-api/releases/tag/0.13.0](https://github.com/erxes/erxes-api/releases/tag/0.13.0)
- [https://github.com/erxes/erxes-integrations/releases/tag/0.13.0](https://github.com/erxes/erxes-integrations/releases/tag/0.13.0)
- [https://erxes.io/blog/posts/erxes-v0-12-0-release-information](https://erxes.io/blog/posts/erxes-v0-12-0-release-information)
