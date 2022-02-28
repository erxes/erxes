module.exports = {
  name: "campaigns",
  port: 3001,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./settings": "./src/Settings.tsx",
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
      text: "Campaigns settings",
      to: "#",
      imagen: "/images/icons/erxes-31.png",
      location: "settings",
      scope: "campaigns",
      action: "",
      permissions: [],
      component: "./settings",
    },
  ],
};
