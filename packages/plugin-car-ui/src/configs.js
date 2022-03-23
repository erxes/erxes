module.exports = {
  name: "car",
  port: 3007,
  exposes: {
    "./routes": "./src/routes.tsx"
  },
  routes: {
    url: "http://localhost:3008/remoteEntry.js",
    scope: "car",
    module: "./routes",
  },
  menus: [
    {
      text: "Plugin Car",
      url: "/list",
      location: "mainNavigation",
      icon: "icon-car",
      permission: "showCars",
    },
  ],
};
