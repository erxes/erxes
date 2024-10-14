const fse = require('fs-extra');
const { filePath, log, sleep } = require('./utils');
const { execSync } = require('child_process');
const net = require('net');

// Function to check if a service is listening on a given port
const waitForService = (port, host = '127.0.0.1', timeout = 60000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const socket = net.createConnection({ port, host });

      socket.on('connect', () => {
        clearInterval(interval);
        socket.end();
        resolve();
      });

      socket.on('error', () => {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > timeout) {
          clearInterval(interval);
          reject(new Error(`Service not available on port ${port}`));
        }
      });
    }, 2000); // Check every 2 seconds
  });
};


module.exports.devOnly = async () => {
  const name = process.argv[3];
  execSync(`pm2 start ecosystem.config.js --only ${name}`);
};

module.exports.devStop = async () => {
  execSync('pm2 delete all');
};

module.exports.devCmd = async program => {
  const configs = await fse.readJSON(filePath('configs.json'));
  const be_env = configs.be_env || {};
  const commonOptions = program.bash ? { interpreter: '/bin/bash' } : {};

  const enabledServices = [];

  for (const plugin of configs.plugins) {
    enabledServices.push(plugin.name);
  }

  if (configs.workers) {
    enabledServices.push('workers');
  }

  const enabledServicesJson = JSON.stringify(enabledServices);

  const commonEnv = {
    DEBUG: '*error*',
    NODE_ENV: 'development',
    JWT_TOKEN_SECRET: configs.jwt_token_secret,
    MONGO_URL: 'mongodb://127.0.0.1:27017/erxes?directConnection=true',

    REDIS_HOST: '127.0.0.1',
    REDIS_PORT: 6379,
    REDIS_PASSWORD: configs.redis.password,
    RABBITMQ_HOST: 'amqp://127.0.0.1',
    ELASTICSEARCH_URL: 'http://127.0.0.1:9200',
    ENABLED_SERVICES_JSON: enabledServicesJson,
    RELEASE: configs.image_tag || 'latest',
    VERSION: configs.version || 'os',
    ALLOWED_ORIGINS: configs.allowed_origins,
    NODE_INSPECTOR: 'enabled',
    CORE_MONGO_URL: 'mongodb://127.0.0.1:27017/erxes_core?directConnection=true',
    ...be_env,
  };

  let port = 3300;

  const apps = [
    {
      name: 'coreui',
      cwd: filePath('../packages/core-ui/'),
      script: 'yarn',
      args: 'start',
      ...commonOptions,
      ignore_watch: ['node_modules'],
    },
    {
      name: 'core',
      cwd: filePath('../packages/core/'),
      script: 'yarn',
      args: 'dev',
      ...commonOptions,
      ignore_watch: ['node_modules'],
      env: {
        PORT: (configs.core || {}).port || port,
        CLIENT_PORTAL_DOMAINS: configs.client_portal_domains || '',
        ...commonEnv,
        ...((configs.core || {}).extra_env || {}),
        OTEL_SERVICE_NAME: 'plugin-core-api',
      },
    },
  ];

  if (configs.version && configs.version === 'saas') {
    log('Written ui coreui .env file ....');
    await fse.writeFile(
      filePath('../packages/core-ui/.env'),
      `
        PORT=3000
        NODE_ENV="development"  
        REACT_APP_PUBLIC_PATH=""
        REACT_APP_CDN_HOST="http://localhost:3200"
        REACT_APP_API_URL="http://localhost:4000"
        REACT_APP_DASHBOARD_URL="http://localhost:4300"
        REACT_APP_API_SUBSCRIPTION_URL="ws://localhost:4000/graphql"
        REACT_APP_DOMAIN_FORMAT="http://<subdomain>.api.erxes.com"
        REACT_APP_VERSION="saas"
      `
    );

    log(
      `
  Generated erxes-nginx.conf file. Please copy to following location
  
      1. For mac (/usr/local/etc/nginx/servers)
      2. For mac m1 (/opt/homebrew/etc/nginx/servers)
      3. For ubuntu (/etc/nginx/conf.d)
    `,
      'yellow'
    );

    await fse.writeFile(
      filePath('erxes-nginx.conf'),
      `
        server {
          listen 80;
          server_name *.app.erxes.com;
          location / {
              proxy_pass http://127.0.0.1:3000/;
          }
         }
  
        server {
          listen 80;
          server_name *.widgets.erxes.com;
          location / {
              proxy_pass http://127.0.0.1:3200/;
              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection 'upgrade';
              proxy_set_header Host $host;
              proxy_set_header Host $http_host;
              proxy_set_header X-Real-IP $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              proxy_http_version 1.1;
          }
         }
  
        server {
          listen 80;
          server_name *.api.erxes.com;
          location / {
              proxy_pass http://127.0.0.1:4000/;
              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection 'upgrade';
              proxy_set_header Host $host;
              proxy_set_header Host $http_host;
              proxy_set_header X-Real-IP $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              proxy_http_version 1.1;
          }
         }
      `
    );

    log(
      `Add following lines to /etc/hosts
  
      127.0.0.1 client1.app.erxes.com
      127.0.0.1 client1.api.erxes.com
      127.0.0.1 client1.widgets.erxes.com
  
      127.0.0.1 client2.app.erxes.com
      127.0.0.1 client2.api.erxes.com
      127.0.0.1 client2.widgets.erxes.com
      `,
      'yellow'
    );
  } else {
    log('Written ui coreui .env file ....');
    await fse.writeFile(
      filePath('../packages/core-ui/.env'),
      `
        PORT=3000
        NODE_ENV="development"  
        REACT_APP_PUBLIC_PATH=""
        REACT_APP_CDN_HOST="http://localhost:3200"
        REACT_APP_API_URL="http://localhost:4000"
        REACT_APP_DASHBOARD_URL="http://localhost:4300"
        REACT_APP_API_SUBSCRIPTION_URL="ws://localhost:4000/graphql"
        REACT_APP_DOMAIN_FORMAT="http://<subdomain>.api.erxes.com"
        REACT_APP_VERSION="os"
      `
    );
  }

  if (configs.widgets) {
    if (program.deps) {
      log('Installing dependencies in widgets .........');
      execSync(`cd ${filePath(`../widgets`)} && yarn install`);
    }

    await fse.writeFile(
      filePath('../widgets/.env'),
      `
        PORT=3200
        ROOT_URL="http://localhost:3200"
        API_URL="http://localhost:4000"
        API_SUBSCRIPTIONS_URL="ws://localhost:4000/graphql"
      `
    );

    apps.push({
      name: 'widgets',
      cwd: filePath(`../widgets`),
      script: 'yarn',
      args: 'dev',
      ...commonOptions,
      ignore_watch: ['node_modules'],
      env: {
        ...be_env,
        OTEL_SERVICE_NAME: 'widgets',
      },
    });
  }

  const uiPlugins = [];

  for (const plugin of configs.plugins) {
    port++;

    if (plugin.ui) {
      if (program.deps && plugin.ui === 'local') {
        log(`Installing dependencies in ${plugin.name} .........`);
        execSync(
          `cd ${filePath(
            `../packages/plugin-${plugin.name}-ui`
          )} && yarn install`
        );
      }

      const uiConfigs = require(
        filePath(`../packages/plugin-${plugin.name}-ui/src/configs.js`)
      );

      if (plugin.ui === 'remote') {
        if (uiConfigs.url) {
          uiConfigs.url = (configs.ui_remote_url || '').replace(
            '<name>',
            plugin.name
          );
        }

        if (uiConfigs.routes) {
          uiConfigs.routes.url = (configs.ui_remote_url || '').replace(
            '<name>',
            plugin.name
          );
        }

        if (uiConfigs.innerWidget) {
          uiConfigs.innerWidget.url = (configs.ui_remote_url || '').replace(
            '<name>',
            plugin.name
          );
        }
      }

      uiPlugins.push(uiConfigs);

      if (plugin.ui === 'local') {
        apps.push({
          name: `${plugin.name}-ui`,
          cwd: filePath(`../packages/plugin-${plugin.name}-ui`),
          script: 'yarn',
          args: 'start',
          ...commonOptions,
          ignore_watch: ['node_modules'],
        });
      }
    }

    apps.push({
      name: `${plugin.name}-api`,
      cwd: filePath(`../packages/plugin-${plugin.name}-api`),
      script: 'yarn',
      args: 'dev',
      ...commonOptions,
      ignore_watch: ['node_modules'],
      env: {
        PORT: plugin.port || port,
        ...commonEnv,
        ...(plugin.extra_env || {}),
        OTEL_SERVICE_NAME: `plugin-${plugin.name}-api`,
      },
    });
  }

  if (configs.workers) {
    apps.push({
      name: 'workers',
      cwd: filePath(`../packages/workers`),
      script: 'yarn',
      args: 'dev',
      ...commonOptions,
      ignore_watch: ['node_modules'],
      env: {
        PORT: 3700,
        ...commonEnv,
        ...((configs.workers || {}).envs || {}),
        OTEL_SERVICE_NAME: 'workers',
      },
    });
  }

  if (configs.dashboard) {
    execSync(`cd ${filePath(`../packages/dashboard`)} && yarn install`);

    apps.push({
      name: 'dashboard',
      cwd: filePath(`../packages/dashboard`),
      script: 'yarn',
      args: 'dev',
      ...commonOptions,
      ignore_watch: ['node_modules'],
      env: {
        PORT: 4300,
        ...commonEnv,
        ...((configs.dashboard || {}).envs || {}),
        OTEL_SERVICE_NAME: 'dashboard',
      },
    });
  }

  apps.push({
    name: 'gateway',
    cwd: filePath(`../packages/gateway`),
    script: 'yarn',
    args: 'dev',
    ...commonOptions,
    ignore_watch: ['node_modules'],
    env: {
      PORT: 4000,
      CLIENT_PORTAL_DOMAINS: configs.client_portal_domains || '',
      ...commonEnv,
      ...((configs.gateway || {}).extra_env || {}),
      OTEL_SERVICE_NAME: 'gateway',
    },
  });

  // replace ui plugins.js
  await fse.writeFile(
    filePath('ecosystem.config.js'),
    `
      module.exports = {
        apps: ${JSON.stringify(apps, null, 2)}
      }
    `
  );

  log('Written ui plugins.js file ....');

  await fse.writeFile(
    filePath('../packages/core-ui/public/js/plugins.js'),
    `
      window.plugins = ${JSON.stringify(uiPlugins)}
    `
  );

  if (!program.ignoreRun) {
    if (program.deps) {
      log(`Installing dependencies in core-ui .........`);

      execSync(`cd ${filePath(`../packages/core-ui`)} && yarn install`);
    }

    const intervalMs = Number(program.interval) || 0;

    if (!program.ignoreCore) {
      log('starting core ....');
      execSync('pm2 start ecosystem.config.js --only core');
      try {
        log(`Waiting for core service to start on port 3300...`);
        await waitForService(3300);
        log('Core service started successfully.');
      } catch (error) {
        log(`Failed to start core service: ${error.message}`, 'red');
        return;
      }
      await sleep(intervalMs);
    }

    for (const plugin of configs.plugins) {
      log(`starting ${plugin.name} ....`);
      execSync(`pm2 start ecosystem.config.js --only ${plugin.name}-api`);
      await sleep(intervalMs);

      if (plugin.ui === 'local') {
        execSync(`pm2 start ecosystem.config.js --only ${plugin.name}-ui`);
        await sleep(intervalMs);
      }
    }

    if (configs.workers) {
      log('starting workers ....');
      execSync('pm2 start ecosystem.config.js --only workers');
      await sleep(intervalMs);
    }

    if (configs.dashboard) {
      log('starting workers ....');
      execSync('pm2 start ecosystem.config.js --only dashboard');
      await sleep(intervalMs);
    }

    /* Plugin addresses are not getting updated fast enough after enabling more plugins and restarting. 
         Thus resulting in overlapped addresses */
    await sleep(5000 - intervalMs);
    log(`starting gateway ....`);
    execSync(`pm2 start ecosystem.config.js --only gateway`);
    await sleep(intervalMs);

    if (!program.ignoreCoreUI) {
      log('starting coreui ....');
      execSync('pm2 start ecosystem.config.js --only coreui');

      if (configs.widgets) {
        log('starting widgets ....');
        execSync('pm2 start ecosystem.config.js --only widgets');
      }
    }
  }
};
