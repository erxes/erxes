var path = require('path');
var { resolve } = require("path");
var fs = require('fs-extra');
const exec = require('child_process').exec;

const filePath = (pathName) => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }

  return resolve(__dirname, '..');
}

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error !== null) {
        return reject(error);
      }

      console.log(stdout);
      console.log(stderr);

      return resolve('done')
    });
  });
}

var main = async () => {
  const pluginsPath = path.resolve(__dirname, '../plugins');

  if (!fs.existsSync(pluginsPath)) {
    return;
  }

  const pluginNames = fs.readdirSync(pluginsPath);

  for (const pluginName of pluginNames) {
    if (pluginName === '.DS_Store') {
      continue;
    }

    if (fs.existsSync(filePath(`plugins/${pluginName}/api`)) && fs.existsSync(filePath(`plugins/${pluginName}/api/package.json`))) {
      try {
        process.chdir(filePath(`plugins/${pluginName}/api`));

        await execCommand('yarn install');
        var json = await fs.readJSON(filePath(`plugins/${pluginName}/api/package.json`))
        var apiJson = await fs.readJSON(filePath(`api/package.json`));

        var dependencies = json.dependencies;
        var apiDependencies = Object.keys(apiJson.dependencies);

        for (const name of Object.keys(dependencies || {})) {
          if (apiDependencies.includes(name)) {
            continue
          }

          process.chdir(filePath('api'));
          await execCommand(`yarn add ${name}@${dependencies[name]}`);
        }

      } catch (e) {
        if (!(e.message.includes("no such file") || e.message.includes('not a directory'))) {
          throw e;
        }
        console.log(e.message);
      }
    }
  }

}

main();
