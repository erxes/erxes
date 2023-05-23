const fse = require('fs-extra');
const os = require('os');
const { execCommand, filePath, log, sleep } = require('./utils');

module.exports.devOnly = async () => {
  const name = process.argv[3];
  await execCommand(`pm2 start ecosystem.config.js --only ${name}`);
};

module.exports.devStop = async () => {
  await execCommand('pm2 delete all');
};

module.exports.devCmd = async program => {
  const configs = await fse.readJSON(filePath('configs.json'));

  const commonOptions = program.bash ? { interpreter: '/bin/bash' } : {};

  const enabledServices = [];

  for (const plugin of configs.plugins) {
    enabledServices.push(`'${plugin.name}'`);
  }

  if (configs.workers) {
    enabledServices.push("'workers'");
  }

  await fse.writeFile(
    filePath('enabled-services.js'),
    `
      module.exports = [
        ${enabledServices.join(',')}
      ]
    `
  );

  const commonEnv = {
    DEBUG: 'erxes*',
    NODE_ENV: 'development',
    JWT_TOKEN_SECRET: configs.jwt_token_secret,
    MONGO_URL: 'mongodb://localhost/erxes',

    REDIS_HOST: 'localhost',
    REDIS_PORT: 6379,
    REDIS_PASSWORD: configs.redis.password,
    RABBITMQ_HOST: 'amqp://localhost',
    ELASTICSEARCH_URL: 'http://localhost:9200',
    ENABLED_SERVICES_PATH: filePath('enabled-services.js'),
    ALLOWED_ORIGINS: configs.allowed_origins
  };

  let port = 3300;

  const apps = [
    {
      name: 'coreui',
      cwd: filePath('../packages/core-ui/'),
      script: 'yarn',
      args: 'start',
      ...commonOptions,
      ignore_watch: ['node_modules']
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
        ...((configs.core || {}).extra_env || {})
      }
    }
  ];

  log('Generated ui coreui .env file ....');
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
    `
  );

  await execCommand(
    `cd ${filePath(`../packages/core-ui`)} && yarn generate-doterxes`
  );

  if (configs.widgets) {
    if (program.deps) {
      log('Installing dependencies in widgets .........');
      await execCommand(`cd ${filePath(`../widgets`)} && yarn install`);
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
      ignore_watch: ['node_modules']
    });
  }

  const uiPlugins = [];

  for (const plugin of configs.plugins) {
    port++;

    if (plugin.ui) {
      if (program.deps && plugin.ui === 'local') {
        log(`Installing dependencies in ${plugin.name} .........`);
        await execCommand(
          `cd ${filePath(
            `../packages/plugin-${plugin.name}-ui`
          )} && yarn install-deps`
        );
      }

      const uiConfigs = require(filePath(
        `../packages/plugin-${plugin.name}-ui/src/configs.js`
      ));

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
      }

      uiPlugins.push(uiConfigs);

      if (plugin.ui === 'local') {
        apps.push({
          name: `${plugin.name}-ui`,
          cwd: filePath(`../packages/plugin-${plugin.name}-ui`),
          script: 'yarn',
          args: 'start',
          ...commonOptions,
          ignore_watch: ['node_modules']
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
        ...(plugin.extra_env || {})
      }
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
        ...((configs.workers || {}).envs || {})
      }
    });
  }

  if (configs.dashboard) {
    await execCommand(
      `cd ${filePath(`../packages/dashboard`)} && yarn install`
    );

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
        ...((configs.dashboard || {}).envs || {})
      }
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
      ...((configs.gateway || {}).envs || {})
    }
  });

  // replace ui plugins.js
  await fse.writeFile(
    filePath('ecosystem.config.js'),
    `
      module.exports = {
        apps: ${JSON.stringify(apps)}
      }
    `
  );

  log('Generated ui plugins.js file ....');

  await fse.writeFile(
    filePath('../packages/core-ui/public/js/plugins.js'),
    `
      window.plugins = ${JSON.stringify(uiPlugins)}
    `
  );

  if (!program.ignoreRun) {
    if (program.deps) {
      log(`Installing dependencies in core-ui .........`);

      await execCommand(
        `cd ${filePath(`../packages/core-ui`)} && yarn install`
      );
    }

    const intervalMs = Number(program.interval);

    // start everything
    if (!intervalMs) {
      await execCommand('pm2 start ecosystem.config.js');
      return;
    }

    // or start things one by one with an interval
    if (!program.ignoreCore) {
      log('starting core ....');
      await execCommand('pm2 start ecosystem.config.js --only core');
      await sleep(intervalMs);
    }

    for (const plugin of configs.plugins) {
      log(`starting ${plugin.name} ....`);
      await execCommand(
        `pm2 start ecosystem.config.js --only ${plugin.name}-api`
      );
      await sleep(intervalMs);

      if (plugin.ui === 'local') {
        await execCommand(
          `pm2 start ecosystem.config.js --only ${plugin.name}-ui`
        );
        await sleep(intervalMs);
      }
    }

    if (configs.workers) {
      log('starting workers ....');
      await execCommand('pm2 start ecosystem.config.js --only workers');
      await sleep(intervalMs);
    }

    if (configs.dashboard) {
      log('starting workers ....');
      await execCommand('pm2 start ecosystem.config.js --only dashboard');
      await sleep(intervalMs);
    }

    log(`starting gateway ....`);
    await execCommand(`pm2 start ecosystem.config.js --only gateway`);
    await sleep(intervalMs);

    if (!program.ignoreCoreUI) {
      log('starting coreui ....');
      await execCommand('pm2 start ecosystem.config.js --only coreui');

      if (configs.widgets) {
        log('starting widgets ....');
        await execCommand('pm2 start ecosystem.config.js --only widgets');
      }
    }
  }
};
