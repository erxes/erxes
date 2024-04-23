module.exports = {
  srcDir: __dirname,
  name: "block",
  port: 3118,
  scope: "block",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./customerSidebar": "./src/containers/CustomerSideBar.tsx",
    "./activityLog": "./src/activityLogs/activityLog.tsx",
  },
  routes: {
    url: "http://localhost:3118/remoteEntry.js",
    scope: "block",
    module: "./routes",
  },

  activityLog: "./activityLog",
  menus: [
    {
      text: "Blocks",
      to: "/block/list",
      image: "/images/icons/erxes-18.svg",
      location: "settings",
    },
  ],
  customerRightSidebarSection: "./customerSidebar",
};
