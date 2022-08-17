---
id: architecture
title: Architecture
sidebar_label: Architecture
---

erxes’s coding architecture comprises Backend, UI, and Widgets.

**Backend** part is responsible for ensuring all APIs of different plugins work together smoothly.

**UI** part used React, Apollo, and GraphQL and is also responsible for ensuring all API’s UI work together. XOS comes with utility features to help you manage your account:

- System config
- Permission
- Team members
- Brands
- Import & export
- Application
- Marketplace

**erxes Widgets** are built with Web Widgets, iOS SDK, Android SDK, React Native SDK - React, React Native, Apollo, GraphQl. It contains the codes that work on the user’s website and mobile application.

- The database is used for any erxes project.
- MongoDB 3.6+
- Redist 3.x+
- RabbitMQ 3.8.x+
- Elasticsearch

<img src="https://imagedelivery.net/5m26Aj-CutMXPPNacMs_yQ/22717d4e-ad66-4d44-6c3b-6b74692b4e00/public" width="100%" alt="Architecture"></img>
