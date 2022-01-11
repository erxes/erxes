module.exports = {
  name: "contacts",
  port: 3011,
  exposes: {
    "./routes": "./src/routes.tsx",
    // "./settings": "./src/Settings.tsx",
  },
  routes: {
    url: "http://localhost:3011/remoteEntry.js",
    scope: "contacts",
    module: "./routes",
  },
  menus: [
    {
      text: "Contacts",
      url: "/contacts/customer",
      icon: "icon-users",
      location: "mainNavigation",
    },
  ],
};