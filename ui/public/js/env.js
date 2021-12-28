window.env = {};

window.plugins = [
  {
    name: "engages",
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
      },
      {
        text: "Campaigns settings",
        icon: "icon-megaphone",
        location: "settings",
        scope: "engages",
        component: './settings'
      },
    ],
  },
];