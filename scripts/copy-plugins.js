var path = require('path');
var { resolve } = require("path");
var fs = require('fs-extra');
const exec = require('child_process').exec;
var packageJson = require('../package.json');

const getPkgPath = name => path.dirname(require.resolve(`${name}/package.json`));

const packageNames = Object.keys(packageJson.dependencies);

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
  for (const packageName of packageNames) {
    if (packageName.startsWith('erxes')) {
      const pkgFilePath = getPkgPath(packageName);

      await fs.copy(path.resolve(pkgFilePath), path.resolve(__dirname, '../plugins', packageName))
    }

    // creating plugin.js
    const pluginsPath = path.resolve(__dirname, '../plugins');

    const pluginNames = fs.readdirSync(pluginsPath);

    let pluginImports = '';

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
}

main();