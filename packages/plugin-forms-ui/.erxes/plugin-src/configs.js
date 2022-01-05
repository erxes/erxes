module.exports = {
  name: "forms",
  port: 3005,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./settings": "./src/Settings.tsx",
  },
  routes: {
    url: "http://localhost:3005/remoteEntry.js",
    scope: "forms",
    module: "./routes",
  },
  menus: [
    {
      text: "Forms",
      url: "/forms",
      icon: "icon-laptop",
      location: "mainNavigation",
    },
  ],
};
