module.exports = {
  srcDir: __dirname,
  name: "syncpolaris",
  port: 3137,
  scope: "syncpolaris",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./customerSidebar": "./src/pullPolaris/containers/CustomerSidebar.tsx",
  },
  routes: {
    url: "http://localhost:3137/remoteEntry.js",
    scope: "syncpolaris",
    module: "./routes",
  },
  menus: [
    {
      text: "Sync polaris config",
      to: "/erxes-plugin-sync-polaris/settings/general",
      image: "/images/icons/erxes-04.svg",
      location: "settings",
      scope: "syncpolaris",
      action: "syncPolarisonfig",
      permission: "syncPolarisConfig",
    },
    {
      text: "Sync Polaris",
      url: "/sync-polaris-history",
      icon: "icon-star",
      location: "mainNavigation",
    },
  ],
  customerRightSidebarSection: "./customerSidebar",
};
