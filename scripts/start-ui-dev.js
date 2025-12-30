// scripts/start-dev.js
require('dotenv').config();

const { ENABLED_PLUGINS_UI } = process.env;
const { execSync } = require('child_process');

let devRemotesArg = '';
if (ENABLED_PLUGINS_UI) {
  try {
    const remotes = ENABLED_PLUGINS_UI.split(',').map((plugin) => `${plugin}_ui`);

    devRemotesArg = `--devRemotes="${remotes}"`;
  } catch (error) {
    console.error('Error parsing DEV_REMOTES:', error);
    process.exit(1);
  }
}

const command = `nx serve core-ui ${devRemotesArg} --verbose`;
console.log(`Running: ${command}`);
execSync(command, { stdio: 'inherit' });
