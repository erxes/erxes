module.exports = {
    name: "dashboard",
    port: 3007,
    exposes: {
      "./routes": "./src/routes.tsx",
      // "./settings": "./src/Settings.tsx",
    },
    routes: {
      url: "http://localhost:3007/remoteEntry.js",
      scope: "dashboard",
      module: "./routes",
    },
    menus: [
      {
        text: "Dashboard",
        url: "/dashboard",
        icon: "icon-car",
        location: "mainNavigation",
      },
    ],
  };
  