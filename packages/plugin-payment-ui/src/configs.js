module.exports = {
  name: 'payment',
  port: 3012,
  scope: 'payment',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'payment',
    module: './routes'
  },
  menus: [
    {
      text: 'Invoices',
      url: '/payment-invoices',
      icon: 'icon-list',
      location: 'mainNavigation',
      permission: 'paymentConfigRemove'
    },
    {
      text: 'Payments',
      to: '/payments',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'payment',
      permission: 'paymentConfigRemove'
    }
  ]
};
