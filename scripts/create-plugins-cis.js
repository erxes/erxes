const yaml = require('yaml');
var { resolve } = require('path');
var fs = require('fs-extra');

const filePath = pathName => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }

  return resolve(__dirname, '..');
};

var workflowsPath = fileName => filePath(`./.github/workflows/${fileName}`);

var plugins = [
  { name: 'ads', api: true },
  { name: 'loan', ui: true, api: true },
  { name: 'neighbor', ui: true, api: true },
  { name: 'rentpay', ui: true, api: true },
  { name: 'tumentech', ui: true, api: true },
  { name: 'priuscenter', ui: true, api: true },
  { name: 'apex', ui: true, api: true },
  { name: 'bichil', ui: true, api: true },
  { name: 'mobinet', ui: true, api: true },
  { name: 'dac', ui: true, api: true }
];

const pluginsMap = {};

var main = async () => {
  const uiContentBuffer = fs.readFileSync(
    workflowsPath('plugin-sample-ui.yaml')
  );
  const apiContentBuffer = fs.readFileSync(
    workflowsPath('plugin-sample-api.yaml')
  );

  for (const plugin of plugins) {
    pluginsMap[plugin.name] = {};

    if (plugin.ui) {
      const uiContent = uiContentBuffer
        .toString()
        .replace(/{sample}/gi, plugin.name);
      fs.writeFileSync(
        workflowsPath(`plugin-${plugin.name}-ui.yaml`),
        uiContent
      );

      const uiConfigs = require(filePath(
        `./packages/plugin-${plugin.name}-ui/src/configs.js`
      ));

      delete uiConfigs.port;

      const url = `https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-${plugin.name}-ui/remoteEntry.js`;
      uiConfigs.url = url;

      if (uiConfigs.routes) {
        uiConfigs.routes.url = url;
      }

      if (uiConfigs.layout) {
        uiConfigs.layout.url = url;
      }

      pluginsMap[plugin.name] = {
        ui: uiConfigs
      };
    }

    if (plugin.api) {
      const apiContent = apiContentBuffer
        .toString()
        .replace(/{sample}/gi, plugin.name);
      fs.writeFileSync(
        workflowsPath(`plugin-${plugin.name}-api.yaml`),
        apiContent
      );

      let permissions;
      let essyncer;

      try {
        permissions = require(filePath(
          `./packages/plugin-${plugin.name}-api/src/permissions.js`
        ));
      } catch (e) {
        console.log(`no permissions file found for ${plugin.name}`);
      }

      try {
        essyncer = require(filePath(
          `./packages/plugin-${plugin.name}-api/src/essyncer.js`
        ));
      } catch (e) {
        console.log(`no essyncer file found for ${plugin.name}`);
      }

      if (permissions || essyncer) {
        pluginsMap[plugin.name].api = {};
      }

      if (permissions) {
        pluginsMap[plugin.name].api.permissions = permissions;
      }

      if (essyncer) {
        pluginsMap[plugin.name].api.essyncer = essyncer;
      }
    }
  }

  fs.writeFileSync(
    filePath('./scripts/pluginsMap.js'),
    `
    module.exports = ${JSON.stringify(pluginsMap)}
  `
  );
};

main();
