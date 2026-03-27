// scripts/start-dev.js
require('dotenv').config();

const { execSync } = require('child_process');

const ENABLED_PLUGINS_UI = process.env.ENABLED_PLUGINS_UI || '';

let devRemotesArg = '';

try {
  const remotes = ENABLED_PLUGINS_UI.split(',')
    .map((plugin) => plugin.trim())
    .filter(Boolean) // remove empty values
    .map((plugin) => `${plugin}_ui`);

  if (remotes.length > 0) {
    devRemotesArg = `--devRemotes="${remotes.join(',')}"`;
  }
} catch (error) {
  console.error('Error parsing ENABLED_PLUGINS_UI:', error);
  process.exit(1);
}

const command = `nx serve core-ui ${devRemotesArg} --verbose`;

console.log(`Running: ${command}`);

execSync(command, { stdio: 'inherit' });

