module.exports = {
  name: "inventories",
  port: 3028,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3028/remoteEntry.js",
    scope: "inventories",
    module: "./routes",
  },
  menus: [
    {
      text: "Remainders",
      url: "/inventories/remainders",
      icon: 'icon-film',
      location: "mainNavigation",
      scope: "inventories",
      action: "inventoriesAll",
      permissions: ["showProducts", "manageProducts"],
    },
  ],
};
