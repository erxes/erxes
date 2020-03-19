---
id: aws
title: AWS Marketplace
---

Launch an EC2 instance selecting `erxes` in the AWS Marketplace.  
Once you have created the EC2 instance using erxes AMI product in the AWS Marketplace, you will then have erxes up and running and it will be accessible by public hostname of the EC2 instance.

## Create an admin user

Connect to your EC2 instance via ssh.

`ssh -i your.pem ubuntu@your-instance-dns`

Run the following commands.

```sh
sudo su erxes
cd ~/erxes-api
export MONGO_URL=mongodb://localhost/erxes
```

The following will create an admin user admin@erxes.io with a random password (check your console to grab the password)

```
yarn initProject
```

## Load initial data

The below command will create initial permission groups, permissions, growth hack templates, email templates and some sample data and reset the admin password (check your console to grab the password)

```
yarn loadInitialData
```

If do not want to load sample data then you can run the following command just to load permissions.

```
yarn loadPermission
```

Now you can access erxes using the EC2 public hostname.  
Hooray!!!
