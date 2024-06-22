module.exports = {
  srcDir: __dirname,
  name: "zms",
  port: 3125,
  scope: "zms",
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3125/remoteEntry.js",
    scope: "zms",
    module: "./routes",
  },
  menus: [
    {
      text: "Zms",
      url: "/plugin-zms/zms",
      icon: "icon-star",
      location: "mainNavigation",
    },
    {
      text: "Main config",
      image: "/images/icons/erxes-16.svg",
      to: "/plugin-zms/settings",
      action: "mainConfig",
      scope: "zms",
      location: "settings",
    },
  ],
};
