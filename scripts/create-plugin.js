"use strict";
var { resolve } = require("path");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { prompt, Select } = require("enquirer");
const filePath = (pathName) => {
  if (pathName) {
    return resolve(__dirname, "..", pathName);
  }

  return resolve(__dirname, "..");
};
const promptLocation = new Select({
  name: "location",
  message: "Where do you want to place the plugin at?",
  choices: ["settings", "main navigation"],
});

const promptChoice = new Select({
  name: "choice",
  message:
    "What type of plugin do you wanna create? (You can create general plugin or integration plugin)",
  choices: [
    { name: "general", message: "General" },
    { name: "integration", message: "Integration" },
  ],
});

const promptIntegrationChoice = new Select({
  name: "choice",
  message: "Choose the integration plugin`s ui template.",
  choices: [
    { name: "integration", message: "With form" },
    { name: "integrationDetail", message: "With detail page" },
  ],
});

const promptBlank = new Select({
  name: "location",
  message:
    "Do you wanna start building from an example template? (no will result in empty template)",
  choices: ["yes", "no"],
});

const capitalizeFirstLetter = (value) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const pluralFormation = (type) => {
  if (type[type.length - 1] === "y") {
    return type.slice(0, -1) + "ies";
  }

  return type + "s";
};

const replacer = (fullPath, name) => {
  const JSONBuffer = fs.readFileSync(fullPath);

  const content = JSONBuffer.toString()
    .replace(/_name_/gi, name)
    .replace(/{name}s/g, pluralFormation(name))
    .replace(/{Name}s/g, pluralFormation(capitalizeFirstLetter(name)))
    .replace(/{name}/g, name)
    .replace(/{Name}/g, capitalizeFirstLetter(name))
    .replace(/{NAME}/g, name.toUpperCase());

  fs.writeFileSync(fullPath, content);
};

const loopDirFiles = (dir, name) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    var fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isFile()) {
      replacer(fullPath, name);
    } else if (stat.isDirectory()) {
      loopDirFiles(fullPath, name);
    }
  }
};

var createUi = (name, location, type) => {
  const dir = filePath("./packages/template.plugin.ui");
  const newDir = filePath(`./packages/plugin-${name}-ui`);

  const sourceDirs = {
    default: filePath(`./packages/template.plugin.ui/source-default`),
    empty: filePath(`./packages/template.plugin.ui/source-empty`),
    integration: filePath(`./packages/template.plugin.ui/source-integration`),
    integrationDetail: filePath(
      `./packages/template.plugin.ui/source-integration-detail`
    ),
  };

  fs.cpSync(dir, newDir, {
    filter: (path) => {
      return !/.*source.*/g.test(path);
    },
    recursive: true,
  });

  fs.cpSync(sourceDirs[type], `${newDir}/src`, { recursive: true});

  addIntoUIConfigs(name, location);
  loopDirFiles(newDir, name);
};

var createApi = async (name, type) => {
  const dir = filePath("./packages/template.plugin.api");

  const newDir = filePath(`./packages/plugin-${name}-api`);

  const sourceDirs = {
    default: filePath(`./packages/template.plugin.api/source-default`),
    empty: filePath(`./packages/template.plugin.api/source-empty`),
    integration: filePath(`./packages/template.plugin.api/source-integration`),
  };

  fs.cpSync(dir, newDir, {
    filter: (path) => {
      return !/(source-.*$|src$)/g.test(path);
    },
    recursive: true,
  });

  fs.cpSync(sourceDirs[type], `${newDir}/src`, {
    recursive: true,
  });

  loopDirFiles(newDir, name);

  // add plugin into configs.json
  addIntoApiConfigs(name);
};

const addIntoUIConfigs = (name, location) => {
  const menu =
    location === "main navigation"
      ? {
          text: "{Name}s",
          url: "/{name}s",
          icon: "icon-star",
          location: "mainNavigation",
        }
      : {
          text: "{Name}s",
          to: "/{name}s",
          image: "/images/icons/erxes-18.svg",
          location: "settings",
          scope: "{name}",
        };

  const uiPath = filePath(`./packages/plugin-${name}-ui/src/configs.js`);

  const data = fs.readFileSync(uiPath);

  const updated = data
    .toString()
    .replace(/menus:.*\[.*\]/g, `menus:[${JSON.stringify(menu)}]`);
  fs.writeFileSync(uiPath, updated);
};

const addIntoApiConfigs = (name) => {
  const configsPath = resolve(__dirname, "..", "cli/configs.json");

  var newPlugin = {
    name: name,
    ui: "local",
  };

  if (!fs.existsSync(configsPath)) {
    fs.cpSync(`${configsPath}.sample`, configsPath);
  }

  const json = JSON.parse(fs.readFileSync(configsPath));

  json.plugins.push(newPlugin);

  fs.writeFileSync(configsPath, JSON.stringify(json, null, 4));
};

const installUiDeps = (name) => {
  return `cd ` + filePath(`packages/plugin-${name}-ui && yarn install`);
};

const installApiDeps = (name) => {
  return `cd ` + filePath(`packages/plugin-${name}-api && yarn install`);
};

const installDeps = (name) => {
  execSync(installUiDeps(name), { stdio: "inherit" });
  execSync(installApiDeps(name), { stdio: "inherit" });
};

const main = async () => {
  const input = await prompt([
    {
      type: "input",
      name: "name",
      message: "Please enter the plugin name:",
    },
  ]);

  const type = await promptChoice.run();

  if (type === "integration") {
    const templateType = await promptIntegrationChoice.run();
    const name = input.name;

    createUi(name, "", templateType);
    createApi(name, type);
    installDeps(name);
  } else {
    const defaultTemplate = await promptBlank.run();
    const location = await promptLocation.run();

    const name = input.name;

    const type = defaultTemplate === "no" ? "empty" : "default";

    createUi(name, location, type);
    createApi(name, type);
    installDeps(name);
  }
};

main();
