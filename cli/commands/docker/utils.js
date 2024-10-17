{
  "jwt_token_secret": "ukEdbjz51Q",
  "image_tag": "master",
  "db_server_address": "",
  "secondary_server_address": "",
  "domain": "https://gomongolia.erxes.io",
  "main_api_domain": "https://gomongolia.erxes.io/gateway",
  "redis": {
    "password": "czyRh3RmpH"
  },
  "elasticsearch": {},
  "essyncer": {},
  "installer": {},
  "mongo": {
    "username": "erxes",
    "password": "JwS9KDBTyh",
    "replication": true
  },
  "gateway": {
    "extra_env": {
      "ALLOWED_ORIGINS": ".*"
    }
  },
  "core": {
    "extra_env": {
      "ALLOWED_ORIGINS": ".*"
    }
  },
  "rabbitmq": {
    "cookie": "",
    "user": "erxes",
    "pass": "koaRQJBJQU",
    "vhost": ""
  },
  "widgets": {},
  "plugins": [
    {
      "name": "notifications"
    },
    {
      "name": "facebook",
      "extra_env": {
        "ENDPOINT_URL": "https://enterprise.erxes.io",
        "MONGO_URL": "mongodb://erxes:JwS9KDBTyh@erxes-dbs_mongo:27017/erxes_facebook?authSource=admin&replicaSet=rs0"
      }
    },
    {
      "name": "sales"
    },
    {
      "name": "tasks"
    },
    {
      "name": "tickets"
    },
    {
      "name": "inbox",
      "extra_env": {
        "INTEGRATIONS_MONGO_URL": "mongodb://erxes:JwS9KDBTyh@erxes-dbs_mongo:27017/erxes_integrations?authSource=admin&replicaSet=rs0",
        "FB_MONGO_URL": "mongodb://erxes:JwS9KDBTyh@erxes-dbs_mongo:27017/erxes_facebook?authSource=admin&replicaSet=rs0"
      }
    },
    {
      "name": "instagram",
      "extra_env": {
        "ENDPOINT_URL": "https://enterprise.erxes.io",
        "MONGO_URL": "mongodb://erxes:JwS9KDBTyh@erxes-dbs_mongo:27017/erxes_integrations?authSource=admin&replicaSet=rs0"
      }
    },
    {
       "name":"purchases"
    },
    {
      "name": "imap"
    },
    {
      "name": "automations"
    },
    {
      "name": "integrations"
    },
    {
      "name": "ecommerce"
    },
    {
      "name": "ebarimt"
    },
    {
      "name": "inventories"
    },
    {
      "name": "knowledgebase"
    },
    {
      "name": "payment"
    },
    {
      "name": "pos"
    },
    {
      "name": "posclient"
    },
    {
      "name": "pricing"
    },
    {
      "name": "clientportal",
      "extra_env": {
        "JWT_TOKEN_SECRET": "ukEdbjz51Q"
      }
    },
    {
      "name": "syncsaas",
      "registry": "registry.erxes.io",
      "image_tag": "enterprise",
      "ui_location": "https://erxes-enterprise-plugins.s3.us-west-2.amazonaws.com/uis/plugin-syncsaas-ui/build.tar",
      "extra_env": {
        "SAAS_CORE_URL": "https://erxes.io/api"
      }
    }
  ]
}