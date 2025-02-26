module.exports = {
  srcDir: __dirname,
  name: "xyp",
  port: 3124,
  scope: "xyp",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./xypConfigs": "./src/modules//settings/components/XypConfigs.tsx",
    "./customerSidebar":
      "./src/modules/contacts/containers/CustomerSidebar.tsx",
  },

  extendSystemConfig: "./xypConfigs",
  routes: {
    url: "http://localhost:3124/remoteEntry.js",
    scope: "xyp",
    module: "./routes",
  },
  menus: [
    {
      text: "XYP Sync Rules",
      to: "/xyp-sync-rules",
      image: "/images/icons/erxes-05.svg",
      location: "settings",
      scope: "xyp",
      action: "xyp sync rule",
      permissions: [],
    },
  ],

  customerRightSidebarSection: "./customerSidebar",
  carRightSidebarSection: "./customerSidebar",
  dealRightSidebarSection: {
    title: "ДАН",
    component: "./customerSidebar",
  },
};
