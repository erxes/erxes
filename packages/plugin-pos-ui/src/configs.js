module.exports = {
  name: "pos",
  port: 3016,
  exposes: {
    "./routes": "./src/routes.tsx",

  },
  routes: {
    url: "http://localhost:3016/remoteEntry.js",
    scope: "pos",
    module: "./routes",
  },
  menus: [
    {
      text: "Pos Orders",
      url: "/pos-orders",
      icon: "icon-lamp",
      location: "mainNavigation",
      permission: "showPos",
    },
    {
      text: "POS",
      to: "/pos",
      image: "/images/icons/erxes-05.svg",
      location: "settings",
      scope: "pos",
      action: "posConfig",
      permissions: ['showPos'],
    },
  ],
};
