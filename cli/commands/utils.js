const chalk = require('chalk');
const execa = require("execa");
const fs = require('fs');
const cliProgress = require('cli-progress');
const request = require('request');
const fse = require("fs-extra");
const { resolve } = require("path");
const exec = require('child_process').exec;
const colors = require('colors');

const filePath = (pathName) => {
  if (pathName) {
    return resolve(process.cwd(), pathName);
  }

  return resolve(process.cwd());
}

function downloadFile(file_url , targetPath){
  return new Promise((resolve, reject) => {
    // create a new progress bar instance and use shades_classic theme
    const bar = new cliProgress.SingleBar({}, {
      format: colors.green(' {bar}') + ' {percentage}% | ETA: {eta}s | {value}/{total} | Speed: {speed} kbit',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591'
    });
 
    bar.start();

    // Save variable to know progress
    var received_bytes = 0;
    var total_bytes = 0;
    var req = request({
        method: 'GET',
        uri: file_url
    });

    var out = fs.createWriteStream(targetPath);
    req.pipe(out);

    req.on('response', function ( data ) {
        // Change the total bytes value to get progress later.
        total_bytes = parseInt(data.headers['content-length' ]);
    });

    req.on('data', function(chunk) {
        // Update the received bytes
        received_bytes += chunk.length;

        var percentage = (received_bytes * 100) / total_bytes;

        bar.update(percentage);
    });

    req.on('end', function() {
        bar.stop();

        resolve("File succesfully downloaded");
    });
  })
}

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if(error !== null) {
        return reject(error);
      }

      console.log(stdout);
      console.log(stderr);

      return resolve('done')
    });
  });
}

const execCurl = (url, output) => {
  return execCommand(`curl -L ${url} --output ${output}`);
}

const log = (msg, color='green') => {
  console.log(chalk[color](msg));
}

module.exports.log = log;

module.exports.filePath = filePath;

module.exports.downloadLatesVersion = async () => {
  log('Downloading erxes ...');

  // download the latest build
  await execCurl('https://api.github.com/repos/erxes/erxes/releases/latest', 'gitInfo.json')

  const gitInfo = await fse.readJSON(filePath('gitInfo.json'));

  await downloadFile(`https://github.com/erxes/erxes/releases/download/${gitInfo.tag_name}/erxes-${gitInfo.tag_name}.tar.gz`, 'build.tar.gz')

  process.chdir(filePath());

  log('Extracting tar ...');

  await execCommand(`tar -xf build.tar.gz`)

  log('Removing temp files ...');

  await fse.remove(filePath('build.tar.gz'));
}

const runCommand = (command, args, pipe) => {
  if (pipe) {
    return execa(command, args).stdout.pipe(process.stdout);
  }

  return execa(command, args);
}

module.exports.startServices = async (configs) => {
  log('Starting services using pm2 ...');

  const {
    JWT_TOKEN_SECRET,
    DOMAIN,
    API_DOMAIN,
    WIDGETS_DOMAIN,
    INTEGRATIONS_API_DOMAIN,
    MONGO_URL='',
    ELASTICSEARCH_URL,
    ELK_SYNCER,

    RABBITMQ_HOST,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_PASSWORD
  } = configs;

  const optionalDbConfigs = {};

  if (RABBITMQ_HOST) {
    optionalDbConfigs.RABBITMQ_HOST = RABBITMQ_HOST;
  }

  if (REDIS_HOST) {
    optionalDbConfigs.REDIS_HOST = REDIS_HOST;
    optionalDbConfigs.REDIS_PORT = REDIS_PORT;
    optionalDbConfigs.REDIS_PASSWORD = REDIS_PASSWORD;
  }

  const generateMongoUrl = (dbName) => {
    if (MONGO_URL.includes('authSource')) {
      return MONGO_URL.replace('erxes?', `${dbName}?`);
    }

    return `${MONGO_URL}/${dbName}`;
  }

  const commonEnv = {
    NODE_ENV: 'production',
    JWT_TOKEN_SECRET: JWT_TOKEN_SECRET || '',
    MONGO_URL: generateMongoUrl('erxes'),
    MAIN_APP_DOMAIN: DOMAIN,
    WIDGETS_DOMAIN: WIDGETS_DOMAIN,
    INTEGRATIONS_API_DOMAIN: INTEGRATIONS_API_DOMAIN,
    ...configs.API || {}
  }

  const apps = [
    {
      name: 'api',
      script: filePath('build/api'),
      env: {
        ...commonEnv,
        ...optionalDbConfigs,
        DEBUG: 'erxes-api:*', 
      }
    },
    {
      name: 'cronjobs',
      script: filePath('build/api/cronJobs'),
      env: {
        ...commonEnv,
        PROCESS_NAME: 'crons',
        ...optionalDbConfigs,
        DEBUG: 'erxes-crons:*', 
      }
    },
    {
      name: 'workers',
      script: filePath('build/api/workers'),
      env: {
        ...commonEnv,
        ...optionalDbConfigs,
        DEBUG: 'erxes-workers:*', 
      }
    },
    {
      name: 'integrations',
      script: filePath('build/integrations'),
      env: {
        NODE_ENV: 'production',
        DEBUG: 'erxes-integrations:*',
        DOMAIN: INTEGRATIONS_API_DOMAIN,
        MAIN_APP_DOMAIN: DOMAIN,
        MAIN_API_DOMAIN: API_DOMAIN,
        MONGO_URL: generateMongoUrl('erxes_integrations'),
        ...optionalDbConfigs,
        ...configs.INTEGRATIONS || {}
      }
    },
    {
      name: 'engages',
      script: filePath('build/engages'),
      env: {
        NODE_ENV: 'production',
        DEBUG: 'erxes-engages:*',
        DOMAIN: INTEGRATIONS_API_DOMAIN,
        MAIN_API_DOMAIN: API_DOMAIN,
        MONGO_URL: generateMongoUrl('erxes_engages'),
        ...optionalDbConfigs,
        ...configs.ENGAGES || {}
      }
    },
    {
      name: 'logger',
      script: filePath('build/logger'),
      env: {
        NODE_ENV: 'production',
        DEBUG: 'erxes-logs:*',
        DOMAIN: INTEGRATIONS_API_DOMAIN,
        MAIN_API_DOMAIN: API_DOMAIN,
        MONGO_URL: generateMongoUrl('erxes_logger'),
        ...optionalDbConfigs,
        ...configs.LOGGER || {}
      }
    },
    {
      name: 'email-verifier',
      script: filePath('build/email-verifier'),
      env: {
        NODE_ENV: 'production',
        DEBUG: 'erxes-email-verifier:*',
        MONGO_URL: generateMongoUrl('erxes_email_verifier'),
        ...configs.EMAIL_VERIFIER || {}
      }
    }
  ];

  if (ELK_SYNCER) {
    log('Starting elkSyncer ...');

    await runCommand('apt', ['install', '-y', 'python3-pip']);
    await runCommand('pip3', ['install', '-y', '-r', 'build/elkSyncer/requirements.txt']);

    apps.push({
      name: 'elkSyncer',
      script: filePath('build/elkSyncer/main.py'),
      interpreter: '/usr/bin/python3',
      env: {
        MONGO_URL,
        ELASTICSEARCH_URL
      }
    })
  }

  const uiConfigs = configs.UI || {};
  const subscriptionsUrl = `${API_DOMAIN.includes('https') ? 'wss' : 'ws'}//${API_DOMAIN}/subscriptions`;

  if (uiConfigs.disableServe) {
    log('Default serve is disabled. Please serve using services like nginx, aws s3 ...', 'yellow');
  } else {
    await fs.promises.writeFile(filePath('build/ui/js/env.js'), `
      window.env = {
        NODE_ENV: "production",
        REACT_APP_API_URL: "${API_DOMAIN}",
        REACT_APP_API_SUBSCRIPTION_URL: "${subscriptionsUrl}",
        REACT_APP_CDN_HOST: "${WIDGETS_DOMAIN}"
      }
    `);

    apps.push({
      name: 'ui',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: filePath('build/ui'),
        PM2_SERVE_PORT: uiConfigs.PORT,
        PM2_SERVE_SPA: 'true',
      }
    })
  }

  apps.push({
    name: 'widgets',
    script: filePath('build/widgets/dist'),
    env: {
      ...configs.WIDGETS || {},
      NODE_ENV: 'production',
      ROOT_URL: WIDGETS_DOMAIN,
      API_URL: API_DOMAIN,
      API_SUBSCRIPTIONS_URL: subscriptionsUrl,
    }
  });

  // create ecosystem
  await fse.writeFile(
    filePath('ecosystem.config.js'),
    `
      module.exports = {
        apps: ${JSON.stringify(apps)}
      }
    `
  );

  return runCommand("pm2", ["start", filePath('ecosystem.config.js')], false);
}