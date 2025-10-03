// scripts/start-dev.js
require('dotenv').config();

const { ENABLED_PLUGINS, ENABLED_SERVICES } = process.env;
const { execSync } = require('child_process');

let plugins = '';
let services = '';
let projectsCount = 2;

if (ENABLED_PLUGINS) {
  try {
    plugins = ENABLED_PLUGINS.split(',')
      .map((plugin) => `${plugin}_api`)
      .join(' ');

    projectsCount += plugins.split(' ').length;
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

const command = `npx nx run-many -t serve -p core-api ${totalProjects} gateway --verbose --parallel=${projectsCount}`;
console.log(`Running: ${command}`);
execSync(command, { stdio: 'inherit' });
