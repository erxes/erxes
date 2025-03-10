module.exports = {
  srcDir: __dirname,
  name: "programs",
  port: 3210,
  scope: "programs",
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3210/remoteEntry.js",
    scope: "programs",
    module: "./routes",
  },
  menus: [
    {
      text: "Programs",
      url: "/programs",
      icon: "icon-list",
      location: "mainNavigation",
      permission: "showPrograms",
    },
  ],
};
