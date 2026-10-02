// scripts/start-dev.js
require('dotenv').config();

const { ENABLED_PLUGINS } = process.env;
const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

let devRemotesArg = '';
if (ENABLED_PLUGINS) {
  try {
    const remotes = ENABLED_PLUGINS.split(',')
      .map((plugin) => `${plugin}_ui`)
      .filter((remote) =>
        existsSync(path.join(__dirname, '../frontend/plugins', remote)),
      );

    if (remotes.length) {
      devRemotesArg = `--devRemotes="${remotes}"`;
    }
  } catch (error) {
    console.error('Error parsing DEV_REMOTES:', error);
    process.exit(1);
  }
}

const command = `nx serve core-ui ${devRemotesArg} --verbose`;
console.log(`Running: ${command}`);
execSync(command, { stdio: 'inherit' });
