module.exports = {
  name: "factures",
  port: 3012,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3024/remoteEntry.js",
    scope: "factures",
    module: "./routes",
  },
  menus: [
    {
      text: "Factures",
      to: "/factures/inbox:conversation",
      image: "/images/icons/erxes-18.svg",
      location: "settings",
      scope: "factures",
      action: "facturesAll",
      permissions: ["showFactures", "manageFactures"],
    },
  ],
};
