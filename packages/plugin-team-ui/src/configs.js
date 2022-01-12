module.exports = {
    name: "team",
    port: 3010,
    exposes: {
      "./routes": "./src/routes.tsx",
      // "./settings": "./src/Settings.tsx",
    },
    routes: {
      url: "http://localhost:3010/remoteEntry.js",
      scope: "team",
      module: "./routes",
    },
    menus: [
      {
        text: "Team",
        url: "/team",
        icon: "icon-integration",
        location: "mainNavigation",
      },
    ],
  };
  