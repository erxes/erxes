module.exports = {
  srcDir: __dirname,
  name: "xyp",
  port: 3124,
  scope: "xyp",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./xypConfigs": "./src/modules/XypConfigs.tsx",
    "./customerSidebar":
      "./src/modules/contacts/containers/CustomerSidebar.tsx",
  },

  extendSystemConfig: "./xypConfigs",
  routes: {
    url: "http://localhost:3124/remoteEntry.js",
    scope: "xyp",
    module: "./routes",
  },

  customerRightSidebarSection: [
    {
      text: "Xyp Section",
      component: "./customerSidebar",
      scope: "xyp",
    },
  ],
  carRightSidebarSection: "./customerSidebar",
};
