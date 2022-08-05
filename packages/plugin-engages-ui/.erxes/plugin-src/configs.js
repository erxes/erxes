module.exports = {
  name: "engages",
  port: 3001,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3001/remoteEntry.js",
    scope: "engages",
    module: "./routes",
  },
  menus: [
    {
      text: "Campaigns",
      url: "/campaigns",
      icon: "icon-megaphone",
      location: "mainNavigation",
      permission: "showEngagesMessages",
    },
    {
      text: "Campaign settings",
      to: "/settings/campaign-configs",
      image: "/images/icons/erxes-31.png",
      location: "settings",
      scope: "engages",
      action: "",
      permissions: [],
    },
  ],
};
