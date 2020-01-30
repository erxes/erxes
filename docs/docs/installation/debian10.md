---
id: debian10
title: Debian 10
---

## Installing erxes on Debian 10

To have erxes up and running quickly, you can follow the following steps.

1. Provision a new server running Debian 10.

2. Login to your new server as `root` account and run the following command.

   `bash -c "$(wget -O - https://raw.githubusercontent.com/erxes/erxes/develop/scripts/install/debian10.sh)"`

   **Note**: you will be asked to provide a domain for nginx server to set up config for erxes

3. This installation will create a new user `erxes`. Run the following command to change password.

   `passwd erxes`

4. Login to your domain DNS and create A record based on your new server IP.

Now you have erxes up and running!
