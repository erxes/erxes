---
id: architecture-overview
title: Architecture Overview
sidebar_label: Architecture Overview
---

This document describes the main architecture overview of Erxes.
Erxes at its core is a repository that collects all customer requests from various channels including web chats, Facebook, Twitter, Gmail and provides the ability to respond to those requests from one unified location. In order to accomplish these goals, we have 4 main projects.

- **web Widgets, iOS SDK, Android SDK**
  [react, apollo, graphql](https://www.apollographql.com/docs/react) clients responsible for sending information to erxes-api.

- **Erxes** [apollo, react, graphql](https://www.apollographql.com/docs/react)
  responsible for writing widgets data to database, sending a notification to erxes-api.

* **Erxes-api** [nodejs, graphql, apollo](https://www.apollographql.com/docs/apollo-server) responsible for writing erxes fontend project's data to the database, receiving notifications from widgets, talking to external APIs

- **Erxes-integrations** [nodejs](https://www.apollographql.com/docs/apollo-server) responsible for receiving all external api webhook updates including Facebook, Twitter, Gmail, Nylas etc ...

* **[Redis server](https://redis.io)** responsible for handling real-time communications.
* **[MongoDB](https://www.mongodb.com)**

  ![](https://erxes-docs.s3-us-west-2.amazonaws.com/erxes+Inc_+Architecture-Open+Source+Architecture.svg)
