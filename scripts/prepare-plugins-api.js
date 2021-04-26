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

    try {
      process.chdir(filePath(`plugins/${pluginName}/api`));

      await execCommand('yarn install');

    } catch (e) {
      if (!(e.message.includes("no such file") || e.message.includes('not a directory'))) {
        throw e;
      }
    }
  }

}

main();
