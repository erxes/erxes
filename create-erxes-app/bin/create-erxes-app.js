#!/usr/bin/env node
'use strict';

const { resolve, join } = require('path');
const { createInterface } = require('readline');

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const fse = require('fs-extra');
const commander = require('commander');
const execa = require('execa');

const packageJson = require('../package.json');

const program = new commander.Command(packageJson.name);

let projectName;

program
  .version(packageJson.version)
  .arguments('<directory>')
  .option('--domain <domain>', 'Domain')
  .option('--mongoUrl <mongoUrl>', 'Mongo url')
  .option('--elasticsearchUrl <elasticsearchUrl>', 'Elasticsearch url')
  .option('--quickStart', 'Not going to ask a lot of configurations')
  .description('create a new application')
  .action(directory => {
    projectName = directory;
  })
  .parse(process.argv);


if (projectName === undefined) {
  console.error('Please specify the <directory> of your project');

  process.exit(1);
}

const stopProcess = (message) => {
  if (message) console.error(message);

  process.exit(1);
};

const rootPath = resolve(projectName);

const generate = async () => {
  if (await fse.exists(rootPath)) {
    const stat = await fse.stat(rootPath);

    if (!stat.isDirectory()) {
      stopProcess(
        `⛔️ ${chalk.green(
          rootPath
        )} is not a directory. Make sure to create a Erxes application in an empty directory.`
      );
    }

    const files = await fse.readdir(rootPath);

    if (files.length > 0) {
      stopProcess(
        `⛔️ You can only create a Erxes app in an empty directory.\nMake sure ${chalk.green(
          rootPath
        )} is empty.`
      );
    }
  }

  await fs.promises.mkdir(rootPath);

  let maindomain = 'http://localhost:3000';
  let apiDomain = 'http://localhost:3300';
  let integrationsApiDomain = 'http://localhost:3300';
  let widgetsDomain = 'http://localhost:3400';

  if (domain !== 'localhost') {
    if (!domain.includes('http')) {
      domain = `https://${domain}`;
    }

    maindomain = domain;
    apiDomain = `${domain}/api`;
    integrationsApiDomain = `${domain}/integrations`;
    widgetsDomain = `${domain}/widgets`;
  }

  const configs = {
    "JWT_TOKEN_SECRET": Math.random().toString(),
    "MONGO_URL": program.mongoUrl || "mongodb://localhost",
    "ELASTICSEARCH_URL": program.elasticsearchUrl || elasticsearchUrl,
    "ELK_SYNCER": elkSyncer,
    "DOMAIN": maindomain,
    "API_DOMAIN": apiDomain,
    "INTEGRATIONS_API_DOMAIN": integrationsApiDomain,
    "WIDGETS_DOMAIN": widgetsDomain,
    "UI": { "PORT": 3000 },
    "API": {
        "PORT": 3300,
        "PORT_WORKERS": 3700,
        "PORT_CRONS": 3600
    },
    "WIDGETS": { "PORT": 3200 },
    "INTEGRATIONS": { "PORT": 3400 },
    "LOGGER": { "PORT": 3800 },
    "ENGAGES": { "PORT": 3900 },
    "EMAIL_VERIFIER": { "PORT": 4100 }
  };

  if (rabbitmqHost) {
    configs.RABBITMQ_HOST = rabbitmqHost;
  }

  if (redisHost) {
    configs.REDIS_HOST = redisHost;
    configs.REDIS_PORT = redisPort;
    configs.REDIS_PASSWORD = redisPassword;
  }

  // create configs.json
  await fse.writeJSON(
    join(rootPath, 'configs.json'),
    configs,
    {
      spaces: 2,
    }
  );

  // create package.json
  await fse.writeJSON(
    join(rootPath, 'package.json'),
    {
      "name": projectName,
      "private": true,
      "version": '0.1.0',
      "scripts": {
        "start": 'erxes start',
        "restart": 'erxes start --ignoreDownload',
        "update": 'erxes update'
      },
      "dependencies": {
        "erxes": "^0.1.20"
      },
    },
    {
      spaces: 2,
    }
  );

  await generateNginxConf({ DOMAIN: maindomain });

  execa('yarn', ['install'], { cwd: rootPath}).stdout.pipe(process.stdout);
}

let domain = program.domain || 'localhost';
let rabbitmqHost;
let redisHost;
let redisPort=6379;
let redisPassword='';
let elasticsearchUrl='http:/localhost:9200';
let elkSyncer=false;

const readline = createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      return resolve(answer);
    });
  });
}

module.exports = async function() {
  if (program.quickStart) {
    await generate();
    return readline.close();
  }

  const inputDomain = await askQuestion('Please enter your domain (localhost): ')

  if (inputDomain) {
    domain = inputDomain;
  }

  const rabbitmqHostInput = await askQuestion('Are you using rabbitmq then enter rabbitmq host (optional): ')

  if (rabbitmqHostInput) {
    rabbitmqHost = rabbitmqHostInput;
  }

  const redisHostInput = await askQuestion('Are you using redis then enter redis host (optional): ')

  if (redisHostInput) {
    redisHost = redisHostInput;

    const redisPortInput = await askQuestion('Redis port (6379): ')

    if (redisPortInput) {
      redisPort = redisPortInput;
    }

    const redisPasswordInput = await askQuestion('Redis password (optional): ')

    if (redisPasswordInput) {
      redisPassword = redisPasswordInput;
    }
  }

  let answer;
  let answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'elasticsearch',
      message: 'Elasticsearch url ?',
      choices: [
        'http://localhost:9200 (on local)',
        'https://elasticsearch.erxes.io (limited erxes.io offering)',
        'enter your elasticsearch url',
      ],
    },
  ])

  if (answers.elasticsearch.includes('http://localhost:9200')) {
    elasticsearchUrl = 'http://localhost:9200';
  }

  if (answers.elasticsearch.includes('https://elasticsearch.erxes.io')) {
    elasticsearchUrl = 'https://elasticsearch.erxes.io';
  }

  if (answers.elasticsearch.includes('enter')) {
    answer = await inquirer.prompt({
      type: 'input',
      name: 'customElasticsearchUrl',
      message: 'Please enter your elasticsearch url ?'
    });

    elasticsearchUrl = answer.customElasticsearchUrl;
  }

  if (elasticsearchUrl !== 'https://elasticsearch.erxes.io') {
    answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'elkSyncer',
        message: 'How do you want to sync mongo to elasticsearch ?',
        choices: [
          'Using mongo change stream',
          'Using seperate process written in python which requires more specs and more dependencies'
        ],
      },
    ]);

    if (answers.elkSyncer.includes('python')) {
      elkSyncer = true;
    }
  }

  readline.close();

  await generate();
}();

const generateNginxConf = async ({ DOMAIN }) => {
  const commonConfig = `
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_http_version 1.1;
  `

  await fs.promises.writeFile(
    join(rootPath, 'nginx.conf'),
    `
    server {
            listen 80;

            server_name ${DOMAIN.replace('https://', '').replace('http://', '')};

            # erxes build path
            index index.html;

            error_log /var/log/nginx/erxes.error.log;
            access_log /var/log/nginx/erxes.access.log;

            # ui widgets is running on 3000 port.
            location / {
                    proxy_pass http://127.0.0.1:3000/;
                    ${commonConfig}
            }

            # widgets is running on 3200 port.
            location /widgets/ {
                    proxy_pass http://127.0.0.1:3200/;
                    ${commonConfig}
            }

            # api project is running on 3300 port.
            location /api/ {
                    proxy_pass http://127.0.0.1:3300/;
                    ${commonConfig}
            }
            # erxes integrations project is running on 3400 port.
            location /integrations/ {
                    proxy_pass http://127.0.0.1:3400/;
                    ${commonConfig}
            }
    }
  `);
}
