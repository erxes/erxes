"use strict";

const fs = require("fs");
const { Select, Input } = require("enquirer");
const generator = require("generate-password");

const generatePass = () =>
  generator.generate({
    length: 10,
    numbers: true
  });

const installAndDeployment = async () => {
  const configs = {
    domain: "",
    jwt_token_secret: generatePass(),
    essyncer: {},
    redis: {
      password: generatePass()
    },
    installer: {},
    elasticsearch: {},
    mongo: {
      username: "erxes",
      password: generatePass(),
      replication: true
    },
    rabbitmq: {
      cookie: "",
      user: "erxes",
      pass: generatePass(),
      vhost: ""
    }
  };

  const domain = await new Input({
    message: "Please enter your domain: ",
    initial: "example.erxes.io",
    required: true
  }).run();

  configs.domain = domain;

  const installTypeSelect = new Select({
    message: "Select installation type: ",
    choices: ["Choose Experience", "Choose Plugins"]
  });

  const installType = await installTypeSelect.run();

  if (installType === "Choose Experience") {
  }

  if (installType === "Choose Plugins") {
  }
  fs.writeFileSync("configs.json", JSON.stringify(configs, null, 4));
};

const main = async () => {
  const actionSelect = new Select({
    message: "Select a Action you want to perform:",
    choices: [
      "Deployment",
      "Start",
      "Stop",
      "Restart",
      "Update",
      "View logs",
      "Backup Data"
    ]
  });

  const answer = await actionSelect.run();

  switch (answer) {
    case "Deployment":
      return installAndDeployment();
      break;
  }
};

main();
