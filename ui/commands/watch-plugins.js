var watch = require('node-watch');
var { resolve } = require("path");
var fs = require('fs-extra');

const filePath = (pathName) => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }

  return resolve(__dirname, '..');
}

var watcher = watch('../packages/plugins', { recursive: true, filter: 'configs.js', delay: 1000 });

watcher.on("change", function(evt, name) {
  const pluginNames = fs.readdirSync(filePath('../packages/plugins'));
  const pluginsConfigs = [];

  for (const pluginName of pluginNames) {
    if (pluginName === '.DS_Store') {
      continue;
    }

    var module = filePath(`../packages/plugins/${pluginName}/ui/src/configs.js`);
    delete require.cache[require.resolve(module)];
    var configs = require(module);

    pluginsConfigs.push(configs);
  }

  const content = `
    window.plugins = ${JSON.stringify(pluginsConfigs)}
  `

  fs.writeFileSync(filePath('./public/js/plugins.js'), content);
});
