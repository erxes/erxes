---
id: creating-first-user
title: Creating first user
---

Through these steps you can create a user to start using the system.

## Create admin user

Below command will create first admin user with following credentials.

```
yarn initProject
```

```
username: admin@erxes.io
password: erxes
```

## Load initial data

Below command will create initial permission groups, permissions, growth hack templates, email templates and some sample data.

```
yarn loadInitialData
```

If do not want to load sample data then you can run following command just to load permissions.

```
yarn loadPermission
```