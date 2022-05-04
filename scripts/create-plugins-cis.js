const yaml = require("yaml");
var { resolve } = require("path");
var fs = require('fs-extra');

const filePath = (pathName) => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }

  return resolve(__dirname, '..');
}

var workflowsPath = (fileName) => filePath(`./.github/workflows/${fileName}`);

var plugins = [
  { name: 'ads', api: true },
  { name: 'automations', ui: true, api: true },
  { name: 'calendar', ui: true },
  { name: 'cards', ui: true, api: true },
  { name: 'cars', ui: true, api: true },
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
  { name: 'inbox', ui: true, api: true },
  { name: 'integrations',  api: true },
  { name: 'internalnotes',  api: true },
  { name: 'knowledgebase', ui: true, api: true },
  { name: 'loan', ui: true, api: true },
  { name: 'logs', ui: true, api: true },
  { name: 'loyalties', ui: true, api: true },
  { name: 'neighbor', ui: true, api: true },
  { name: 'notifications', ui: true, api: true },
  { name: 'webhooks', ui: true, api: true },
  { name: 'pos', ui: true, api: true },
  { name: 'products', ui: true, api: true },
  { name: 'qpay', ui: true, api: true },
  { name: 'reactions', api: true },
  { name: 'rentpay', ui: true, api: true },
  { name: 'segments', ui: true, api: true },
  { name: 'syncerkhet', ui: true, api: true },
  { name: 'tags', ui: true, api: true },
  { name: 'tumentech', ui: true, api: true },
];

var main = async () => {
  const uiContentBuffer = fs.readFileSync(workflowsPath('plugin-sample-ui.yaml'));
  const apiContentBuffer = fs.readFileSync(workflowsPath('plugin-sample-api.yaml'));

  for (const plugin of plugins) {
    if (plugin.ui) {
      const uiContent = uiContentBuffer.toString().replace(/{sample}/gi, plugin.name);
      fs.writeFileSync(workflowsPath(`plugin-${plugin.name}-ui.yaml`), uiContent);
    }

    if (plugin.api) {
      const apiContent = apiContentBuffer.toString().replace(/{sample}/gi, plugin.name);
      fs.writeFileSync(workflowsPath(`plugin-${plugin.name}-api.yaml`), apiContent);
    }
  }
}

main();