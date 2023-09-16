const { resolve } = require('path');
const fs = require('fs-extra');
const path = require('path');
const execSync = require('child_process').exec;
const { prompt, Select } = require('enquirer');

const filePath = pathName => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }
  return resolve(__dirname, '..');
};

const promptLocation = new Select({
  name: 'location',
  message: 'Where do you want to place the plugin at?',
  choices: ['settings', 'main navigation'],
});

const promptChoice = new Select({
  name: 'choice',
  message: 'What type of plugin do you want to create? (You can create a general plugin or an integration plugin)',
  choices: [
    { name: 'general', message: 'General' },
    { name: 'integration', message: 'Integration' },
  ],
});

const promptIntegrationChoice = new Select({
  name: 'choice',
  message: 'Choose the integration plugin`s UI template.',
  choices: [
    { name: 'integration', message: 'With form' },
    { name: 'integrationDetail', message: 'With detail page' },
  ],
});

const promptBlank = new Select({
  name: 'location',
  message: 'Do you want to start building from an example template? (no will result in an empty template)',
  choices: ['yes', 'no'],
});

const capitalizeFirstLetter = value =>
  value.charAt(0).toUpperCase() + value.slice(1);

const pluralFormation = type => {
  if (type[type.length - 1] === 'y') {
    return type.slice(0, -1) + 'ies';
  }
  return type + 's';
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

const readdirPromise = dir => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
};

const statPromise = fullPath => {
  return new Promise((resolve, reject) => {
    fs.stat(fullPath, (err, stat) => {
      if (err) reject(err);
      else resolve(stat);
    });
  });
};

const copyFiles = async (sourceDir, destinationDir) => {
  const files = await readdirPromise(sourceDir);
  for (const file of files) {
    const fullPath = path.join(sourceDir, file);
    const stat = await statPromise(fullPath);
    if (stat.isFile()) {
      fs.copySync(fullPath, path.join(destinationDir, file));
    } else if (stat.isDirectory()) {
      await copyFiles(fullPath, path.join(destinationDir, file));
    }
  }
};

const createUi = async (name, location, type) => {
  const dir = filePath('./packages/ui-plugin-template');
  const newDir = filePath(`./packages/plugin-${name}-ui`);

  const sourceDirs = {
    default: filePath(`./packages/ui-plugin-template/source-default`),
    empty: filePath(`./packages/ui-plugin-template/source-empty`),
    integration: filePath(`./packages/ui-plugin-template/source-integration`),
    integrationDetail: filePath(`./packages/ui-plugin-template/source-integration-detail`),
  };

  fs.copySync(dir, newDir, {
    filter: path => !/.*source.*/g.test(path),
  });
  await copyFiles(sourceDirs[type], `${newDir}/src`);
  await copyFiles(sourceDirs[type], `${newDir}/.erxes/plugin-src`);
  addIntoUIConfigs(name, location, () => loopDirFiles(newDir, name));
};

const createApi = async (name, type) => {
  const dir = filePath('./packages/api-plugin-templ');
  const dotErxes = filePath('./packages/api-plugin-template.erxes');
  const newDir = filePath(`./packages/plugin-${name}-api`);

  const sourceDirs = {
    default: filePath(`./packages/api-plugin-templ/source-default`),
    empty: filePath(`./packages/api-plugin-templ/source-empty`),
    integration: filePath(`./packages/api-plugin-templ/source-integration`),
  };

  fs.copySync(dir, newDir, {
    filter: path => !/.*source.*/g.test(path),
  });
  fs.copySync(dotErxes, `${newDir}/.erxes`);
  await copyFiles(sourceDirs[type], `${newDir}/src`);

  loopDirFiles(newDir, name);

  addIntoApiConfigs(name);
};

const addIntoUIConfigs = (name, location, callback) => {
  const menu =
    location === 'main navigation'
      ? {
          text: '{Name}s',
          url: '/{name}s',
          icon: 'icon-star',
          location: 'mainNavigation',
        }
      : {
          text: '{Name}s',
          to: '/{name}s',
          image: '/images/icons/erxes-18.svg',
          location: 'settings',
          scope: '{name}',
        };

  const uiPath = filePath(`./packages/plugin-${name}-ui/src/configs.js`);
  fs.readFile(uiPath, (err, data) => {
    if (err) {
      console.error(`Could not read the file at directory: ${uiPath}`, err);
      process.exit(1);
    }
    const updated = data
      .toString()
      .replace(/menus:.*\[.*\]/g, `menus:[${JSON.stringify(menu)}]`);
    fs.writeFile(uiPath, updated, err2 => {
      if (err2) console.error(err2);
      callback();
    });
  });
};

const addIntoApiConfigs = async name => {
  const configsPath = resolve(__dirname, '..', 'cli/configs.json');

  const newPlugin = {
    name: name,
    ui: 'local',
  };

  try {
    const data = await fs.promises.readFile(configsPath);
    const json = JSON.parse(data);
    json.plugins.push(newPlugin);
    await fs.promises.writeFile(configsPath, JSON.stringify(json));
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log("configs.json doesn't exist, creating one...");
      await fs.promises.copyFile(`${configsPath}.sample`, configsPath);
      console.log('configs.json.sample was copied to configs.json');
    } else {
      console.error('Error while adding plugin to configs.json:', error);
    }
  }
};

const installUiDeps = name => `cd ${filePath(`packages/plugin-${name}-ui && yarn install-deps`)}`;
const installApiDeps = name => `cd ${filePath(`packages/plugin-${name}-api && yarn install-deps`)}`;

const installDeps = name => {
  try {
    execSync(installUiDeps(name));
    console.log('Installing UI dependencies...');
    console.log(`Successfully created plugin ${name}`);
  } catch (err) {
    console.error('Error installing UI dependencies:', err);
  }

  try {
    execSync(installApiDeps(name));
    console.log('Installing API dependencies...');
  } catch (err) {
    console.error('Error installing API dependencies:', err);
  }
};

const main = async () => {
  try {
    const input = await prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Please enter the plugin name:',
      },
    ]);

    const type = await promptChoice.run();

    if (type === 'integration') {
      const templateType = await promptIntegrationChoice.run();
      const name = input.name;
      createUi(name, '', templateType);
      createApi(name, type);
      installDeps(name);
    } else {
      const defaultTemplate = await promptBlank.run();
      const location = await promptLocation.run();
      const name = input.name;
      const templateType = defaultTemplate === 'no' ? 'empty' : 'default';
      createUi(name, location, templateType);
      createApi(name, type);
      installDeps(name);
    }
  } catch (err) {
    console.error('Error:', err);
  }
};

main();
