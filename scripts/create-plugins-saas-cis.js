var { resolve } = require("path");
var fs = require("fs-extra");

const filePath = pathName => {
  if (pathName) {
    return resolve(__dirname, "..", pathName);
  }

  return resolve(__dirname, "..");
};

var plugins = [
  { name: "inbox", ui: true, api: true },
  { name: "automations", ui: true, api: true },
  { name: "calendar", ui: true },
  { name: "calls", ui: true, api: true },
  { name: "cars", ui: true, api: true },
  { name: "sales", ui: true, api: true },
  { name: "tasks", ui: true, api: true },
  { name: "purchases", ui: true, api: true },
  { name: "notifications", ui: true, api: true },
  { name: "tickets", ui: true, api: true },
  { name: "chats", api: true },
  { name: "clientportal", ui: true, api: true },
  { name: "ebarimt", ui: true, api: true },
  { name: "engages", ui: true, api: true },
  { name: "exm", ui: true, api: true },
  { name: "exmfeed", api: true },
  { name: "integrations", api: true },
  { name: "knowledgebase", ui: true, api: true },
  { name: "loyalties", ui: true, api: true },
  { name: "webhooks", ui: true, api: true },
  { name: "pos", ui: true, api: true },
  { name: "reactions", api: true },
  { name: "syncerkhet", ui: true, api: true },
  { name: "multierkhet", api: true, ui: true },
  { name: "salesplans", ui: true, api: true },
  { name: "processes", ui: true, api: true },
  { name: "inventories", ui: true, api: true },
  { name: "posclient", api: true },
  { name: "webbuilder", ui: true, api: true },
  { name: "payment", ui: true, api: true },
  { name: "imap", ui: true, api: true },
  { name: "block", ui: true, api: true },
  { name: "assets", ui: true, api: true },
  { name: "riskassessment", ui: true, api: true },
  { name: "forum", ui: true, api: true },
  { name: "documents", ui: true, api: true },
  { name: "pricing", ui: true, api: true },
  { name: "timeclock", ui: true, api: true },
  { name: "zalo", ui: true, api: true },
  { name: "facebook", ui: true, api: true },
  { name: "filemanager", ui: true, api: true },
  { name: "khanbank", ui: true, api: true },
  { name: "productplaces", ui: true, api: true },
  { name: "ecommerce", api: true },
  { name: "grants", api: true, ui: true },
  { name: "loans", api: true, ui: true },
  { name: "viber", api: true, ui: true },
  { name: "meetings", api: true, ui: true },
  { name: "xyp", api: true, ui: true },
  { name: "savings", api: true, ui: true },
  { name: "goals", api: true, ui: true },
  { name: "msdynamic", api: true, ui: true },
  { name: "dailyco", api: true, ui: true },
  { name: "zms", api: true, ui: true },
  { name: "syncpolaris", api: true, ui: true },
  { name: "reports", api: true, ui: true },
  { name: "instagram", api: true, ui: true },
  { name: "burenscoring", api: true, ui: true },
  { name: "golomtbank", api: true, ui: true },
  { name: "template", api: true, ui: true }
];

const pluginsMap = {};
const uiPlugins = [];
const essyncerJSON = {
  plugins: [
    {
      db_name: "erxes",
      collections: [
        {
          name: "users",
          schema: "{}",
          script: ""
        },
        {
          name: "conformities",
          schema: `
          {
            "mainType": {
              "type": "keyword"
            },
            "mainTypeId": {
              "type": "keyword"
            },
            "relType": {
              "type": "keyword"
            },
            "relTypeId": {
              "type": "keyword"
            }
          }
        `,
          script: ""
        }
      ]
    }
  ]
};

var main = async () => {
  permissionCheckers = [];

  for (const plugin of plugins) {
    pluginsMap[plugin.name] = {};

    if (plugin.ui) {
      const uiConfigs = require(
        filePath(`./packages/plugin-${plugin.name}-ui/src/configs.js`)
      );

      delete uiConfigs.port;

      const url = `https://plugin-uis.erxes.io/js/plugins/plugin-${plugin.name}-ui/remoteEntry.js`;

      uiConfigs.url = url;

      if (uiConfigs.routes) {
        uiConfigs.routes.url = url;
      }

      if (uiConfigs.layout) {
        uiConfigs.layout.url = url;
      }

      if (uiConfigs.innerWidget) {
        uiConfigs.innerWidget.url = url;
      }

      pluginsMap[plugin.name] = {
        ui: uiConfigs
      };

      uiPlugins.push(uiConfigs);
    }

    if (plugin.api) {
      let permissions;
      let essyncer;

      try {
        permissions = require(
          filePath(`./packages/plugin-${plugin.name}-api/src/permissions.js`)
        );
      } catch (e) {
        console.log(`no permissions file found for ${plugin.name}`);
      }

      try {
        essyncer = require(
          filePath(`./packages/plugin-${plugin.name}-api/src/essyncer.js`)
        );
      } catch (e) {
        console.log(`no essyncer file found for ${plugin.name}`);
      }

      if (permissions || essyncer) {
        pluginsMap[plugin.name].api = {};
      }

      if (permissions) {
        pluginsMap[plugin.name].api.permissions = permissions;

        for (const val of Object.values(permissions)) {
          permissionCheckers = permissionCheckers.concat(val.actions);
        }
      }

      if (essyncer) {
        pluginsMap[plugin.name].api.essyncer = essyncer;

        essyncerJSON.plugins.push({
          db_name: "erxes",
          collections: essyncer
        });
      }
    }
  }

  const actions = permissionCheckers.map(action => action.name);
  const dups = actions.filter((item, index) => actions.indexOf(item) !== index);

  if (dups.length) {
    console.log(`warning: duplicated actions names ==> ${dups.join(", ")}`);
  }

  fs.writeFileSync(
    filePath("./scripts/ownCloud/core-ui/plugins.js"),
    `
     window.plugins = ${JSON.stringify(uiPlugins)}
    `
  );

  await fs.writeJSON(
    filePath("./scripts/ownCloud/essyncerData/plugins.json"),
    essyncerJSON
  );
};

main();
