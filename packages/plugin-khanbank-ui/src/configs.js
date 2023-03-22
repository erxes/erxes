module.exports = {
  name: 'khanbank',
  port: 3017,
  scope: 'khanbank',
  exposes: {
    './routes': './src/routes.tsx',
    './widget': './src/modules/corporateGateway/components/Widget.tsx'
  },
  widget: './widget',
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'khanbank',
    module: './routes',
  },
  menus: [
    {
      text: 'Khanbank',
      to: '/settings/khanbank',
      image: '/images/icons/erxes-25.png',
      location: 'settings',
      scope: 'khanbank',
      action: 'khanbankConfigsAll',
      permissions: ['khanbankConfigsShow']
    },
    {
      text: 'Khanbank',
      url: '/khanbank-corporate-gateway',
      icon: 'icon-university',
      location: 'mainNavigation',
      scope: 'khanbank',
      action: 'khanbankConfigsAll',
      permissions: ['khanbankConfigsShow']
    },
    {
      text: 'Currency Rates Widget',
      url: '/khanbank-corporate-gateway/widget',
      icon: 'icon-dollar-sign',
      location: 'topNavigation',
      scope: 'khanbank',
      component: './widget'
    },
  ]
};
