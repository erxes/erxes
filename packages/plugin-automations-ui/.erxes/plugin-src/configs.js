module.exports = {
  name: "automations",
  port: 3008,
  exposes: {
    "./routes": "./src/routes.tsx",
    // "./settings": "./src/Settings.tsx",
  },
  routes: {
    url: "http://localhost:3008/remoteEntry.js",
    scope: "automations",
    module: "./routes",
  },
  menus: [
    {
      text: "Automations",
      url: "/automations",
      icon: "icon-circular",
      location: "mainNavigation",
    },
  ],
};