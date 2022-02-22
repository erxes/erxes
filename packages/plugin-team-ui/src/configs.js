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
        text: 'Team Members',
        to: '/settings/team',
        image: '/images/icons/erxes-23.svg',
        location: "settings",
        scope: "team",
        component: "./settings",
        permissions: [
          'showUsers',
          'usersEdit',
          'usersInvite',
          'usersSetActiveStatus',
          'exportUsers'
        ],
      },
    ],
  };
  