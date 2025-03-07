module.exports = {
  srcDir: __dirname,
  name: "curriculum",
  port: 3210,
  scope: "curriculum",
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3210/remoteEntry.js",
    scope: "curriculum",
    module: "./routes",
  },
  menus: [
    {
      text: "Curriculum",
      to: "/curriculum",
      location: "mainNavigation",
      icon: "/images/icons/erxes-21.svg",
      scope: "curriculum",
    },
  ],
};
