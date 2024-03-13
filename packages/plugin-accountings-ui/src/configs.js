module.exports = {
  srcDir: __dirname,
  name: "accountings",
  port: 3032,
  scope: 'accountings',
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3032/remoteEntry.js",
    scope: "accountings",
    module: "./routes",
  },
  menus: [
    {
      text: "Accountings",
      to: "/settings/accounts/",
      image: "/images/icons/erxes-31.png",
      location: "settings",
      scope: "accountings",
      action: "accountingsAll",
      permissions: ["showAccounts", "manageAccounts"],
    },
    {
      text: "Configs of Accountings",
      to: "/settings/uoms-manage/",
      image: "/images/icons/erxes-07.svg",
      location: "settings",
      scope: "accountings",
      action: "accountingsAll",
      permissions: ["showAccounts", "manageAccounts"],
    },
  ],
};
