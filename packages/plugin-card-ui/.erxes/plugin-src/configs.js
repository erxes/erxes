module.exports = {
  name: "cards",
  port: 3001,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./settings": "./src/Settings.tsx",
  },
  routes: {
    url: "http://localhost:3001/remoteEntry.js",
    scope: "cards",
    module: "./routes",
  },
  menus: [
    {
      text: "Sales Pipeline",
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
