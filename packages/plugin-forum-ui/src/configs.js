module.exports = {
  name: 'forum',
  port: 3019,
  scope: 'forum',
  exposes: {
    './routes': './src/routes.tsx',
    './settings': './src/Settings.tsx',
  },
  routes: {
    url: 'http://localhost:3019/remoteEntry.js',
    scope: 'forum',
    module: './routes'
  },
  menus: [
    {
      text: 'Forums',
      url: '/forums',
      icon: 'icon-idea',
      location: 'mainNavigation',
      // scope: 'forum'
    },
    {
      text: 'Categories',
      to: '/forums/categories',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'forum',
      action: '',
      permissions: [],
    },
    {
      text: 'Permission Groups',
      to: '/forums/permission-groups',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'forum',
      action: '',
      permissions: [],
    },
    {
      text: 'Subscription Products',
      to: '/forums/subscription-products',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'forum',
      action: '',
      permissions: [],
    },
  ]
};