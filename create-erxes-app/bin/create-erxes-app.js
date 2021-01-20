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
  .option('--quickStart', 'Not going to ask a lot of configurations')
  .option('--domain <domain>', 'Domain')
  .option('--mongoUrl <mongoUrl>', 'Mongo url')
  .option('--redisHost <redisHost>', 'Redis host')
  .option('--rabbitmqHost <rabbitmqHost>', 'RabbitMQ host')
  .option('--elasticsearchUrl <elasticsearchUrl>', 'Elasticsearch url')
  .option('--elkSyncer <elkSyncer>', 'Use elkSyncer service sync elasticsearch')
  .description('create a new application')
  .action(directory => {
    projectName = directory;
  })
  .parse(process.argv);

if (projectName === undefined) {
  console.error('Please specify the <directory> of your project');

  process.exit(1);
}

let domain = program.domain;
let rabbitmqHost = program.rabbitmqHost || '';
let redisHost = program.redisHost || '';
let redisPort = 6379;
let redisPassword = '';
let elasticsearchUrl = program.elasticsearchUrl;
let elkSyncer = program.elkSyncer === "true" ? true : false;
let useDashboard = false;

const stopProcess = message => {
  if (message) console.error(message);

  process.exit(1);
};

const rootPath = resolve(projectName);

const readline = createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = question => {
  return new Promise(resolve => {
    readline.question(question, answer => {
      return resolve(answer);
    });
  });
};

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

  if (domain !== 'localhost') {
    if (!domain.includes('http')) {
      domain = `https://${domain}`;
    }

    maindomain = domain;
  }

  const configs = {
    JWT_TOKEN_SECRET: Math.random().toString(),
    MONGO_URL: program.mongoUrl || 'mongodb://localhost',
    ELASTICSEARCH_URL: elasticsearchUrl,
    ELK_SYNCER: elkSyncer,
    USE_DASHBOARD: useDashboard,
    DOMAIN: maindomain
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
  await fse.writeJSON(join(rootPath, 'configs.json'), configs, {
    spaces: 2
  });

  // create package.json
  await fse.writeJSON(
    join(rootPath, 'package.json'),
    {
      name: projectName,
      private: true,
      version: '0.1.0',
      scripts: {
        start: 'erxes start',
        restart: 'erxes start --ignoreDownload',
        update: 'erxes update'
      },
      dependencies: {
        erxes: '^0.1.20'
      }
    },
    {
      spaces: 2
    }
  );

  execa('yarn', ['install'], { cwd: rootPath }).stdout.pipe(process.stdout);
};

const main = (async function() {
  if (program.quickStart) {
    await generate();
    return readline.close();
  }

  if (!domain) {
    const inputDomain = await askQuestion(
      'Please enter your domain (localhost): '
    );

    domain = inputDomain || 'localhost';
  }

  if (!rabbitmqHost) {
    const rabbitmqHostInput = await askQuestion(
      'Rabbitmq host (optional): '
    );

    if (rabbitmqHostInput) {
      rabbitmqHost = rabbitmqHostInput;
    }
  }

  if (!redisHost) {
    const redisHostInput = await askQuestion(
      'Redis host (optional): '
    );

    if (redisHostInput) {
      redisHost = redisHostInput;

      const redisPortInput = await askQuestion('Redis port (6379): ');

      if (redisPortInput) {
        redisPort = redisPortInput;
      }

      const redisPasswordInput = await askQuestion('Redis password (optional): ');

      if (redisPasswordInput) {
        redisPassword = redisPasswordInput;
      }
    }
  }

  if (!elasticsearchUrl) {
    let answer;
    let answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'elasticsearch',
        message: 'Elasticsearch url ?',
        choices: [
          'http://localhost:9200 (on local)',
          'https://elasticsearch.erxes.io (limited erxes.io offering)',
          'enter your elasticsearch url'
        ]
      }
    ]);

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
  }

  if (elasticsearchUrl !== 'https://elasticsearch.erxes.io') {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'elkSyncer',
        message: 'How do you want to sync mongo to elasticsearch ?',
        choices: [
          'Using mongo change stream',
          'Using seperate process written in python which requires more specs and more dependencies'
        ]
      }
    ]);

    if (answers.elkSyncer.includes('python')) {
      elkSyncer = true;
    }
  }

  readline.close();

  await generate();
})();

module.exports = main;