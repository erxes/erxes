"use strict";
var { resolve } = require("path");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { Select, Input } = require("enquirer");
// const { config } = require("process");

const installAndDeployment = async () => {
  const configs = { essyncer: {}, elasticsearch: {} };

  const domain = await new Input({
    message: "Please enter your domain: ",
    initial: "example.erxes.io",
    required: true
  }).run();

  configs.domain = domain;

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
