module.exports = {
  name: "ebarimt",
  port: 3018,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3018/remoteEntry.js",
    scope: "ebarimt",
    module: "./routes",
  },
  menus: [
    {
      text: "Put Responses",
      url: "/put-responses",
      icon: "icon-lamp",
      location: "mainNavigation",
      permission: "syncEbarimtConfig",
    },
    {
      text: "Ebarimt config",
      to: "/erxes-plugin-ebarimt/settings/general",
      image: "/images/icons/erxes-04.svg",
      location: "settings",
      scope: "ebarimt",
      action: "syncEbarimtConfig",
      permissions: [],
    },
  ],
};
