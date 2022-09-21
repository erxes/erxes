const fs = require('fs');
const fse = require('fs-extra');
const yaml = require('yaml');
const { log, sleep, execCommand, filePath, execCurl } = require('../utils');

const commonEnvs = configs => {
  const db_server_address = configs.db_server_address;
  const widgets = configs.widgets || {};
  const redis = configs.redis || {};
  const rabbitmq = configs.rabbitmq || {};
  const rabbitmq_host = `amqp://${rabbitmq.user}:${
    rabbitmq.pass
  }@${rabbitmq.server_address || db_server_address}:5672/${rabbitmq.vhost}`;

  return {
    ELASTIC_APM_HOST_NAME: configs.elastic_apm_host_name,
    DEBUG: configs.debug_level || '*error*',
    NODE_ENV: 'production',
    DOMAIN: configs.domain,
    WIDGETS_DOMAIN: widgets.domain || `${configs.domain}/widgets`,
    REDIS_HOST: db_server_address,
    REDIS_PORT: 6379,
    REDIS_PASSWORD: redis.password || '',
    RABBITMQ_HOST: rabbitmq_host,
    ELASTICSEARCH_URL: `${db_server_address}:9200`,
    ENABLED_SERVICES_PATH: '/data/enabled-services.js',
    MESSAGE_BROKER_PREFIX: rabbitmq.prefix || ''
  };
};

const cleaning = async () => {
  await execCommand('docker rm $(docker ps -a -q -f status=exited)', true);
  await execCommand('docker rmi $(docker images -f dangling=true -q)', true);
  await execCommand(
    'docker volume rm $(docker volume ls -q -f dangling=true)',
    true
  );
};

const mongoEnv = (configs, plugin) => {
  const mongo = configs.mongo || {};
  const db_server_address = configs.db_server_address;

  let db_name = mongo.db_name || 'erxes';

  if (plugin && plugin.db_name) {
    db_name = plugin.db_name;
  }

  const mongo_url = `mongodb://${mongo.username}:${mongo.password}@${db_server_address}:27017/${db_name}?authSource=admin&replicaSet=rs0`;

  return mongo_url;
};

const healthcheck = {
  test: ['CMD', 'curl', '-i', 'http://localhost:80/health']
};

const deploy = {
  mode: 'replicated',
  replicas: 2,
  update_config: {
    order: 'start-first',
    failure_action: 'rollback',
    delay: '1s'
  }
};

const generatePluginBlock = (configs, plugin) => {
  const api_mongo_url = mongoEnv(configs, {});
  const mongo_url = plugin.mongo_url || mongoEnv(configs, plugin);
  const image_tag = plugin.image_tag || configs.image_tag || 'federation';
  const registry = plugin.registry ? `${plugin.registry}/` : '';

  const conf = {
    image: `${registry}erxes/plugin-${plugin.name}-api:${image_tag}`,
    environment: {
      SERVICE_NAME: plugin.name,
      PORT: plugin.port || 80,
      API_MONGO_URL: api_mongo_url,
      MONGO_URL: mongo_url,
      LOAD_BALANCER_ADDRESS: `http://plugin_${plugin.name}_api`,
      ...commonEnvs(configs),
      ...(plugin.extra_env || {})
    },
    volumes: ['./enabled-services.js:/data/enabled-services.js'],
    networks: ['erxes'],
    extra_hosts: [
      `mongo:${plugin.db_server_address ||
        configs.db_server_address ||
        '127.0.0.1'}`
    ]
  };

  if (plugin.replicas) {
    conf.deploy = {
      replicas: plugin.replicas
    };
  }

  return conf;
};

const syncUI = async ({ name, ui_location }) => {
  const configs = await fse.readJSON(filePath('configs.json'));

  const plName = `plugin-${name}-ui`;

  if (ui_location) {
    if (!(await fse.exists(filePath(`plugin-uis/${plName}`)))) {
      await execCommand(`mkdir plugin-uis/${plName}`);
    }

    log(`Downloading ${name} ui build.tar from ${ui_location}`);

    await execCurl(ui_location, `plugin-uis/${plName}/build.tar`);
  } else {
    log(`Downloading ${name} ui build.tar from s3`);

    let s3_location = '';

    if (!configs.image_tag) {
      s3_location = `s3://erxes-plugins/uis/${plName}`;
    } else {
      if (configs.image_tag === 'dev') {
        s3_location = `s3://erxes-dev-plugins/uis/${plName}`;
      } else {
        s3_location = `s3://erxes-release-plugins/uis/${plName}/${configs.image_tag}`;
      }
    }

    await execCommand(
      `aws s3 sync ${s3_location} plugin-uis/${plName} --no-sign-request --exclude "*" --include build.tar`
    );
  }

  log(`Extracting build ......`);
  await execCommand(
    `tar -xf plugin-uis/${plName}/build.tar --directory=plugin-uis/${plName}`
  );

  log(`Removing build.tar ......`);
  await execCommand(`rm plugin-uis/${plName}/build.tar`);
};

const deployDbs = async program => {
  await cleaning();

  const configs = await fse.readJSON(filePath('configs.json'));

  const dockerComposeConfig = {
    version: '3.3',
    networks: {
      erxes: {
        driver: 'overlay'
      }
    },
    services: {}
  };

  if (configs.kibana) {
    dockerComposeConfig.services.kibana = {
      image: 'docker.elastic.co/kibana/kibana:7.6.0',
      ports: ['5601:5601'],
      networks: ['erxes']
    };
  }

  if (configs.mongo) {
    if (!(await fse.exists(filePath('mongodata')))) {
      await execCommand('mkdir mongodata');
    }

    dockerComposeConfig.services.mongo = {
      hostname: 'mongo',
      image: 'mongo:4.0.20',
      ports: ['0.0.0.0:27017:27017'],
      environment: {
        MONGO_INITDB_ROOT_USERNAME: configs.mongo.username,
        MONGO_INITDB_ROOT_PASSWORD: configs.mongo.password
      },
      networks: ['erxes'],
      volumes: ['./mongodata:/data/db'],
      command: ['--replSet', 'rs0', '--bind_ip_all'],
      extra_hosts: ['mongo:127.0.0.1']
    };
  }

  if (configs.mongo.replication) {
    if (!(await fse.exists(filePath(`mongo-key`)))) {
      log('mongo-key file not found ....', 'red');

      return log(
        `Create this file using
          openssl rand -base64 756 > <path-to-keyfile>
          chmod 400 <path-to-keyfile>
          chmod 999:999 <path-to-keyfile>
      `,
        'red'
      );
    }

    dockerComposeConfig.services.mongo.volumes.push(
      './mongo-key:/etc/mongodb/keys/mongo-key'
    );
    dockerComposeConfig.services.mongo.command.push('--keyFile');
    dockerComposeConfig.services.mongo.command.push(
      '/etc/mongodb/keys/mongo-key'
    );
    dockerComposeConfig.services.mongo.extra_hosts = [
      `mongo:${configs.db_server_address}`,
      `mongo-secondary:${configs.secondary_server_address}`
    ];
  }

  if (configs.elasticsearch) {
    if (!(await fse.exists(filePath('elasticsearchData')))) {
      await execCommand('mkdir elasticsearchData');
    }

    dockerComposeConfig.services.elasticsearch = {
      image: 'docker.elastic.co/elasticsearch/elasticsearch:7.8.0',
      environment: {
        'discovery.type': 'single-node'
      },
      ports: ['9200:9200'],
      networks: ['erxes'],
      volumes: ['./elasticsearchData:/usr/share/elasticsearch/data'],
      ulimits: {
        memlock: {
          soft: -1,
          hard: -1
        }
      }
    };
  }

  if (configs.redis) {
    if (!(await fse.exists(filePath('redisdata')))) {
      await execCommand('mkdir redisdata');
    }

    dockerComposeConfig.services.redis = {
      image: 'redis:5.0.5',
      command: `redis-server --appendonly yes --requirepass ${configs.redis.password}`,
      ports: ['6379:6379'],
      networks: ['erxes'],
      volumes: ['./redisdata:/data']
    };
  }

  if (configs.rabbitmq) {
    if (!(await fse.exists(filePath('rabbitmq-data')))) {
      await execCommand('mkdir rabbitmq-data');
    }

    dockerComposeConfig.services.rabbitmq = {
      image: 'rabbitmq:3.7.17-management',
      hostname: 'rabbitmq',
      environment: {
        RABBITMQ_VM_MEMORY_HIGH_WATERMARK: '2048MiB',
        RABBITMQ_ERLANG_COOKIE: configs.rabbitmq.cookie,
        RABBITMQ_DEFAULT_USER: configs.rabbitmq.user,
        RABBITMQ_DEFAULT_PASS: configs.rabbitmq.pass,
        RABBITMQ_DEFAULT_VHOST: configs.rabbitmq.vhost
      },
      ports: ['5672:5672', '15672:15672'],
      networks: ['erxes'],
      volumes: ['./rabbitmq-data:/var/lib/rabbitmq']
    };
  }

  const yamlString = yaml.stringify(dockerComposeConfig);

  log('Generating docker-compose-dbs.yml ....');

  fs.writeFileSync(filePath('docker-compose-dbs.yml'), yamlString);

  log('Deploy ......');

  return execCommand(
    'docker stack deploy --compose-file docker-compose-dbs.yml erxes-dbs --with-registry-auth --resolve-image changed'
  );
};

const up = async ({ uis, fromInstaller }) => {
  await cleaning();

  const configs = await fse.readJSON(filePath('configs.json'));

  const image_tag = configs.image_tag || 'federation';
  const domain = configs.domain;
  const gateway_url = `${domain}/gateway`;
  const subscription_url = `wss://${gateway_url.replace(
    'https://',
    ''
  )}/graphql`;
  const widgets = configs.widgets || {};
  const dashboard = configs.dashboard;
  const widgets_domain = widgets.domain || `${domain}/widgets`;
  const dashboard_domain = `${domain}/dashboard/api`;
  const db_server_address = configs.db_server_address;

  const NGINX_HOST = domain.replace('https://', '');
  const extra_hosts = [`mongo:${db_server_address || '127.0.0.1'}`];
  const { RABBITMQ_HOST } = commonEnvs(configs);

  // update the directory on the Docker system to have 0777 or drwxrwxrwx permssion, so that all users have read/write/execute permission.
  // chmod 0777 core-api-uploads
  if (!(await fse.exists(filePath('core-api-uploads')))) {
    await execCommand('mkdir core-api-uploads');
  }

  const dockerComposeConfig = {
    version: '3.7',
    networks: {
      erxes: {
        driver: 'overlay'
      }
    },
    services: {
      coreui: {
        image: `erxes/erxes:${image_tag}`,
        environment: {
          REACT_APP_PUBLIC_PATH: '',
          REACT_APP_CDN_HOST: widgets_domain,
          REACT_APP_API_URL: gateway_url,
          REACT_APP_DASHBOARD_URL: dashboard_domain,
          REACT_APP_API_SUBSCRIPTION_URL: subscription_url,
          NGINX_HOST,
          NODE_ENV: 'production',
          REACT_APP_FILE_UPLOAD_MAX_SIZE: 524288000,
          ...((configs.coreui || {}).extra_env || {})
        },
        ports: ['3000:80'],
        volumes: [
          './plugins.js:/usr/share/nginx/html/js/plugins.js',
          './plugin-uis:/usr/share/nginx/html/js/plugins'
        ],
        deploy,
        networks: ['erxes']
      },
      plugin_core_api: {
        image: `erxes/core:${image_tag}`,
        environment: {
          SERVICE_NAME: 'core-api',
          PORT: '80',
          CLIENT_PORTAL_DOMAINS: configs.client_portal_domains || '',
          JWT_TOKEN_SECRET: configs.jwt_token_secret,
          LOAD_BALANCER_ADDRESS: 'http://plugin_core_api',
          MONGO_URL: mongoEnv(configs),
          EMAIL_VERIFIER_ENDPOINT:
            configs.email_verifier_endpoint ||
            'https://email-verifier.erxes.io',
          ENABLED_SERVICES_PATH: '/data/enabled-services.js',
          ...commonEnvs(configs),
          ...((configs.core || {}).extra_env || {})
        },
        extra_hosts,
        volumes: [
          './enabled-services.js:/data/enabled-services.js',
          './permissions.json:/core-api/permissions.json',
          './core-api-uploads:/core-api/dist/core/src/private/uploads'
        ],
        networks: ['erxes']
      },
      gateway: {
        image: `erxes/gateway:${image_tag}`,
        environment: {
          SERVICE_NAME: 'gateway',
          PORT: '80',
          LOAD_BALANCER_ADDRESS: 'http://gateway',
          JWT_TOKEN_SECRET: configs.jwt_token_secret,
          CLIENT_PORTAL_DOMAINS: configs.client_portal_domains || '',
          MONGO_URL: mongoEnv(configs),
          ...commonEnvs(configs),
          ...((configs.gateway || {}).extra_env || {})
        },
        volumes: ['./enabled-services.js:/data/enabled-services.js'],
        healthcheck,
        deploy,
        extra_hosts,
        ports: ['3300:80'],
        networks: ['erxes']
      },
      crons: {
        image: `erxes/crons:${image_tag}`,
        environment: {
          MONGO_URL: mongoEnv(configs),
          ...commonEnvs(configs)
        },
        volumes: ['./enabled-services.js:/data/enabled-services.js'],
        networks: ['erxes']
      },
      plugin_workers_api: {
        image: `erxes/workers:${image_tag}`,
        environment: {
          SERVICE_NAME: 'workers',
          PORT: '80',
          JWT_TOKEN_SECRET: configs.jwt_token_secret,
          LOAD_BALANCER_ADDRESS: 'http://plugin_workers_api',
          MONGO_URL: mongoEnv(configs),
          ...commonEnvs(configs),
          ...((configs.workers || {}).extra_env || {})
        },
        volumes: ['./enabled-services.js:/data/enabled-services.js'],
        extra_hosts,
        networks: ['erxes']
      },
      essyncer: {
        image: `erxes/essyncer:${image_tag}`,
        environment: {
          ELASTICSEARCH_URL: `http://${configs.db_server_address}:9200`,
          MONGO_URL: mongoEnv(configs)
        },
        volumes: ['./essyncerData:/data/essyncerData'],
        extra_hosts,
        networks: ['erxes']
      }
    }
  };

  if (configs.widgets) {
    dockerComposeConfig.services.widgets = {
      image: `erxes/widgets:${image_tag}`,
      environment: {
        PORT: '3200',
        ROOT_URL: widgets_domain,
        API_URL: gateway_url,
        API_SUBSCRIPTIONS_URL: subscription_url
      },
      ports: ['3200:3200'],
      networks: ['erxes']
    };
  }

  if (dashboard) {
    dockerComposeConfig.services.dashboard = {
      image: `erxes/dashboard:${image_tag}`,
      ports: ['4300:80'],
      environment: {
        PORT: '80',
        CUBEJS_DB_TYPE: 'mongobi',
        CUBEJS_DB_HOST: `${dashboard.dashboard_db_host || 'mongosqld'}`,
        CUBEJS_DB_PORT: `${dashboard.dashboard_db_port || '3307'}`,

        CUBEJS_URL: dashboard_domain,
        CUBEJS_TOKEN: dashboard.api_token,
        CUBEJS_API_SECRET: dashboard.api_secret,
        REDIS_URL: `redis://${db_server_address || 'redis'}:6379`,
        REDIS_PASSWORD: configs.redis.password || '',
        ...(dashboard.extra_env || {})
      },
      volumes: ['./enabled-services.js:/data/enabled-services.js'],
      extra_hosts,
      networks: ['erxes']
    };
  }

  if (configs.installer) {
    await fse.copy(`${__dirname}/../../installer`, filePath('installer'));

    await execCommand(`cd installer && npm install`);

    if (!fromInstaller) {
      await execCommand(`cd installer && npm run pm2 delete all`, true);
      await execCommand(
        `cd installer && RABBITMQ_HOST=${RABBITMQ_HOST} npm run pm2 start index.js`
      );
    }
  }

  let pluginsMapLocation =
    'https://erxes-plugins.s3.us-west-2.amazonaws.com/pluginsMap.js';

  if (configs.image_tag) {
    if (configs.image_tag === 'dev') {
      pluginsMapLocation =
        'https://erxes-dev-plugins.s3.us-west-2.amazonaws.com/pluginsMap.js';
    } else {
      pluginsMapLocation = `https://erxes-release-plugins.s3.us-west-2.amazonaws.com/${image_tag}/pluginsMap.js`;
    }
  }

  log(`Downloading pluginsMap.js from ${pluginsMapLocation} ....`);
  await execCurl(pluginsMapLocation, 'pluginsMap.js');

  const pluginsMap = require(filePath('pluginsMap.js'));

  if (configs.private_plugins_map) {
    log('Downloading private plugins map ....');

    await execCurl(configs.private_plugins_map, 'privatePluginsMap.js');

    log('Merging plugin maps ....');

    const privatePluginsMap = require(filePath('privatePluginsMap.js'));

    for (const key of Object.keys(privatePluginsMap)) {
      pluginsMap[key] = privatePluginsMap[key];
    }
  }

  const enabledPlugins = ["'workers'"];
  const uiPlugins = [];
  const essyncerJSON = {
    plugins: [
      {
        db_name: configs.mongo.db_name || 'erxes',
        collections: [
          {
            name: 'users',
            schema: '{}',
            script: ''
          },
          {
            name: 'conformities',
            schema: ` 
            {
              "mainType": {
                "type": "keyword"
              },
              "mainTypeId": {
                "type": "keyword"
              },
              "relType": {
                "type": "keyword"
              },
              "relTypeId": {
                "type": "keyword"
              }
            }
          `,
            script: ''
          }
        ]
      }
    ]
  };

  const permissionsJSON = [];

  for (const plugin of configs.plugins || []) {
    dockerComposeConfig.services[
      `plugin_${plugin.name}_api`
    ] = generatePluginBlock(configs, plugin);

    enabledPlugins.push(`'${plugin.name}'`);

    if (pluginsMap[plugin.name]) {
      const uiConfig = pluginsMap[plugin.name].ui;

      if (uiConfig) {
        uiPlugins.push(
          JSON.stringify({
            name: plugin.name,
            ...pluginsMap[plugin.name].ui
          })
        );
      }

      const apiConfig = pluginsMap[plugin.name].api;

      if (apiConfig) {
        if (apiConfig.essyncer) {
          essyncerJSON.plugins.push({
            db_name: configs.mongo.db_name || 'erxes',
            collections: apiConfig.essyncer
          });
        }

        if (apiConfig.permissions) {
          permissionsJSON.push(apiConfig.permissions);
        }
      }
    }
  }

  if (!(await fse.exists(filePath('plugin-uis')))) {
    await execCommand('mkdir plugin-uis', true);
  }

  if (uis) {
    for (const plugin of configs.plugins || []) {
      if (pluginsMap[plugin.name] && pluginsMap[plugin.name].ui) {
        await syncUI(plugin);
      }
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
    module.exports = [
      ${enabledPlugins.join(',')}
    ]
  `
  );

  const extraServices = configs.extra_services || {};

  for (const serviceName of Object.keys(extraServices)) {
    const service = extraServices[serviceName];

    dockerComposeConfig.services[serviceName] = {
      ...service,
      networks: ['erxes']
    };
  }

  const yamlString = yaml.stringify(dockerComposeConfig);

  log('Generating permissions json ....');
  await fse.writeJSON(filePath('permissions.json'), permissionsJSON);

  // essyncer
  if (!(await fse.exists(filePath('essyncerData')))) {
    await execCommand('mkdir essyncerData', true);
  }

  log('Generating essyncer json ....');
  await fse.writeJSON(filePath('essyncerData/plugins.json'), essyncerJSON);

  log('Generating docker-compose.yml ....');

  fs.writeFileSync(filePath('docker-compose.yml'), yamlString);

  log('Generating nginx.conf ....');

  const commonParams = `
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
  `;

  const commonConfig = `
    proxy_set_header Upgrade $http_upgrade;
    ${commonParams}
  `;

  await fs.promises.writeFile(
    filePath('nginx.conf'),
    `
    server {
            listen 80;
            server_name ${NGINX_HOST};

            index index.html;
            error_log /var/log/nginx/erxes.error.log;
            access_log /var/log/nginx/erxes.access.log;
            location / {
                    proxy_pass http://127.0.0.1:3000/;
                    ${commonParams}
            }
            location /widgets/ {
                    proxy_pass http://127.0.0.1:3200/;
                    ${commonConfig}
            }
            location /gateway/ {
                    proxy_pass http://127.0.0.1:3300/;
                    ${commonConfig}
            }

            location /dashboard/api {
                proxy_pass http://127.0.0.1:4300/;
                ${commonConfig}
            }
    }
  `
  );

  log('Deploy ......');

  return execCommand(
    'docker stack deploy --compose-file docker-compose.yml erxes --with-registry-auth --resolve-image changed'
  );
};

const update = async ({ serviceNames, noimage, uis }) => {
  await cleaning();

  const configs = await fse.readJSON(filePath('configs.json'));
  const image_tag = configs.image_tag || 'federation';

  for (const name of serviceNames.split(',')) {
    const pluginConfig = (configs.plugins || []).find(p => p.name === name);

    if (!noimage) {
      log(`Updating image ${name}......`);

      if (['crons', 'dashboard', 'gateway', 'client-portal'].includes(name)) {
        await execCommand(
          `docker service update erxes_${name} --image erxes/${name}:${image_tag}`
        );
        continue;
      }

      if (name === 'coreui') {
        await execCommand(
          `docker service update erxes_coreui --image erxes/erxes:federation`
        );
        continue;
      }

      if (name === 'widgets') {
        await execCommand(
          `docker service update erxes_widgets --image erxes/widgets:federation`
        );
        continue;
      }

      if (name === 'core') {
        await execCommand(
          `docker service update erxes_plugin_core_api --image erxes/core:${image_tag}`
        );
        continue;
      }

      if (name === 'workers') {
        await execCommand(
          `docker service update erxes_plugin_workers_api --image erxes/workers:${image_tag}`
        );
        continue;
      }

      if (pluginConfig) {
        const tag = pluginConfig.image_tag || configs.image_tag || 'federation';
        const registry = pluginConfig.registry
          ? `${pluginConfig.registry}/`
          : '';

        await execCommand(
          `docker service update erxes_plugin_${name}_api --image ${registry}erxes/plugin-${name}-api:${tag} --with-registry-auth`
        );
      } else {
        console.error('No plugin found');
      }
    }

    if (pluginConfig) {
      if (uis) {
        await execCommand(`rm -rf plugin-uis/${`plugin-${name}-ui`}`, true);
        await syncUI(pluginConfig);
      }
    } else {
      console.error('No plugin found');
    }
  }

  if (uis) {
    log('Restart core ui ....');
    await execCommand(`docker service update --force erxes_coreui`);
  }

  log('Updating gateway ....');
  await execCommand(`docker service update --force erxes_gateway`);
};

const restart = async name => {
  await cleaning();

  log(`Restarting .... ${name}`);

  if (['gateway', 'coreui', 'crons'].includes(name)) {
    await execCommand(`docker service update --force erxes_${name}`);
    return;
  }

  await execCommand(`docker service update --force erxes_plugin_${name}_api`);
};

module.exports.manageInstallation = async program => {
  const type = process.argv[3];
  const name = process.argv[4];

  const configs = await fse.readJSON(filePath('configs.json'));

  if (type === 'install') {
    const prevEntry = configs.plugins.find(p => p.name === name);

    if (!prevEntry) {
      configs.plugins.push({ name: name });
    }
  }

  if (type === 'uninstall') {
    configs.plugins = configs.plugins.filter(p => p.name !== name);
  }

  log('Updating configs.json ....');

  await fse.writeJSON(filePath('configs.json'), configs);

  if (type === 'install') {
    log('Running up ....');
    await up({ fromInstaller: true });

    log('Syncing ui ....');

    await syncUI({ name });

    await restart('coreui');

    log('Waiting for 30 seconds ....');
    await sleep(30000);
    await restart('gateway');
  }

  if (type === 'uninstall') {
    log('Running up ....');
    await up({ fromInstaller: true });

    log(`Removing ${name} service ....`);
    await execCommand(`docker service rm erxes_plugin_${name}_api`, true);

    await restart('coreui');
    await restart('gateway');
  }

  if (type === 'update') {
    log('Update ....');
    await update({ serviceNames: name, uis: true });
  }
};

module.exports.up = program => {
  return up({ uis: program.uis });
};

const dumpDb = async program => {
  if (process.argv.length < 4) {
    return console.log('Pass db name !!!');
  }

  const dbName = process.argv[3];

  const configs = await fse.readJSON(filePath('configs.json'));

  await execCommand(
    `docker ps --format "{{.Names}}" | grep mongo > docker-mongo-name.txt`
  );
  const dockerMongoName = fs
    .readFileSync('docker-mongo-name.txt')
    .toString()
    .replace('\n', '');

  log('Running mongodump ....');
  await execCommand(
    `docker exec ${dockerMongoName} mongodump -u ${configs.mongo.username} -p ${configs.mongo.password} --authenticationDatabase admin --db ${dbName}`
  );

  if (program.copydump) {
    log('Copying dump ....');
    await execCommand(`docker cp ${dockerMongoName}:/dump .`);

    log('Compressing dump ....');
    await execCommand(`tar -cf dump.tar dump`);

    log('Removing dump from container ....');
    await execCommand(`docker exec ${dockerMongoName} rm -rf dump`);

    log('Removing uncompressed dump folder ....');
    await execCommand(`rm -rf dump`);
  }
};

const deployMongoBi = async program => {
  let configs = {};

  try {
    configs = await fse.readJSON(filePath('dashboard-configs.json'));
  } catch (e) {
    return log('dashboard-configs.json file not found');
  }

  log(`
    Do not forget to add following lines in dashboard.extra_envs section of the configs.json in app server

    CUBEJS_DB_SSL: "true",
    CUBEJS_DB_SSL_REJECT_UNAUTHORIZED: "false",
    CUBEJS_DB_USER: "${configs.mongo_username}",
    CUBEJS_DB_PASS: "${configs.mongo_password}"
  `);

  if (!(await fse.exists(filePath(`mongo.pem`)))) {
    log('mongo.pem file not found. creating new one ....');
    await execCommand(
      'openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out certificate.pem --batch'
    );
    await execCommand('cat key.pem certificate.pem > mongo.pem');
  }

  if (!(await fse.exists(filePath(`mongo-key`)))) {
    log('mongo-key file not found ....', 'red');

    return log(
      `Create this file using
        openssl rand -base64 756 > <path-to-keyfile>
        chmod 400 <path-to-keyfile>
        chmod 999:999 <path-to-keyfile>
        on primary mongo server then it here
    `,
      'red'
    );
  }

  const dockerComposeConfig = {
    version: '2.1',
    networks: {
      erxes: {
        driver: 'bridge'
      }
    },
    services: {}
  };

  dockerComposeConfig.services.mongo = {
    hostname: 'mongo-secondary',
    image: 'mongo:4.0.20',
    ports: ['0.0.0.0:27017:27017'],
    environment: {
      MONGO_INITDB_ROOT_USERNAME: configs.mongo_username,
      MONGO_INITDB_ROOT_PASSWORD: configs.mongo_password
    },
    networks: ['erxes'],
    volumes: [
      './mongodata:/data/db',
      './mongo-key:/etc/mongodb/keys/mongo-key'
    ],
    command: [
      '--replSet',
      'rs0',
      '--bind_ip_all',
      '--keyFile',
      '/etc/mongodb/keys/mongo-key'
    ],
    extra_hosts: [
      `mongo:${configs.primary_server_ip}`,
      `mongo-secondary: ${configs.server_ip}`
    ]
  };

  dockerComposeConfig.services['mongo-bi-connector'] = {
    image: 'erxes/mongobi-connector:dev',
    container_name: 'mongosqld',
    ports: ['3307:3307'],
    environment: {
      MONGODB_HOST: 'mongo-secondary',
      MONGO_USERNAME: configs.mongo_username,
      MONGO_PASSWORD: configs.mongo_password
    },
    networks: ['erxes'],
    volumes: ['./mongo.pem:/mongosqld/mongo.pem']
  };

  const yamlString = yaml.stringify(dockerComposeConfig);

  log('Generating docker-compose.yml ....');
  fs.writeFileSync(filePath('docker-compose.yml'), yamlString);

  log('Deploy ......');
  await execCommand(`docker-compose up -d`);
};

module.exports.deployDbs = deployDbs;
module.exports.dumpDb = dumpDb;
module.exports.deployMongoBi = deployMongoBi;

module.exports.update = program => {
  if (process.argv.length < 4) {
    return console.log('Pass service names !!!');
  }

  const serviceNames = process.argv[3];

  return update({ serviceNames, noimage: program.noimage, uis: program.uis });
};

module.exports.restart = () => {
  const name = process.argv[3];
  return restart(name);
};
