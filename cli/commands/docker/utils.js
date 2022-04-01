const fs = require("fs");
const fse = require("fs-extra");
const yaml = require("yaml");
const { log, execCommand, filePath, execCurl } = require("../utils");

const commonEnvs = (configs) => {
  return {
    DEBUG: "erxes*",
    NODE_ENV: "production",
    REDIS_HOST: configs.redis_host || "localhost",
    REDIS_PORT: configs.redis_port || 6379,
    REDIS_PASSWORD: configs.redis_password || "",
    RABBITMQ_HOST: configs.rabbitmq_host,
    ELASTICSEARCH_URL: configs.elasticsearch_url || "",
    ENABLED_SERVICES_PATH: "/data/enabled-services.js",
  };
};

const generatePluginBlock = (configs, plugin) => {
  return {
    container_name: `plugin-${plugin.name}-api`,
    image: `erxes/plugin-${plugin.name}-api:federation`,
    environment: {
      PORT: plugin.port || 4004,
      API_MONGO_URL: plugin.api_mongo_url || configs.mongo_url,
      MONGO_URL: plugin.mongo_url || configs.mongo_url,
      ...commonEnvs(configs),
    },
    volumes: ["./enabled-services.js:/data/enabled-services.js"],
    networks: ["erxes"],
  };
};

module.exports.start = async (program) => {
  const configs = await fse.readJSON(filePath("configs.json"));

  const subscription_url = `wss://${configs.main_api_domain.replace(
    "https://",
    ""
  )}/graphql`;

  const NGINX_HOST = (configs.main_app_domain || "").replace("https://", "");

  const dockerComposeConfig = {
    version: "3.3",
    networks: {
      erxes: {
        driver: "bridge",
      },
    },
    services: {
      coreui: {
        image: "erxes/erxes:federation",
        container_name: "coreui",
        restart: "unless-stopped",
        environment: {
          REACT_APP_CDN_HOST: configs.widgets_domain || "",
          REACT_APP_API_URL: configs.main_api_domain || "",
          REACT_APP_DASHBOARD_URL: configs.dashboard_domain || "",
          REACT_APP_API_SUBSCRIPTION_URL: subscription_url,
          NGINX_HOST,
          NODE_ENV: "production",
          REACT_APP_FILE_UPLOAD_MAX_SIZE: 524288000,
        },
        ports: ["127.0.0.1:3000:80"],
        volumes: [
          "./plugins.js:/usr/share/nginx/html/js/plugins.js",
          "./plugin-uis:/usr/share/nginx/html/js/plugins",
        ],
        networks: ["erxes"],
      },
      core: {
        image: "erxes/core:federation",
        container_name: "plugin-core-api",
        restart: "unless-stopped",
        environment: {
          PORT: "3300",
          JWT_TOKEN_SECRET: configs.jwt_token_secret,
          API_DOMAIN: configs.main_api_domain || "",
          MAIN_APP_DOMAIN: configs.main_app_domain || "",
          MONGO_URL: configs.mongo_url,
          EMAIL_VERIFIER_ENDPOINT:
            configs.email_verifier_endpoint ||
            "https://email-verifier.erxes.io",
          ENABLED_SERVICES_PATH: "/data/enabled-services.js",
          ...commonEnvs(configs),
        },
        volumes: ["./enabled-services.js:/data/enabled-services.js"],
        ports: ["127.0.0.1:3300:3300"],
        networks: ["erxes"],
      },
      gateway: {
        image: "erxes/gateway:federation",
        container_name: "gateway",
        restart: "unless-stopped",
        environment: {
          PORT: "4000",
          JWT_TOKEN_SECRET: configs.jwt_token_secret,
          MAIN_APP_DOMAIN: configs.main_app_domain,
          API_DOMAIN: "http://core:3300",
          WIDGETS_DOMAIN: configs.widgets_domain,
          CLIENT_PORTAL_DOMAINS: configs.client_portal_domains || "",
          MONGO_URL: configs.mongo_url,
          ...commonEnvs(configs),
        },
        volumes: ["./enabled-services.js:/data/enabled-services.js"],
        ports: ["127.0.0.1:4000:4000"],
        networks: ["erxes"],
      },
      worker: {
        image: "erxes/workers:federation",
        container_name: "plugin-worker-api",
        restart: "unless-stopped",
        environment: {
          PORT: "3700",
          JWT_TOKEN_SECRET: configs.jwt_token_secret,
          ...commonEnvs(configs),
        },
        volumes: ["./enabled-services.js:/data/enabled-services.js"],
        networks: ["erxes"],
      },
      essyncer: {
        image: "erxes/erxes-essyncer:federation",
        container_name: "essyncer",
        restart: "unless-stopped",
        environment: {
          ELASTICSEARCH_URL: configs.elasticsearch_url,
          MONGO_URL: configs.mongo_url,
        },
        volumes: ["/essyncerData:/data/essyncerData"],
        networks: ["erxes"],
      },
    },
  };

  if (configs.widgets_domain) {
    dockerComposeConfig.services.widgets = {
      image: "erxes/erxes-widgets:federation",
      container_name: "widgets",
      restart: "unless-stopped",
      environment: {
        PORT: "3200",
        ROOT_URL: configs.widgets_domain,
        API_URL: configs.main_api_domain,
        API_SUBSCRIPTIONS_URL: subscription_url,
      },
      ports: ["127.0.0.1:3200:3200"],
      networks: ["erxes"],
    };
  }

  if (configs.dashboard) {
    dockerComposeConfig.services.dashboard = {
      image: "erxes/dashboard:federation",
      container_name: "plugin-dashboard-api",
      restart: "unless-stopped",
      environment: {
        PORT: "3800",
        JWT_TOKEN_SECRET: configs.jwt_token_secret,
        ...commonEnvs(configs),
      },
      volumes: ["./enabled-services.js:/data/enabled-services.js"],
      networks: ["erxes"],
    };

    dockerComposeConfig.services["dashboard-front"] = {
      image: "erxes/erxes-dashboard-front:develop",
      container_name: "dashboard-front",
      restart: "unless-stopped",
      ports: ["127.0.0.1:4200:80"],
      environment: {
        REACT_APP_API_URL: configs.main_api_domain,
        REACT_APP_API_SUBSCRIPTION_URL: subscription_url,
        REACT_APP_DASHBOARD_API_URL: `https://${NGINX_HOST}/dashboard/api`,
        REACT_APP_DASHBOARD_API_TOKEN: configs.dashboard.api_token,
        NGINX_HOST,
      },
      networks: ["erxes"],
    };
  }

  if (configs.kibana) {
    dockerComposeConfig.services.kibana = {
      image: "docker.elastic.co/kibana/kibana:7.6.0",
      container_name: "kibana",
      ports: ["127.0.0.1:5601:5601"],
      networks: ["erxes"],
    };
  }

  if (configs.mongo) {
    if (!(await fse.exists(filePath('mongodata')))) {
      await execCommand('mkdir mongodata');
    }

    dockerComposeConfig.services.mongo = {
      hostname: "mongo",
      image: "mongo:4.0.20",
      container_name: "mongo",
      ports: ["127.0.0.1:27017:27017"],
      environment: {
        MONGO_INITDB_ROOT_USERNAME: configs.mongo.username,
        MONGO_INITDB_ROOT_PASSWORD: configs.mongo.password,
      },
      networks: ["erxes"],
      volumes: ["./mongodata:/data/db"],
      command: ["--replSet", "rs0", "--bind_ip_all"],
    };
  }

  if (configs.elasticsearch) {
    if (!(await fse.exists(filePath('elasticsearchData')))) {
      await execCommand('mkdir elasticsearchData');
    }

    dockerComposeConfig.services.elasticsearch = {
      image: "docker.elastic.co/elasticsearch/elasticsearch:7.8.0",
      container_name: "elasticsearch",
      environment: {
        "discovery.type": "single-node",
      },
      ports: ["127.0.0.1:9200:9200"],
      networks: ["erxes"],
      volumes: ["./elasticsearchData:/usr/share/elasticsearch/data"],
      ulimits: {
        memlock: {
          soft: -1,
          hard: -1,
        },
      },
    };
  }

  if (configs.redis) {
    dockerComposeConfig.services.redis = {
      image: "redis:5.0.5",
      container_name: "redis",
      restart: "always",
      command: `redis-server --appendonly yes --requirepass ${configs.redis.password}`,
      ports: ["127.0.0.1:6379:6379"],
      networks: ["erxes"],
      volumes: ["./redisdata:/data"],
    };
  }

  if (configs.rabbitmq) {
    dockerComposeConfig.services.rabbitmq = {
      image: "rabbitmq:3.7.17-management",
      container_name: "rabbitmq",
      restart: "unless-stopped",
      hostname: "rabbitmq",
      environment: {
        RABBITMQ_VM_MEMORY_HIGH_WATERMARK: "2048MiB",
        RABBITMQ_ERLANG_COOKIE: configs.rabbitmq.cookie,
        RABBITMQ_DEFAULT_USER: configs.rabbitmq.user,
        RABBITMQ_DEFAULT_PASS: configs.rabbitmq.pass,
        RABBITMQ_DEFAULT_VHOST: configs.rabbitmq.vhost,
      },
      ports: ["127.0.0.1:15672:15672"],
      networks: ["erxes"],
      volumes: ["./rabbitmq-data:/var/lib/rabbitmq"],
    };
  }


  if (!(await fse.exists(filePath('plugin-uis')))) {
    log('Downloading plugin uis from s3 ....');
    await execCommand('aws s3 sync s3://plugin-uis plugin-uis  --no-sign-request');
  }

  log('Downloading pluginsMap.js from s3 ....');

  await execCurl(
    'https://plugin-uis.s3.us-west-2.amazonaws.com/pluginsMap.js',
    'pluginsMap.js'
  );

  const pluginsMap = require(filePath('pluginsMap.js'));

  const enabledPlugins = [];
  const uiPlugins = [];

  for (const plugin of configs.plugins || []) {
    dockerComposeConfig.services[
      `plugin_${plugin.name}_api`
    ] = generatePluginBlock(configs, plugin);

    enabledPlugins.push(`${plugin.name}: true`);

    uiPlugins.push(JSON.stringify({
        name: plugin.name,
        ...pluginsMap[plugin.name]
      })
    );
  }

  log('Generating ui plugins.js ....');

  await fs.promises.writeFile(
    filePath('plugins.js'),
    `
    window.plugins = [
      ${uiPlugins.join(',')}
    ]
  `.replace(/plugin-uis.s3.us-west-2.amazonaws.com/g, NGINX_HOST)
  );

  log('Generating enabled-services.js ....');

  await fs.promises.writeFile(
    filePath('enabled-services.js'),
    `
    module.exports = {
      ${enabledPlugins.join(',')}
    }
  `
  );

  const extraServices = configs.extra_services || {};

  for (const serviceName of Object.keys(extraServices)) {
    const service = extraServices[serviceName];

    dockerComposeConfig.services[serviceName] = {
      ...service,
      networks: ["erxes"],
    };
  }

  const yamlString = yaml.stringify(dockerComposeConfig);

  log('Generating docker-compose.yml ....');

  fs.writeFileSync(filePath("docker-compose.yml"), yamlString);

  log('docker-compose up ......');

  return execCommand('docker-compose up -d');
};

module.exports.pullup = async () => {
  log('docker-compose pull ......');
  await execCommand('docker-compose pull');

  log('docker-compose up -d ......');
  await execCommand('docker-compose up -d');
}

module.exports.restart = async () => {
  const configs = await fse.readJSON(filePath("configs.json"));

  let names = configs.plugins.map(p => `plugin-${p.name}-api`).join(' ');

  names = `${names} core gateway`;

  await execCommand(`docker-compose restart ${names}`);
}