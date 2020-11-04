---
id: aws
title: AWS Marketplace
---

## To launch an instance from the AWS Marketplace using the launch wizard

1. Open the Amazon EC2 console at https://console.aws.amazon.com/ec2/.

2. From the Amazon EC2 dashboard, choose Launch instance.

3. On the Choose an Amazon Machine Image (AMI) page, choose the AWS Marketplace category on the left. Find a suitable AMI by browsing the categories, or using the search functionality. Choose Select to choose your product.

4. A dialog displays an overview of the product you've selected. You can view the pricing information, as well as any other information that the vendor has provided. When you're ready, choose Continue.

5. On the Choose an Instance Type page, select the hardware configuration and size of the instance to launch. When you're done, choose Next: Configure Instance Details.

6. On the next pages of the wizard, you can configure your instance, add storage, and add tags. For more information about the different options you can configure, see Launching an instance using the Launch Instance Wizard. Choose Next until you reach the Configure Security Group page.

The wizard creates a new security group according to the vendor's specifications for the product. The security group may include rules that allow all IPv4 addresses (0.0.0.0/0) access on SSH (port 22) on Linux or RDP (port 3389) on Windows. We recommend that you adjust these rules to allow only a specific address or range of addresses to access your instance over those ports.

When you are ready, choose Review and Launch.

7. On the Review Instance Launch page, check the details of the AMI from which you're about to launch the instance, as well as the other configuration details you set up in the wizard. When you're ready, choose Launch to select or create a key pair, and launch your instance.

8. Depending on the product you've subscribed to, the instance may take a few minutes or more to launch. You are first subscribed to the product before your instance can launch. If there are any problems with your credit card details, you will be asked to update your account details. When the launch confirmation page displays, choose View Instances to go to the Instances page.

9. When your instance is in the running state, you can connect to it. To do this, select your instance in the list and choose Connect. Follow the instructions in the dialog. For more information about connecting to your instance, see Connect to your Linux instance.

10. If the instance fails to launch or the state immediately goes to terminated instead of running, see Troubleshooting instance launch issues.


## Create an admin user

Connect to your EC2 instance via ssh.

`ssh -i your.pem ubuntu@your-instance-dns`

Run the following commands.

```sh
sudo su erxes
cd ~/erxes-api
export MONGO_URL=mongodb://localhost/erxes?replicaSet=rs0
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

## Use your own domain

To be able to use your own domain with erxes, you will need to do a few steps.

1. Update your domain DNS records - point your domain to your EC2 public IP address. The DNS changes may take up to 72 hours to propagate worldwide.

2. Log in to your server as `erxes` via `ssh`.

3. Edit `/home/erxes/erxes/ui/build/js/env.js` file where env vars for frontend app are stored.
   The content of the file should be as follows:

   ```javascript
   window.env = {
     PORT: 3000,
     NODE_ENV: "production",
     REACT_APP_API_URL: "http://your_domain/api",
     REACT_APP_API_SUBSCRIPTION_URL: "ws://your_domain/api/subscriptions",
     REACT_APP_CDN_HOST: "http://your_domain/widgets"
   };
   ```

4. Update all env vars with HTTP url in the `/home/erxes/ecosystem.json` file.

5. Now, you need to restart pm2 erxes processes by running the following command:

   ```sh
   pm2 restart ecosystem.json
   ```

6. Switch to `root` user and update your nginx config
   `server_name` with your domain.

7. Lastly reload your nginx service by running `systemctl reload nginx`

Now you can use erxes with your own domain.
