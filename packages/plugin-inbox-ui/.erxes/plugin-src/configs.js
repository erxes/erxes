module.exports = {
    name: 'inbox',
    port: 3009,
    exposes: {
      './routes': './src/routes.tsx',
      // './settings': './src/Settings.tsx'
    },
    routes: {
      url: 'http://localhost:3009/remoteEntry.js',
      scope: 'inbox',
      module: './routes'
    },
    menus: [
      {
        text: 'Team Inbox',
        url: '/inbox',
        icon: 'icon-comment-1',
        location: 'mainNavigation'
      }
      // {
      //   text: 'Skills',
      //   icon: 'icon-file-info-alt',
      //   location: 'settings',
      //   scope: 'inbox',
      //   component: './settings'
      // },
      // {
      //   text: 'Channels',
      //   icon: 'icon-layer-group',
      //   location: 'settings',
      //   scope: 'inbox',
      //   component: './settings'
      // },
      // {
      //   text: 'Integrations',
      //   icon: 'icon-puzzle-piece',
      //   location: 'settings',
      //   scope: 'inbox',
      //   component: './settings'
      // },
      // {
      //   text: 'Responses',
      //   icon: 'icon-files-landscapes',
      //   location: 'settings',
      //   scope: 'inbox',
      //   component: './settings'
      // }
    ]
  };
  