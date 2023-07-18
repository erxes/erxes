// Import required modules
const yaml = require("yaml");
var { resolve } = require("path");
var fs = require('fs-extra');


// Define a helper function to get the file path
const filePath = (pathName) => {
  if (pathName) {
    return resolve(__dirname, '..', pathName);
  }

  return resolve(__dirname, '..');
}

// Define a helper function to get the workflows path
var workflowsPath = (fileName) => filePath(`./.github/workflows/${fileName}`);

// Define a list of plugins 
var plugins = [
  { name: 'inbox', ui: true, api: true },
  { name: 'automations', ui: true, api: true },
  { name: 'cards', ui: true, api: true },
  { name: 'clientportal', ui: true, api: true },
  { name: 'contacts', ui: true, api: true },
  { name: 'dashboard', ui: true, api: true },
  { name: 'emailtemplates', ui: true, api: true },
  { name: 'engages', ui: true, api: true },
  { name: 'forms', ui: true, api: true },
  { name: 'integrations',  api: true },
  { name: 'internalnotes',  api: true },
  { name: 'knowledgebase', ui: true, api: true },
  { name: 'logs', ui: true, api: true },
  { name: 'loyalties', ui: true, api: true },
  { name: 'notifications', ui: true, api: true },
  { name: 'webhooks', ui: true, api: true },
  { name: 'products', ui: true, api: true },
  { name: 'segments', ui: true, api: true },
  { name: 'tags', ui: true, api: true },
  { name: 'webbuilder', ui: true, api: true },
  { name: 'documents', ui: true, api: true },
  { name: 'facebook', ui: true, api: true },
];

// Define an empty object to store plugin information
const pluginsMap = {};

// Define the main function
var main = async () => {

  // Read the content of UI and API workflow templates
  const uiContentBuffer = fs.readFileSync(workflowsPath('plugin-sample-ui.yaml'));
  const apiContentBuffer = fs.readFileSync(workflowsPath('plugin-sample-api.yaml'));

  // Iterate through each plugin
  for (const plugin of plugins) {
    pluginsMap[plugin.name] = {}

    // Process UI for the plugin if enabled
    if (plugin.ui) {

      // Replace placeholders in the UI workflow template with the plugin name
      const uiContent = uiContentBuffer.toString().replace(/{sample}/gi, plugin.name);

      // Write the modified UI workflow file
      fs.writeFileSync(workflowsPath(`plugin-${plugin.name}-ui.yaml`), uiContent);

      // Load the UI configurations for the plugin
      const uiConfigs = require(filePath(`./packages/plugin-${plugin.name}-ui/src/configs.js`));

      // Remove the 'port' property from the UI configurations
      delete uiConfigs.port;

      // Set the URL for the plugin's UI
      const url = `https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-${plugin.name}-ui/remoteEntry.js`;
      uiConfigs.url = url;

      // Update 'routes' and 'layout' properties if present
      if (uiConfigs.routes) {
        uiConfigs.routes.url = url;
      }

      if (uiConfigs.layout) {
        uiConfigs.layout.url = url;
      }

      // Add the UI configurations to the pluginsMap
      pluginsMap[plugin.name] = {
        ui: uiConfigs
      }
    }

    // Process API for the plugin if enabled
    if (plugin.api) {

      // Replace placeholders in the API workflow template with the plugin name
      const apiContent = apiContentBuffer.toString().replace(/{sample}/gi, plugin.name);

      // Write the modified API workflow file 
      fs.writeFileSync(workflowsPath(`plugin-${plugin.name}-api.yaml`), apiContent);

      // Load permissions and essyncer if available
      let permissions;
      let essyncer;

      try {
        permissions = require(filePath(`./packages/plugin-${plugin.name}-api/src/permissions.js`));
      } catch (e) {
        console.log(`no permissions file found for ${plugin.name}`);
      }

      try {
        essyncer = require(filePath(`./packages/plugin-${plugin.name}-api/src/essyncer.js`));
      } catch (e) {
        console.log(`no essyncer file found for ${plugin.name}`);
      }

      // Add permissions and essyncer to the pluginsMap if available
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

  // Write the pluginsMap to a file
  fs.writeFileSync(filePath('./scripts/pluginsMap.js'), `
    module.exports = ${JSON.stringify(pluginsMap)}
  `)
}

// Call the main function
main();