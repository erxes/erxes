window.plugins = [
  {
    name: 'chat',
    port: 3110,
    exposes: {
      './routes': './src/routes.tsx',
    },
    routes: {
      url: 'http://localhost:3110/remoteEntry.js',
      scope: 'chat',
      module: './routes',
    },
    menus: [
      {
        text: 'Chat',
        url: '/erxes-plugin-chat/home',
        icon: 'icon-cog',
        location: 'mainNavigation',
        permission: 'chatAll',
      },
    ],
  },
];
