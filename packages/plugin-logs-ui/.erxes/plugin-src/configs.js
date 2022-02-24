module.exports = {
    name: "Logs",
    port: 3016,
    exposes: {
      "./routes": "./src/routes.tsx",
      // "./settings": "./src/Settings.tsx",
    },
    routes: {
      url: "http://localhost:3016/remoteEntry.js",
      scope: "logs1",
      module: "./routes",
    },
    menus: [
      {
        text: "Logs",
        to: "/settings/logs",
        image: "/images/icons/erxes-33.png",
        location: "settings",
        permissions: "viewLogs",
      },
    ],
  };