module.exports = {
  name: 'payment',
  port: 3012,
  scope: 'payment',
  exposes: {
    './routes': './src/routes.tsx',
    './SelectPayments': './src/containers/SelectPayments.tsx',
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'payment',
    module: './routes'
  },
  extendFormOptions: './SelectPayments',
  menus: [
    {
      text: 'Invoices',
      url: '/payment/invoices',
      icon: 'icon-list',
      location: 'mainNavigation',
      permission: 'showInvoices',
    },
    {
      text: 'Payments',
      to: '/settings/payments',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'payment',
      action: "paymentsAll",
      permissions: ['showPayments']
    }
  ]
}
