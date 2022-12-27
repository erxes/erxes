module.exports = {
  trading: {
    ui: {
      name: 'trading',
      scope: 'trading',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-trading-ui/remoteEntry.js',
        scope: 'trading',
        module: './routes',
      },
      menus: [
        {
          text: 'Domestic trading',
          url: '/domestic/order-list',
          icon: 'icon-laptop',
          location: 'mainNavigation',
        },
        {
          text: 'Stock List',
          to: '/domestic/stock-list',
          image: '/images/icons/erxes-29.png',
          location: 'settings',
          scope: 'trading',
        },
        {
          text: 'Stock Order',
          to: '/domestic/stock-order',
          image: '/images/icons/erxes-29.png',
          location: 'settings',
          scope: 'trading',
        },
        {
          text: 'Order List',
          to: '/domestic/order-list',
          image: '/images/icons/erxes-29.png',
          location: 'settings',
          scope: 'trading',
        },
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-trading-ui/remoteEntry.js',
    },
    api: {
      permissions: {
        trading: {
          name: 'trading',
          description: 'Trading',
          actions: [
            { name: 'All', description: 'All' },
            { name: 'WalletManage', description: 'wallet manage' },
          ],
        },
      },
    },
  },
  apex: {
    ui: {
      name: 'apex',
      scope: 'apex',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-apex-ui/remoteEntry.js',
        scope: 'apex',
        module: './routes',
      },
      menus: [
        {
          text: 'Reports',
          to: '/settings/apexreports',
          image: '/images/icons/erxes-09.svg',
          location: 'settings',
          scope: 'apex',
          permissions: ['manageApexReports'],
        },
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-apex-ui/remoteEntry.js',
    },
    api: {
      permissions: {
        apex: {
          name: 'apex',
          description: 'apex',
          actions: [
            {
              name: 'manageApexReports',
              description: 'manageApexReports',
              use: ['manageApexReports'],
            },
            { name: 'manageApexReports', description: 'Manage reports' },
          ],
        },
      },
    },
  },
};
