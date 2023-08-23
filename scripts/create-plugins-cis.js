const yaml = require('yaml');
var { resolve } = require('path');
var fs = require('fs-extra');

const filePath = (pathName) => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }

  return resolve(__dirname, '..');
};

var workflowsPath = (fileName) => filePath(`./.github/workflows/${fileName}`);

var plugins = [
  { name: 'inbox', ui: true, api: true },
  { name: 'automations', ui: true, api: true },
  { name: 'calendar', ui: true },
  { name: 'calls', ui: true, api: true },
  { name: 'cars', ui: true, api: true },
  { name: 'cards', ui: true, api: true },
  { name: 'chats', ui: true, api: true },
  { name: 'clientportal', ui: true, api: true },
  { name: 'contacts', ui: true, api: true },
  { name: 'dashboard', ui: true, api: true },
  { name: 'ebarimt', ui: true, api: true },
  { name: 'emailtemplates', ui: true, api: true },
  { name: 'engages', ui: true, api: true },
  { name: 'exm', ui: true, api: true },
  { name: 'exmfeed', ui: true, api: true },
  { name: 'forms', ui: true, api: true },
  { name: 'integrations', api: true },
  { name: 'internalnotes', api: true },
  { name: 'knowledgebase', ui: true, api: true },
  { name: 'logs', ui: true, api: true },
  { name: 'loyalties', ui: true, api: true },
  { name: 'notifications', ui: true, api: true },
  { name: 'webhooks', ui: true, api: true },
  { name: 'pos', ui: true, api: true },
  { name: 'products', ui: true, api: true },
  { name: 'reactions', api: true },
  { name: 'segments', ui: true, api: true },
  { name: 'syncerkhet', ui: true, api: true },
  { name: 'tags', ui: true, api: true },
  { name: 'salesplans', ui: true, api: true },
  { name: 'processes', ui: true, api: true },
  { name: 'inventories', ui: true, api: true },
  { name: 'posclient', api: true },
  { name: 'webbuilder', ui: true, api: true },
  { name: 'payment', ui: true, api: true },
  { name: 'imap', ui: true, api: true },
  { name: 'block', ui: true, api: true },
  { name: 'assets', ui: true, api: true },
  { name: 'riskassessment', ui: true, api: true },
  { name: 'forum', ui: true, api: true },
  { name: 'documents', ui: true, api: true },
  { name: 'pricing', ui: true, api: true },
  { name: 'timeclock', ui: true, api: true },
  { name: 'zalo', ui: true, api: true },
  { name: 'facebook', ui: true, api: true },
  { name: 'filemanager', ui: true, api: true },
  { name: 'khanbank', ui: true, api: true },
  { name: 'productplaces', ui: true, api: true },
  { name: 'ecommerce', api: true },
  { name: 'grants', api: true, ui: true },
  { name: 'loans', api: true, ui: true },
  { name: 'viber', api: true, ui: true },
];

const pluginsMap = {};

var main = async () => {
  const uiContentBuffer = fs.readFileSync(
    workflowsPath('plugin-sample-ui.yaml')
  );
  const apiContentBuffer = fs.readFileSync(
    workflowsPath('plugin-sample-api.yaml')
  );

  permissionCheckers = [];

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

        for (const val of Object.values(permissions)) {
          permissionCheckers = permissionCheckers.concat(val.actions)
        }
      }

      if (essyncer) {
        pluginsMap[plugin.name].api.essyncer = essyncer;
      }
    }
  }

  const actions = permissionCheckers.map(action => action.name);
  const dups = actions.filter((item, index) => actions.indexOf(item) !== index);

  if (dups.length) {
    console.log(`warning: duplicated actions names ==> ${dups.join(', ')}`);
  }

  fs.writeFileSync(
    filePath('./scripts/pluginsMap.js'),
    `
    module.exports = ${JSON.stringify(pluginsMap)}
  `
  );
};

main();
