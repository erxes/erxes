const fse = require("fs-extra");
const os = require("os");
const { execCommand, filePath, log, sleep } = require("./utils");

const osType = os.type();
const commonOptions = osType === 'Darwin' ? {} : { interpreter: '/bin/bash' };

module.exports.devOnly = async () => {
  const name = process.argv[3];
  await execCommand(`pm2 start ecosystem.config.js --only ${name}`);
};

module.exports.devStop = async () => {
  await execCommand('pm2 delete all');
}

module.exports.devCmd = async (program) => {
  await execCommand('pm2 delete all', true);

  const configs = await fse.readJSON(filePath("configs.json"));

  const enabledServices = [];

  for (const plugin of configs.plugins) {
    enabledServices.push(`'${plugin.name}'`);
  }

  await fse.writeFile(
    filePath("enabled-services.js"),
    `
      module.exports = [
        ${enabledServices.join(",")}
      ]
    `
  );

  const commonEnv = {
    NODE_ENV: "development",
    JWT_TOKEN_SECRET: "token",
    MONGO_URL: "mongodb://localhost/erxes",

    REDIS_HOST: "localhost",
    REDIS_PORT: 6379,
    REDIS_PASSWORD: configs.redis.password,
    RABBITMQ_HOST: "amqp://localhost",
    ELASTICSEARCH_URL: "http://localhost:9200",
    ENABLED_SERVICES_PATH: filePath('enabled-services.js')
  };

  let port = 3300;

  const apps = [
    {
      name: "coreui",
      cwd: filePath("../packages/core-ui/"),
      script: "yarn",
      args: "start",
      ...commonOptions,
      ignore_watch: ["node_modules"],
    },
    {
      name: "core",
      cwd: filePath("../packages/core/"),
      script: "yarn",
      args: "dev",
      ...commonOptions,
      ignore_watch: ["node_modules"],
      env: {
        PORT: port,
        ...commonEnv,
      },
    },
  ];

  log("Generated ui coreui .env file ....");
  await fse.writeFile(
    filePath("../packages/core-ui/.env"),
    `
      PORT=3000
      NODE_ENV="development"
      REACT_APP_CDN_HOST="http://localhost:3200"
      REACT_APP_API_URL="http://localhost:4000"
      REACT_APP_DASHBOARD_URL="http://localhost:4200"
      REACT_APP_API_SUBSCRIPTION_URL="ws://localhost:4000/graphql"
    `
  );

  await execCommand(`cd ${filePath(`../packages/core-ui`)} && yarn generate-doterxes`);

  if (configs.widgets) {
    if (program.deps) {
      log('Installing dependencies in widgets .........')
      await execCommand(`cd ${filePath(`../widgets`)} && yarn install`);
    }

    await fse.writeFile(
      filePath("../widgets/.env"),
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
      script: "yarn",
      args: "dev",
      ...commonOptions,
      ignore_watch: ["node_modules"],
    });
  }

  const uiPlugins = [];

  for (const plugin of configs.plugins) {
    port++;

    if (plugin.ui) {
      if (program.deps && plugin.ui === 'local') {
        log(`Installing dependencies in ${plugin.name} .........`)
        await execCommand(`cd ${filePath(`../packages/plugin-${plugin.name}-ui`)} && yarn install-deps`);
      }

      const uiConfigs = require(filePath(`../packages/plugin-${plugin.name}-ui/src/configs.js`));

      if (plugin.ui === 'remote') {
        if (uiConfigs.url) {
          uiConfigs.url = (configs.ui_remote_url || '').replace('<name>', plugin.name);
        }

        if (uiConfigs.routes) {
          uiConfigs.routes.url = (configs.ui_remote_url || '').replace('<name>', plugin.name);
        }
      }

      uiPlugins.push(uiConfigs);

      if (plugin.ui === 'local') {
        apps.push({
          name: `${plugin.name}-ui`,
          cwd: filePath(`../packages/plugin-${plugin.name}-ui`),
          script: "yarn",
          args: "start",
        ...commonOptions,
          ignore_watch: ["node_modules"],
        });
      }
    }

    apps.push({
      name: `${plugin.name}-api`,
      cwd: filePath(`../packages/plugin-${plugin.name}-api`),
      script: "yarn",
      args: "dev",
      ...commonOptions,
      ignore_watch: ["node_modules"],
      env: {
        PORT: port,
        ...commonEnv,
      },
    });
  }

  apps.push({
    name: 'gateway',
    cwd: filePath(`../packages/gateway`),
    script: "yarn",
    args: "dev",
      ...commonOptions,
    ignore_watch: ["node_modules"],
    env: {
      PORT: 4000,
      ...commonEnv,
    },
  });

  // replace ui plugins.js
  await fse.writeFile(
    filePath("ecosystem.config.js"),
    `
      module.exports = {
        apps: ${JSON.stringify(apps)}
      }
    `
  );

  log("Generated ui plugins.js file ....");
  await fse.writeFile(
    filePath("../packages/core-ui/public/js/plugins.js"),
    `
      window.plugins = ${JSON.stringify(uiPlugins)}
    `
  );

  if (!program.ignoreRun) {
    log("starting core ....");
    await sleep(30000);
    await execCommand('pm2 start ecosystem.config.js --only core');

    for (const plugin of configs.plugins) {
      log(`starting ${plugin.name} ....`);
      await sleep(10000);
      await execCommand(`pm2 start ecosystem.config.js --only ${plugin.name}-api`);
    }

    log(`starting gateway ....`);
    await sleep(10000);
    await execCommand(`pm2 start ecosystem.config.js --only gateway`);

    log("starting coreui ....");
    await execCommand('pm2 start ecosystem.config.js --only coreui');

    if (configs.widgets) {
      log("starting widgets ....");
      await execCommand('pm2 start ecosystem.config.js --only widgets');
    }
  }
};