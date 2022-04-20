module.exports = {
  name: "cars",
  port: 3010,
  exposes: {
    "./routes": "./src/routes.tsx"
  },
  routes: {
    url: "http://localhost:3010/remoteEntry.js",
    scope: "cars",
    module: "./routes",
  },
  menus: [
    {
      text: "Plugin Car",
      url: "/cars",
      location: "mainNavigation",
      icon: "icon-car",
      permission: "showCars",
    },
  ],
};
