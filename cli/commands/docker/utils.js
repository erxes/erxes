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

const cleaning = async () => {
  await execCommand('docker rm $(docker ps -a -q -f status=exited)', true);
}

const generatePluginBlock = (configs, plugin) => {
  return {
    image: `erxes/plugin-${plugin.name}-api:federation`,
    environment: {
      PORT: plugin.port || 80,
      API_MONGO_URL: plugin.api_mongo_url || configs.mongo_url,
      MONGO_URL: plugin.mongo_url || configs.mongo_url,
      LOAD_BALANCER_ADDRESS: `http://plugin_${plugin.name}_api`,
      ...commonEnvs(configs),
    },
    volumes: ["./enabled-services.js:/data/enabled-services.js"],
    networks: ["erxes"],
    deploy: {
      replicas: plugin.replicas || 1
    }
  };
};

module.exports.start = async (program) => {
  await cleaning();

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
        driver: "overlay",
      },
    },
    services: {
      coreui: {
        image: "erxes/erxes:federation",
        environment: {
          REACT_APP_CDN_HOST: configs.widgets_domain || "",
          REACT_APP_API_URL: configs.main_api_domain || "",
          REACT_APP_DASHBOARD_URL: configs.dashboard_domain || "",
          REACT_APP_API_SUBSCRIPTION_URL: subscription_url,
          NGINX_HOST,
          NODE_ENV: "production",
          REACT_APP_FILE_UPLOAD_MAX_SIZE: 524288000,
        },
        ports: ["3000:80"],
        volumes: [
          "./plugins.js:/usr/share/nginx/html/js/plugins.js",
          "./plugin-uis:/usr/share/nginx/html/js/plugins",
        ],
        networks: ["erxes"],
      },
      plugin_core_api: {
        image: "erxes/core:federation",
        environment: {
          PORT: "80",
          JWT_TOKEN_SECRET: configs.jwt_token_secret,
          LOAD_BALANCER_ADDRESS: "http://plugin_core_api",
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
        networks: ["erxes"],
      },
      gateway: {
        image: "erxes/gateway:federation",
        environment: {
          PORT: "80",
          LOAD_BALANCER_ADDRESS: "http://gateway",
          JWT_TOKEN_SECRET: configs.jwt_token_secret,
          MAIN_APP_DOMAIN: configs.main_app_domain,
          API_DOMAIN: "http://plugin_core_api",
          WIDGETS_DOMAIN: configs.widgets_domain,
          CLIENT_PORTAL_DOMAINS: configs.client_portal_domains || "",
          MONGO_URL: configs.mongo_url,
          ...commonEnvs(configs),
        },
        volumes: ["./enabled-services.js:/data/enabled-services.js"],
        ports: ["4000:80"],
        networks: ["erxes"],
      },
      worker: {
        image: "erxes/workers:federation",
        environment: {
          PORT: "80",
          JWT_TOKEN_SECRET: configs.jwt_token_secret,
          LOAD_BALANCER_ADDRESS: "http://plugin_worker_api",
          ...commonEnvs(configs),
        },
        volumes: ["./enabled-services.js:/data/enabled-services.js"],
        networks: ["erxes"],
      },
      essyncer: {
        image: "erxes/erxes-essyncer:federation",
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
      environment: {
        PORT: "3200",
        ROOT_URL: configs.widgets_domain,
        API_URL: configs.main_api_domain,
        API_SUBSCRIPTIONS_URL: subscription_url,
      },
      ports: ["3200:3200"],
      networks: ["erxes"],
    };
  }

  if (configs.dashboard) {
    dockerComposeConfig.services.dashboard = {
      image: "erxes/dashboard:federation",
      environment: {
        PORT: "80",
        JWT_TOKEN_SECRET: configs.jwt_token_secret,
        ...commonEnvs(configs),
      },
      volumes: ["./enabled-services.js:/data/enabled-services.js"],
      networks: ["erxes"],
    };

    dockerComposeConfig.services["dashboard-front"] = {
      image: "erxes/erxes-dashboard-front:develop",
      ports: ["4200:80"],
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
      ports: ["5601:5601"],
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
      ports: ["27017:27017"],
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
      environment: {
        "discovery.type": "single-node",
      },
      ports: ["9200:9200"],
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
      command: `redis-server --appendonly yes --requirepass ${configs.redis.password}`,
      ports: ["6379:6379"],
      networks: ["erxes"],
      volumes: ["./redisdata:/data"],
    };
  }

  if (configs.rabbitmq) {
    dockerComposeConfig.services.rabbitmq = {
      image: "rabbitmq:3.7.17-management",
      hostname: "rabbitmq",
      environment: {
        RABBITMQ_VM_MEMORY_HIGH_WATERMARK: "2048MiB",
        RABBITMQ_ERLANG_COOKIE: configs.rabbitmq.cookie,
        RABBITMQ_DEFAULT_USER: configs.rabbitmq.user,
        RABBITMQ_DEFAULT_PASS: configs.rabbitmq.pass,
        RABBITMQ_DEFAULT_VHOST: configs.rabbitmq.vhost,
      },
      ports: ["15672:15672"],
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

    if (pluginsMap[plugin.name]) {
      uiPlugins.push(JSON.stringify({
          name: plugin.name,
          ...pluginsMap[plugin.name]
        })
      );
    }
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

  log('Deploy ......');

  return execCommand('docker stack deploy --compose-file docker-compose.yml erxes  --with-registry-auth');
};

module.exports.pullup = async (program) => {
  if (program.uis) {
    log('Syncing plugin uis from s3 ....');

    await execCommand('aws s3 sync s3://plugin-uis plugin-uis  --no-sign-request');
    return;
  }

  if (process.argv.length < 4) {
    return console.log('Pass plugin names !!!');
  }

  const pluginNames = process.argv[3];

  for (const name of pluginNames.split(',')) {
    log(`Force updating  ${name}......`);

    await execCommand(`docker service update erxes_plugin_${name}_api --force`);
  }
}

module.exports.restart = async () => {
  await cleaning();

  const configs = await fse.readJSON(filePath("configs.json"));

  const names = configs.plugins.map(p => `plugin_${p.name}_api`);
  names.push('plugin_core_api');

  console.log('Removing services .......');
  await execCommand('docker service rm erxes_gateway', true);

  for (const name of names) {
    await execCommand(`docker service rm erxes_${name}`, true);
  }

  console.log('Deploy .......');

  await execCommand('docker stack deploy --compose-file docker-compose.yml erxes  --with-registry-auth');
}