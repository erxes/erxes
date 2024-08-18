  {
    "jwt_token_secret": "e0f3e51e3b0e026feb8eb53ba79d876f",
    "db_server_address": "",
    "secondary_server_address": "",
    "image_tag": "v2",
    "private_plugins_map": "https://erxes-enterprise-plugins.s3.us-west-2.amazonaws.com/pluginsMap.js",
    "domain": "https://test.erxes.io",
    "client_portal_domains": "http://localhost:8080,http://localhost:7002,http://192.168.43.156:7002/",
    "widgets": { "domain": "https://test.erxes.io/widgets" },
    "elasticsearch": {},
    "essyncer": {},
    "redis": { "password": "redis_pass" },
    "mongo": {
      "username": "erxes",
      "password": "UqKzqMhOOzFdNQhAzecLAiSk",
      "replication": true
    },
    "rabbitmq": {
      "cookie": "",
      "user": "erxes",
      "pass": "fAXkiGHctXpPHRyfOOjSxcaA",
      "vhost": ""
    },
    "extra_services": {
      "posui": {
        "image": "erxes/pos-ui:dev",
        "environment": {
          "NEXT_PUBLIC_MAIN_API_DOMAIN": "https://test.erxes.io/gateway",
          "NEXT_PUBLIC_MAIN_SUBS_DOMAIN": "wss://test.erxes.io/gateway/graphql",
          "NEXT_PUBLIC_SERVER_API_DOMAIN": "https://test.erxes.io/gateway",
          "NEXT_PUBLIC_SERVER_DOMAIN": "https://test.erxes.io",
          "NGINX_HOST": "postest.erxes.io"
        },
        "ports": ["7000:3000"]
      },
      "client-portal": {
        "image": "erxes/client-portal:dev",
        "environment": {
          "REACT_APP_DOMAIN": "https://test.erxes.io",
          "JWT_TOKEN_SECRET": "e0f3e51e3b0e026feb8eb53ba79d876f",
          "REACT_APP_SUBSCRIPTION_URL": "wss://test.erxes.io/gateway/graphql",
          "NGINX_HOST": "helptest.erxes.io"
        },
        "ports": ["4400:3000"]
      },
      "exm": {
        "image": "erxes/exm:dev",
        "environment": {
          "NEXT_PUBLIC_MAIN_API_DOMAIN": "https://test.erxes.io/gateway",
          "JWT_TOKEN_SECRET": "e0f3e51e3b0e026feb8eb53ba79d876f",
          "NEXT_PUBLIC_MAIN_SUBS_DOMAIN": "wss://test.erxes.io/gateway/graphql",
          "NGINX_HOST": "exmtest.erxes.io",
          "NODE_ENV": "production"
        },
        "ports": ["6200:3000"]
      }
    },
    "gateway": {
      "extra_env": { "ALLOWED_ORIGINS": "erxes.io", "INTROSPECTION": "true" }
    },
    "plugins": [
      { "name": "assets" },
      { "name": "automations" },
      {
        "name": "calls",
        "extra_env": {
          "CALL_API_USER": "recApi",
          "CALL_API_PASSWORD": "recApi13"
        }
      },
      { "name": "sales" },
      { "name": "tickets" },
      { "name": "purchases" },
      { "name": "tasks" },
      { "name": "cars" },
      { "name": "chats" },
      { "name": "dailyco" },
      { "name": "documents" },
      { "name": "ecommerce" },
      { "name": "ebarimt" },
      { "name": "emailtemplates" },
      { "name": "engages" },
      { "name": "exm" },
      { "name": "exmfeed" },
      {
        "name": "facebook",
        "extra_env": {
          "ENDPOINT_URL": "https://enterprise.erxes.io",
          "MONGO_URL": "mongodb://erxes:UqKzqMhOOzFdNQhAzecLAiSk@erxes-dbs_mongo:27017/erxes_facebook?authSource=admin&replicaSet=rs0"
        }
      },
      { "name": "filemanager" },
      { "name": "forum" },
      { "name": "imap" },
      {
        "name": "inbox",
        "extra_env": {
          "INTEGRATIONS_MONGO_URL": "mongodb://erxes:UqKzqMhOOzFdNQhAzecLAiSk@erxes-dbs_mongo:27017/erxes_integrations?authSource=admin&replicaSet=rs0",
          "FB_MONGO_URL": "mongodb://erxes:UqKzqMhOOzFdNQhAzecLAiSk@erxes-dbs_mongo:27017/erxes_facebook?authSource=admin&replicaSet=rs0",
          "TZ": "Asia/Ulaanbaatar"
        }
      },
      { "name": "insight"},
      { "name": "integrations" },
      { "name": "inventories" },
      { "name": "knowledgebase" },
      { "name": "loans" },
      { "name": "loyalties" },

      { "name": "meetings" },
      { "name": "msdynamic" },
      { "name": "multierkhet" },
      { "name": "pos" },
      {
        "name": "posclient",
        "extra_env": {
          "JWT_TOKEN_SECRET": "e0f3e51e3b0e026feb8eb53ba79d876f",
          "DB_NAME": "erxes_pos",
          "ALLOWED_ORIGINS": ".*"
        }
      },
      { "name": "pricing" },
      { "name": "products" },
      { "name": "reactions" },
      { "name": "salesplans" },
      { "name": "timeclock" },
      { "name": "viber" },
      { "name": "webbuilder" },
      { "name": "webhooks" },
      { "name": "xyp" },
      { "name": "template" },
    ]
  }