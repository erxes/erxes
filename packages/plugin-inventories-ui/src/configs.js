module.exports = {
  name: "inventories",
  port: 3012,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3012/remoteEntry.js",
    scope: "inventories",
    module: "./routes",
  },
  menus: [
    {
      text: "Inventories",
      to: "/inventories/inbox:conversation",
      image: "/images/icons/erxes-18.svg",
      location: "settings",
      scope: "inventories",
      action: "inventoriesAll",
      permissions: ["showInventories", "manageInventories"],
    },
  ],
};
