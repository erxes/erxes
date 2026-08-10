// scripts/start-dev.js
require('dotenv').config();

const { ENABLED_PLUGINS } = process.env;
const { execSync } = require('child_process');

let devRemotesArg = '';
if (ENABLED_PLUGINS) {
  try {
    const remotes = ENABLED_PLUGINS.split(',').map((plugin) => `${plugin}_ui`);

    devRemotesArg = `--devRemotes="${remotes}"`;
  } catch (error) {
    console.error('Error parsing DEV_REMOTES:', error);
    process.exit(1);
  }
}

const command = `nx serve core-ui ${devRemotesArg} --verbose`;
console.log(`Running: ${command}`);

const childEnv = { ...process.env };

if (process.platform === 'darwin' && childEnv.WATCHPACK_POLLING === undefined) {
  childEnv.WATCHPACK_POLLING = 'true';
}

execSync(command, { stdio: 'inherit', env: childEnv });
