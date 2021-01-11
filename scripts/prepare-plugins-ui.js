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
  // creating plugin.js
  const pluginsPath = path.resolve(__dirname, '../plugins');

  if (!fs.existsSync(pluginsPath)) {
    execCommand(`rm -f ${__dirname}/../ui/src/plugins.ts`)
    return;
  }

  const pluginNames = fs.readdirSync(pluginsPath);

  let pluginImports = '';

  for (const pluginName of pluginNames) {
    if (pluginName === '.DS_Store') {
      continue;
    }

    if (fs.existsSync(filePath(`plugins/${pluginName}/ui`))) {
      pluginImports = `
          ${pluginImports}
          '${pluginName}': require('../../plugins/${pluginName}/ui').default,
        `;

      try {
        var json = await fs.readJSON(filePath(`plugins/${pluginName}/ui/packages.json`))

        for (const name of Object.keys(json)) {
          process.chdir(filePath('ui'));
          await execCommand(`yarn add ${name}@${json[name]}`);
        }
      } catch (e) {
        if (!(e.message.includes("no such file") || e.message.includes('not a directory'))) {
          throw e;
        }
      };
    }
  }

  fs.writeFileSync(path.resolve(__dirname, '../ui/src/plugins.ts'), `
    export default {
      ${pluginImports}
    }
  `)

}

main();