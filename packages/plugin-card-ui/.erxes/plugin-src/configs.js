module.exports = {
  name: "cards",
  port: 3002,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./settings": "./src/Settings.tsx",
  },
  routes: {
    url: "http://localhost:3002/remoteEntry.js",
    scope: "cards",
    module: "./routes",
  },
  menus: [
    {
      text: "Sales Pipeline1",
      url: "/deal",
      icon: "icon-megaphone",
      location: "mainNavigation",
    },
    {
      text: "Campaigns settings",
      icon: "icon-megaphone",
      location: "settings",
      scope: "cards",
      component: "./settings",
    },
  ],
};
