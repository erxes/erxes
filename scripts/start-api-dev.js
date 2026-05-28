// scripts/start-dev.js
require('dotenv').config();

const { ENABLED_PLUGINS, ENABLED_SERVICES, ENABLED_PLUGINS_ONLY_API } =
  process.env;
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const getCurrentGitSha = () => {
  const gitPath = path.join(process.cwd(), '.git');
  const gitStat = fs.statSync(gitPath);
  const gitDir = gitStat.isDirectory()
    ? gitPath
    : path.resolve(
        process.cwd(),
        fs.readFileSync(gitPath, 'utf8').trim().replace(/^gitdir:\s*/, ''),
      );
  const head = fs.readFileSync(path.join(gitDir, 'HEAD'), 'utf8').trim();

  if (!head.startsWith('ref: ')) {
    return head.slice(0, 10);
  }

  const refPath = path.join(gitDir, head.slice(5));

  return fs.readFileSync(refPath, 'utf8').trim().slice(0, 10);
};

const shouldGenerateSentryRelease =
  !process.env.SENTRY_RELEASE ||
  process.env.SENTRY_RELEASE.includes('<git-sha-or-version>');

if (shouldGenerateSentryRelease) {
  try {
    const sha = getCurrentGitSha();

    process.env.SENTRY_RELEASE = `erxes-${sha}`;
    console.log(`Using SENTRY_RELEASE=${process.env.SENTRY_RELEASE}`);
  } catch (error) {
    console.warn(
      'Unable to auto-generate SENTRY_RELEASE from git; continuing without changing it.',
    );
  }
}

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

if (ENABLED_PLUGINS_ONLY_API) {
  try {
    const apiPlugins = ENABLED_PLUGINS_ONLY_API.split(',')
      .map((plugin) => `${plugin}_api`)
      .join(' ');

    plugins = `${plugins} ${apiPlugins}`;

    projectsCount += apiPlugins.split(' ').length;
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
