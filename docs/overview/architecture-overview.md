---
id: architecture-overview
title: Architecture Overview
sidebar_label: Architecture Overview
---

<!--Content-->
Erxes at its core is a repository that collects all customer requests from various channels including web chats, facebook, twitter, gmail and provides the ability to respond to those requests from one unified location. In order to accomplish these goals, we have 4 main projects.

<br />

+ <b>web widgets, iOS SDK, Android SDK</b>
<a href="https://www.apollographql.com/docs/react/" target="__blank">react, apollo, graphql</a> clients responsible for sending information to erxes-api

+ <b>erxes</b> <a href="https://www.apollographql.com/docs/react/" target="__blank">apollo, react, graphql</a> 
responsible for writing widgets data to database, sending a notification to erxes-api 
<br />

+ <b>erxes-api</b> <a href="https://www.apollographql.com/docs/apollo-server" target="__blank">nodejs, graphql, apollo</a> responsible for writing erxes fontend project's data to the database, receiving notifications from widgets, talking to external APIs 
<br />

+ <b>erxes-integrations</b> <a href="https://www.apollographql.com/docs/apollo-server" target="__blank">(nodejs)</a> responsible for receiving all external api webhook updates including facebook, twitter, gmail, nylas etc ...
<br />

+ <b><a href="https://redis.io/">Redis server</a></b> responsible for handling real-time communications
+ <b><a href="https://www.mongodb.com/">MongoDB</a></b>

<div>
  <img src="https://erxes-docs.s3-us-west-2.amazonaws.com/erxes_architecture.svg" />
</div>

---
