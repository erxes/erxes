---
id: creating-first-user
title: Creating first user
---

The following steps are required prior using the system.

## Create admin user

The below command will create first admin user with a random password.
The password will be printed in the terminal.

```
yarn initProject
```

```
username: admin@erxes.io
password: ********
```

## Load initial data

The below command will create initial permission groups, permissions, growth hack templates, email templates and some sample data, and reset the admin password.
The password will be printed in the terminal.

```
yarn loadInitialData
```

If you do not want to load sample data then you can run the following command just to load permissions.

```
yarn loadPermission
```
