var { resolve } = require("path");
var fse = require('fs-extra');

const filePath = (pathName) => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }

  return resolve(__dirname, '..');
}

var templatePath = filePath('../ui-plugin-template/.erxes');

const pluginNames = fse.readdirSync(filePath('..'));

for (const pluginName of pluginNames) {
  if (pluginName.startsWith('plugin-') && pluginName.endsWith('ui')) {
                            
    try {
      fse.copySync(templatePath, filePath(`../${pluginName}/.erxes`), { overwrite: true });
      console.log(`successfully updated ${pluginName}`)
    } catch (e) {
      console.log(e.message)
    }
  }
}