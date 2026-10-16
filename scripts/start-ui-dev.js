// scripts/start-dev.js
require('dotenv').config();

const { ENABLED_PLUGINS } = process.env;
const { execSync, spawn } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const path = require('path');

let devRemotesArg = '';
let codegenRemotes = [];
if (ENABLED_PLUGINS) {
  try {
    const remotes = ENABLED_PLUGINS.split(',')
      .map((plugin) => `${plugin}_ui`)
      .filter((remote) =>
        existsSync(path.join(__dirname, '../frontend/plugins', remote)),
      );

    codegenRemotes = remotes.filter((remote) => {
      const projectJson = path.join(
        __dirname,
        '../frontend/plugins',
        remote,
        'project.json',
      );
      return (
        existsSync(projectJson) &&
        'codegen' in
          (JSON.parse(readFileSync(projectJson, 'utf8')).targets || {})
      );
    });

    if (remotes.length) {
      devRemotesArg = `--devRemotes="${remotes}"`;
    }
  } catch (error) {
    console.error('Error parsing DEV_REMOTES:', error);
    process.exit(1);
  }
}

// Nx starts dev remotes without running their `dependsOn`, so generate the
// GraphQL types here and keep them fresh while the dev server runs.
let watcher;
if (codegenRemotes.length) {
  const projects = codegenRemotes.join(',');
  execSync(`nx run-many -t codegen -p ${projects}`, { stdio: 'inherit' });
  watcher = spawn(
    'npx',
    [
      'nx',
      'run-many',
      '-t',
      'codegen:watch',
      '-p',
      projects,
      `--parallel=${codegenRemotes.length}`,
    ],
    { stdio: 'inherit' },
  );
}

const command = `nx serve core-ui ${devRemotesArg} --verbose`;
console.log(`Running: ${command}`);
try {
  execSync(command, { stdio: 'inherit' });
} finally {
  watcher?.kill();
}
