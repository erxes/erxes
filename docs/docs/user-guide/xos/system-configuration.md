---
id: system-configuration
title: System configuration
sidebar_label: 'System configuration'
---

System Configuration is the place where you set up your general configurations of your erxes XOS, such as email settings, language, files to be attached, etc.

:::tip

When you join erxes, all basic settings required by an average company have been pre-configured. Feel free to check if they meet your business requirements. However, If you need more than what's available, please contact our customer service team for additional support.

:::

The System Configuration has the following fields:

- General settings
- File upload
- Google Cloud Storage
- AWS S3
- AWS SES
- Google
- Common mail config
- Custom mail service
- Data retention
- Constants
- Connectivity Services
- MessagePro

### 1. Navigate your System Configuration within the Settings section at the bottom left side of your admin screen. {#navigate-system-configuration}
<div align="center">
<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/Navigate+general+settings.png" width="80%" alt="navigate general setting" ></img>
</div>

### 2. General settings {#general-settings}

- **Language** - Select the language used in the erxes XOS
- **Currency** - Select the currency used for Product & Services and Sales Pipeline plugins.
- **Unit of measurement** - Select unite of measure of your sale used for the Sales Pipeline.

<div align="center">
<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/General+settings.png" width="40%" alt="General setting" ></img>
</div>

### 3. Google {#google}

Google Cloud Platform (GCP), offered by Google, is a suite of cloud computing services that runs on the same infrastructure that Google uses internally for its end-user products, such as Firebase, Gmail and Pubsub. Alongside a set of management tools, it provides a series of modular cloud services including computing, data storage, data analytics and machine learning.

Following steps explain the Google Cloud Project. Which allows us to use Google Cloud Platform's services to our Erxes app.

- Create a Google Cloud Project [click here](https://console.cloud.google.com/)
- Click on the Select Project

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-1.png)

- Click on the New Project

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-2.png)

- Enter project name and click on the Create button

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-3.png)

#### Service account

- Navigate to sidebar IAM & Admin => Service Accounts

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-4.png)

- Now let's create service account for our app

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-5.png)

- Enter service account name and description then click on the Create button

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-6.png)

- Select Owner role and click on the Continue button

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-7.png)

- Create key for service account, you will download json file automatically and keep it

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-8.png)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-9.png)

- Successfully created service account

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-10.png)

- Copy the service account file's content to google_cred.json in **erxes-integrations/google_cred.json.sample**, and rename it to **google_cred.json**

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-11.png)

- export GOOGLE_APPLICATION_CREDENTIALS="/Path/to/your/[google_cred].json"

- One last touch, we need to configure erxes, Go to Settings => System Config => General System config
  And configure **GOOGLE PROJECT ID**, **GOOGLE APPLICATION CREDENTIALS** fields as in the sceenshot

  - **GOOGLE APPLICATION CREDENTIALS** is google_cred file's path by default it's ./google_cred.json no need to change
  - **GOOGLE APPLICATION CREDENTIALS JSON** is google_cred (service account) file's content for **Firebase** configuration

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-general-12.png)

That's it, now you are good use Google Cloud Platform Services which you can find them [here](https://console.cloud.google.com/apis/library)

### 4. File upload {#file-upload}

- Upload file types
- Upload file types of widget
- Upload service type
- Bucket file system type
<div align="center">
<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/File+uploads.png" width="40%" alt="file uploads" ></img>
</div>

### 5. Google Cloud Storage {#google-cloud-storage}

Cloud Storage provides worldwide, highly durable object storage that scales to exabytes of data. You can access data instantly from any storage class, integrate storage into your applications with a single unified API, and easily optimize price and performance.

#### Requirement:

- Google Cloud Platform project, follow [this](#google) guide to create one

- Enable Google Cloud Storage API [here](https://console.cloud.google.com/apis/library)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-storage-2.png)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-storage-1.png)

- Navigate to [here](https://console.cloud.google.com/storage/browser) and Create bucket for file upload

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-storage-3.png)

- Enter bucket name and fill out rest of the form

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-storage-4.png)

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-storage-5.png)

- Copy your bucket name and configure it in the Erxes app as follows

![](https://erxes-docs.s3-us-west-2.amazonaws.com/integration/google/google-storage-6.png)

Now final step, set upload service type to Google in [here](#file-upload)

### 6. Set up your AWS S3 settings here. {#aws-s3}

- AWS access key id
- AWS secret access key
- AWS bucket
<div align="center">
<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/AWS+S3.png" width="40%" alt="AWS S3" ></img>
</div>

### 7. Set up your AWS SES settings here. {#aws-ses}

- AWS SES access key id
- AWS SES secret access key
- AWS region
<div align="center">
<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/AWS+SES.png" width="40%" alt="AWS SES" ></img>
</div>

### 8. Common mail config {#common-mail-config}

This is where you can configure your email addresses to represent your companies on automated & manual emails to be verified.
<div align="center">
<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/Common+mail+config.png" width="40%" alt="Common mail config" ></img>
</div>

### 9. Custom mail service {#custom-mail-service}

This is where you can connect your own AWS account to erxes XOS.
<div align="center">
<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/Custom+mail+service.png" width="40%" alt="Custom mail config" ></img>
</div>

### 10. Data retention {#data-retention}
<div align="center">
<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/Data+Retention.png" width="40%" alt="data retention" ></img>
</div>

### 11. Constants {#constants}

- **Pronoun choices** - Select the pronouns to be available at your Contact plugin.
- **Company industry types** - Select the types of companies to be available to choose on your Contact plugin.
- **Social links** - Select the social links to be available to select at your Contact plugin here.
<div align="center">
<img src="https://erxes-docs.s3.us-west-2.amazonaws.com/Constant.png" width="40%" alt="constant" ></img>
</div>
