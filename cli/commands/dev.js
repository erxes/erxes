const fse = require("fs-extra");
const { execCommand, filePath, log, sleep } = require("./utils");

module.exports.devOnly = async () => {
  const name = process.argv[3];
  await execCommand(`pm2 start ecosystem.config.js --only ${name}`);
};

module.exports.devStop = async () => {
  await execCommand('pm2 delete all');
}

module.exports.devCmd = async (program) => {
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
    REDIS_PASSWORD: configs.redis.pass,
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
      ignore_watch: ["node_modules"],
    },
    {
      name: "core",
      cwd: filePath("../packages/core/"),
      script: "yarn",
      args: "dev",
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
    log('Installing dependencies in widgets .........')
    await execCommand(`cd ${filePath(`../widgets`)} && yarn install`);

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
      ignore_watch: ["node_modules"],
    });
  }

  const uiPlugins = [];

  for (const plugin of configs.plugins) {
    port++;

    if (plugin.ui) {
      log(`Installing dependencies in ${plugin.name} .........`)
      await execCommand(`cd ${filePath(`../packages/plugin-${plugin.name}-ui`)} && yarn install-deps`);

      const uiConfigs = require(filePath(`../packages/plugin-${plugin.name}-ui/src/configs.js`));

      uiPlugins.push(uiConfigs);

      apps.push({
        name: `${plugin.name}-ui`,
        cwd: filePath(`../packages/plugin-${plugin.name}-ui`),
        script: "yarn",
        args: "start",
        ignore_watch: ["node_modules"],
      });
    }

    apps.push({
      name: `${plugin.name}-api`,
      cwd: filePath(`../packages/plugin-${plugin.name}-api`),
      script: "yarn",
      args: "dev",
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
    log("pm2 start ....");
    await execCommand('pm2 start ecosystem.config.js');

    log("Waiting for 30 seconds ....");
    await sleep(30000);

    log("Restarting ....");
    await execCommand('pm2 restart gateway');
  }
};