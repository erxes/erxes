const readline = require('readline');
var { resolve } = require('path');
var fs = require('fs-extra');
var path = require('path');
const execSync = require('child_process').exec;

const filePath = pathName => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }

  return resolve(__dirname, '..');
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const capitalizeFirstLetter = value =>
  value.charAt(0).toUpperCase() + value.slice(1);

const replacer = (fullPath, name) => {
  const JSONBuffer = fs.readFileSync(fullPath);

  const content = JSONBuffer.toString()
    .replace(/_name_/gi, name)
    .replace(/{name}/g, name)
    .replace(/{Name}/g, capitalizeFirstLetter(name));

  fs.writeFile(fullPath, content);
};

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

var createUi = async (name, location, isEmpty) => {
  const newDir = filePath(`./packages/plugin-${name}-ui`);
  fs.copySync(
    isEmpty
      ? filePath('./packages/ui-plugin-template-empty')
      : filePath('./packages/ui-plugin-template'),
    newDir
  );
  addIntoUIConfigs(name, location, () => loopDirFiles(newDir, name));
};

var createApi = async (name, isEmpty) => {
  const newDir = filePath(`./packages/plugin-${name}-api`);
  fs.copySync(
    isEmpty
      ? filePath('./packages/api-plugin-templ-empty')
      : filePath('./packages/api-plugin-templ'),
    newDir
  );
  loopDirFiles(newDir, name);
};

const addIntoUIConfigs = (name, location, callback) => {
  const menu =
    location == 'mainNav'
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

const addIntoConfigs = async name => {
  const configsPath = resolve(__dirname, '..', 'cli/configs.json');

  var newPlugin = {
    name: name,
    ui: 'local'
  };

  fs.readFile(configsPath, (err, data) => {
    if (err) {
      console.error(
        `Could not read the file at directory: ${configsPath}`,
        err
      );
      process.exit(1);
    }
    var json = JSON.parse(data);
    json.plugins.push(newPlugin);
    fs.writeFile(configsPath, JSON.stringify(json));
  });
};

const installUiDeps = name => {
  return `cd ` + filePath(`packages/plugin-${name}-ui && yarn install-deps`);
};

const installApiDeps = name => {
  return `cd ` + filePath(`packages/plugin-${name}-api && yarn install-deps`);
};

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
const isEmptyTemplate = async () => {
  var isEmpty, answer;
  return new Promise((res, rej) => {
    rl.question(
      'Do you wanna start building from an example template? (y/n) --- no will result in empty template:\n',
      async input => {
        answer = input.toLowerCase();
        if (!input || (answer != 'n' && answer != 'y')) {
          res(isEmptyTemplate());
        } else {
          isEmpty = answer == 'n' ? true : false;
          res(isEmpty);
        }
      }
    );
  });
};

const main = () => {
  rl.question('Please enter the plugin name: ', async name => {
    if (!name) main();
    isEmptyTemplate()
      .then(isEmpty => {
        rl.question(
          'Where do you want to place the new plugin at? (settings/mainNav) --- settings is default option:\n',
          async location => {
            createUi(name, location, isEmpty);
            createApi(name, isEmpty);
            addIntoConfigs(name);
            installDeps(name);
            rl.close();
          }
        );
      })
      .catch(err => console.error(err));
  });
};

main();
