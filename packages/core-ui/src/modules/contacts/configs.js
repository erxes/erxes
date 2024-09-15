module.exports = {
  srcDir: __dirname,
  name: "contacts",
  port: 3011,
  scope: "contacts",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./automation": "./src/automations/automation.tsx"
  },
  routes: {
    url: "http://localhost:3011/remoteEntry.js",
    scope: "contacts",
    module: "./routes"
  },
  automation: "./automation",

  menus: [
    {
      text: "Contacts",
      url: "/contacts/customer",
      icon: "icon-users",
      location: "mainNavigation",
      permission: "showCustomers"
    }
  ]
};
