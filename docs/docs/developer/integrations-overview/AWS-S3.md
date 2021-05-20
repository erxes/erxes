---
id: aws-s3
title: AWS S3 integration
---

Amazon Simple Storage Service (Amazon S3) is storage for the internet. You can use Amazon S3 to store and retrieve any amount of data at any time, from anywhere on the web.

**Configuration:**

- Go to Erxes Settings => System config => General System Config => AWS S3.

```
AWS_ACCESS_KEY_ID='your aws account access key id'
AWS_SECRET_ACCESS_KEY='your aws account secret key'
AWS_BUCKET='aws bucket name'
AWS_PREFIX='you can use prefix names to specify the names of the files to be uploaded'
AWS_COMPATIBLE_SERVICE_ENDPOINT=''
AWS_FORCE_PATH_STYLE=''
```

- [ Log in to your AWS Management Console. ](https://console.aws.amazon.com)
- You can get your `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from AWS My Security Credentials=> Access keys (access key ID and secret access key).
- [Create new bucket](https://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html) and insert name in `AWS_BUCKET`, make sure bucket permission configuration.

- Make sure your IAM user has proper access to S3 services. [Learn more about public access.](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/block-public-access.html)

- `AWS_COMPATIBLE_SERVICE_ENDPOINT`, if you need to override an endpoint for a service, you can set the endpoint on a service by passing the endpoint object with the endpoint option key. [Refer to AWS service endpoint.](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Endpoint.html)

- `AWS_FORCE_PATH_STYLE`, some services have very specific configuration options that are not shared by other services. [Refer to AWS force path style.](https://docs.aws.amazon.com/sdkforruby/api/Aws/Plugins/GlobalConfiguration.html)