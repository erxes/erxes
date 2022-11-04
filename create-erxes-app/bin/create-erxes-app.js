#!/usr/bin/env node
"use strict";

const generator = require('generate-password');
const { resolve, join } = require("path");
const { createInterface } = require("readline");

const chalk = require("chalk");
const fs = require("fs");
const fse = require("fs-extra");
const commander = require("commander");
const execa = require("execa");

const packageJson = require("../package.json");

const program = new commander.Command(packageJson.name);

const generatePass = () => generator.generate({
	length: 10,
	numbers: true
});

let projectName;

program
  .version(packageJson.version)
  .arguments("<directory>")
  .option("--domain <domain>", "Domain")
  .description("create a new application")
  .action((directory) => {
    projectName = directory;
  })
  .parse(process.argv);

if (projectName === undefined) {
  console.error("Please specify the <directory> of your project");

  process.exit(1);
}

let domain = program.domain;

const stopProcess = (message) => {
  if (message) console.error(message);

  process.exit(1);
};

const rootPath = resolve(projectName);

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    readline.question(question, (answer) => {
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

  let maindomain = "http://localhost:3000";

  if (domain !== "localhost") {
    if (!domain.includes("http")) {
      domain = `https://${domain}`;
    }

    maindomain = domain;
  }

  const configs = {
    jwt_token_secret: generatePass(),
    image_tag: "dev",
    db_server_address: "",
    domain,
    main_api_domain: `${domain}/gateway`,
    redis: {
      password: generatePass(),
    },
    installer: {},
    mongo: {
      username: "erxes",
      password: generatePass(),
    },
    rabbitmq: {
      cookie: "",
      user: "erxes",
      pass: generatePass(),
      vhost: "",
    },
    plugins: [
      { name: "logs" },
      { name: "notifications" },
      { name: "forms" },
      { name: "tags" },
      { name: "internalnotes" },
      { name: "contacts" }
    ],
  };

  // create configs.json
  await fse.writeJSON(join(rootPath, "configs.json"), configs, {
    spaces: 2,
  });

  // create package.json
  await fse.writeJSON(
    join(rootPath, "package.json"),
    {
      name: projectName,
      private: true,
      version: "0.1.0",
      scripts: {
        erxes: "erxes",
      },
      dependencies: {
        "amqplib": "^0.8.0",
        "create-erxes-app": "0.0.28",
        "dup": "^1.0.0",
        "erxes": "^0.3.78",
        "ip": "^1.1.5",
        "up": "^1.0.2"
      },
    },
    {
      spaces: 2,
    }
  );

  execa("npm", ["install"], { cwd: rootPath }).stdout.pipe(process.stdout);
};

const main = (async function() {
  if (program.quickStart) {
    await generate();
    return readline.close();
  }

  if (!domain) {
    const inputDomain = await askQuestion(
      "Please enter your domain (localhost): "
    );

    domain = inputDomain || "localhost";
  }

  readline.close();

  await generate();
})();

module.exports = main;