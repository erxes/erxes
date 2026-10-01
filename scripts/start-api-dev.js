// scripts/start-dev.js
require('dotenv').config();

const { ENABLED_PLUGINS, ENABLED_SERVICES, ENABLED_PLUGINS_ONLY_API } =
  process.env;
const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

let plugins = '';
let services = '';
let projectsCount = 2;

if (ENABLED_PLUGINS) {
  try {
    plugins = ENABLED_PLUGINS.split(',')
      .map((plugin) => `${plugin}_api`)
      .filter((plugin) =>
        existsSync(path.join(__dirname, '../backend/plugins', plugin)),
      )
      .join(' ');

    projectsCount += plugins ? plugins.split(' ').length : 0;
  } catch (error) {
    console.error('Error parsing DEV_REMOTES:', error);
    process.exit(1);
  }
}

if (ENABLED_PLUGINS_ONLY_API) {
  try {
    const apiPlugins = ENABLED_PLUGINS_ONLY_API.split(',')
      .map((plugin) => `${plugin}_api`)
      .filter((plugin) =>
        existsSync(path.join(__dirname, '../backend/plugins', plugin)),
      )
      .join(' ');

    plugins = `${plugins} ${apiPlugins}`;

    projectsCount += apiPlugins ? apiPlugins.split(' ').length : 0;
  } catch (error) {
    console.error('Error parsing DEV_REMOTES:', error);
    process.exit(1);
  }
}

if (ENABLED_SERVICES) {
  try {
    services = ENABLED_SERVICES.split(',')
      .map((service) => `${service}-service`)
      .join(' ');

    projectsCount += services.split(' ').length;
  } catch (error) {
    console.error('Error parsing DEV_REMOTES:', error);
    process.exit(1);
  }
}

const totalProjects = `${plugins} ${services}`;

const command = `npx nx run-many -t serve -p core-api ${totalProjects} gateway --verbose --output-style=stream --parallel=${Math.min(
  10,
  projectsCount,
)}`;
console.log(`Running: ${command}`);
execSync(command, { stdio: 'inherit' });
