
erxes is an open-source messaging platform for customer success.

[![Build Status](https://travis-ci.org/erxes/erxes.svg?branch=develop)](https://travis-ci.org/erxes/erxes)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/erxes/erxes/develop/LICENSE.md)
[![Join the chat at https://gitter.im/erxes/erxes](https://badges.gitter.im/erxes/erxes.svg)](https://gitter.im/erxes/erxes?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

erxes is built with JavaScript (ES6), Meteor, Node.js, MongoDB and React.

The project is maintained by erxes Inc, along with an amazing group of independent [contributors](https://github.com/erxes/erxes/graphs/contributors). We are striving to make customer experience better through our messaging platform.

## Table of content


- [erxes.io](https://erxes.io/)
- [Roadmap](https://github.com/erxes/erxes/projects/1)
- [Community](https://community.erxes.io/)
- [Blog](https://blog.erxes.io/)
- [Developer Blog](https://dev.erxes.io/)

## Developer install guide

### Install meteor

```Shell
curl https://install.meteor.com/ | sh
```

### Setup

Clone repo

```Shell
git clone https://github.com/erxes/erxes.git
cd erxes
```

Install dependencies

```Shell
meteor npm install
```

Create settings file

```Shell
cp settings.json.example settings.json
```

Configure settings. Open settings.json and edit it.

```JSON
{
  "public": {
    # your erxes deployed domain
    "CDN_HOST": "http://127.0.0.1/static",
    "APOLLO_CLIENT_URL": "http://localhost:8080/graphql"
  },

  "COMPANY_NAME": "{your_company_name}",
  "NO_REPLY_EMAIL": "{no-reply@{domain}}",

  # amazon s3 credientials. Using to upload attachments, profile pictures etc ...
  "AWS_accessKeyId": "{access_key_id}",
  "AWS_secretAccessKey": "{secret_access_key}",
  "AWS_bucket": "{bucket_name}",
}
```

Run

```Shell
./start.sh
```

Now, main app is running at <a href="localhost:7010" target="__blank">http://localhost:7010</a>.
Default channel, brand, integration must be created. Login using
```
email: 'admin@erxes.io'
password: 'admin123'
```

## Copyright & License
Copyright (c) 2016 erxes Inc - Released under the [MIT license.](https://github.com/erxes/erxes/blob/develop/LICENSE)
