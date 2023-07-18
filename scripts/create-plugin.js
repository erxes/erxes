// Import required modules
var { resolve } = require('path');
var fs = require('fs-extra');
var path = require('path');
const execSync = require('child_process').exec;
const { prompt, Select } = require('enquirer');

// Define a helper function to get the file path
const filePath = pathName => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }

  return resolve(__dirname, '..');
};

// Define prompts for user input
const promptLocation = new Select({
  name: 'location',
  message: 'Where do you want to place the plugin at?',
  choices: ['settings', 'main navigation']
});

const promptChoice = new Select({
  name: 'choice',
  message:
    'What type of plugin do you wanna create? (You can create general plugin or integration plugin)',
  choices: [
    { name: 'general', message: 'General' },
    { name: 'integration', message: 'Integration' },
  ]
});

const promptIntegrationChoice = new Select({
  name: 'choice',
  message:
    'Choose the integration plugin`s ui template.',
  choices: [
    { name: 'integration', message: 'With form' },
    { name: 'integrationDetail', message: 'With detail page' },
  ]
});

const promptBlank = new Select({
  name: 'location',
  message:
    'Do you wanna start building from an example template? (no will result in empty template)',
  choices: ['yes', 'no']
});

// Define helper functions
const capitalizeFirstLetter = value =>
  value.charAt(0).toUpperCase() + value.slice(1);

const pluralFormation = type => {
  if (type[type.length - 1] === 'y') {
    return type.slice(0, -1) + 'ies';
  }

  return type + 's';
};

// Replace placeholders in a fule with actual values
const replacer = (fullPath, name) => {
  const JSONBuffer = fs.readFileSync(fullPath);

  const content = JSONBuffer.toString()
    .replace(/_name_/gi, name)
    .replace(/{name}s/g, pluralFormation(name))
    .replace(/{Name}s/g, pluralFormation(capitalizeFirstLetter(name)))
    .replace(/{name}/g, name)
    .replace(/{Name}/g, capitalizeFirstLetter(name))
    .replace(/{NAME}/g, name.toUpperCase());

  fs.writeFile(fullPath, content);
};

// Recursively loop through directory files and call replacer for each file 
const loopDirFiles = async (dir, name) => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error('Could not list the directory.', err);
      process.exit(1);
    }
    files.forEach(file => {
      var fullPath = path.join(dir, file);
      fs.stat(fullPath, function(error, stat) {
        if (error) {
          console.error('Error stating file.', error);
          return;
        }
        if (stat.isFile()) {
          replacer(fullPath, name);
        } else if (stat.isDirectory()) {
          loopDirFiles(fullPath, name);
        }
      });
    });
  });
};

// Create UI plugin
var createUi = async (name, location, type) => {
  const dir = filePath('./packages/ui-plugin-template');
  const newDir = filePath(`./packages/plugin-${name}-ui`);

  const sourceDirs = {
    default: filePath(`./packages/ui-plugin-template/source-default`),
    empty: filePath(`./packages/ui-plugin-template/source-empty`),
    integration: filePath(`./packages/ui-plugin-template/source-integration`),
    integrationDetail: filePath(`./packages/ui-plugin-template/source-integration-detail`)
  }

   // Copy the UI template files to the new plugin directory
  fs.copySync(
    dir,
    newDir,
    {
      filter: path => {
        return !/.*source.*/g.test(path);
      }
    },
    fs.copySync(sourceDirs[type], `${newDir}/src`),
    fs.copySync(sourceDirs[type], `${newDir}/.erxes/plugin-src`)
  );

  // Add the plugin into UI configurations
  addIntoUIConfigs(name, location, () => loopDirFiles(newDir, name));
};

// Create API plugin
var createApi = async (name, type) => {
  const dir = filePath('./packages/api-plugin-templ');
  const dotErxes = filePath('./packages/api-plugin-template.erxes');

  const newDir = filePath(`./packages/plugin-${name}-api`);

  const sourceDirs = {
    default: filePath(`./packages/api-plugin-templ/source-default`),
    empty: filePath(`./packages/api-plugin-templ/source-empty`),
    integration: filePath(`./packages/api-plugin-templ/source-integration`)
  }

  // Copy the API template files to the new plugin directory
  fs.copySync(
    dir,
    newDir,
    {
      filter: path => {
        return !/.*source.*/g.test(path);
      }
    },
    fs.copySync(dotErxes, `${newDir}/.erxes`),
    fs.copySync(sourceDirs[type], `${newDir}/src`)
  );

  // Replace placeholders in the files
  loopDirFiles(newDir, name);

  // Add the plugin into API configurations
  addIntoApiConfigs(name);
};

// Add the plugin into UI configurations
const addIntoUIConfigs = (name, location, callback) => {
  const menu =
    location === 'main navigation'
      ? {
          text: '{Name}s',
          url: '/{name}s',
          icon: 'icon-star',
          location: 'mainNavigation'
        }
      : {
          text: '{Name}s',
          to: '/{name}s',
          image: '/images/icons/erxes-18.svg',
          location: 'settings',
          scope: '{name}'
        };

  const uiPath = filePath(`./packages/plugin-${name}-ui/src/configs.js`);
  var ret = false;
  fs.readFile(uiPath, (err, data) => {
    if (err) {
      console.error(`Could not read the file at directory: ${uiPath}`, err);
      process.exit(1);
    }
    var updated = data
      .toString()
      .replace(/menus:.*\[.*\]/g, `menus:[${JSON.stringify(menu)}]`);
    fs.writeFile(uiPath, updated, err2 => {
      if (err2) console.error(err2);
      callback();
    });
  });
};

// Add the plugin into API configurations
const addIntoApiConfigs = async name => {
  const configsPath = resolve(__dirname, '..', 'cli/configs.json');

  var newPlugin = {
    name: name,
    ui: 'local'
  };

  fs.readFile(configsPath, async (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log("configs.json doesn't exist, creating one...");

        // File configs.json will be created
        fs.copyFileSync(`${configsPath}.sample`, configsPath);

        console.log('configs.json.sample was copied to configs.json');
      }

      data = await fs.readFile(configsPath);
    }

    var json = JSON.parse(data);

    json.plugins.push(newPlugin);

    fs.writeFile(configsPath, JSON.stringify(json));
  });
};

// Install UI dependencies
const installUiDeps = name => {
  return `cd ` + filePath(`packages/plugin-${name}-ui && yarn install-deps`);
};

// Install API dependendies
const installApiDeps = name => {
  return `cd ` + filePath(`packages/plugin-${name}-api && yarn install-deps`);
};

// Install dependencies
const installDeps = name => {
  execSync(installUiDeps(name), (err, data) => {
    if (err) console.error(err);
    console.log('Installing UI dependencies...');
    console.log(`successfully created plugin ${name}`);
  });

  execSync(installApiDeps(name), (err, data) => {
    if (err) console.error(err);
    console.log('Installing API dependencies...');
  });
};

// Main function
const main = async () => {

  // Prompt for plugin Name
  const input = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Please enter the plugin name:'
    }
  ]);

  // Prompt for plugin type (General or Integration)
  promptChoice.run().then(type => {
    if (type === 'integration') {

      // If integration, prompt for integration template type
      promptIntegrationChoice.run().then(templateType => {
        const name = input.name;

        createUi(name, '', templateType);
        createApi(name, type);
        installDeps(name);
      });
    } else {
      promptBlank
        .run()
        .then(defaultTemplate => {
          promptLocation
            .run()
            .then(location => {
              const name = input.name;

              const type = defaultTemplate === 'no' ? 'empty' : 'default';

              createUi(name, location, type);
              createApi(name, type);

              installDeps(name);
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    }
  })
};

// Call the main function
main();
