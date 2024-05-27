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
          text: 'Trading',
          url: '/trading/home',
          // scope: 'trading',
          location: 'mainNavigation',
          icon: 'icon-piggy-bank',
        },
        {
          text: 'Stock List',
          to: '/trading/stock-list',
          scope: 'trading',
          location: 'settings',
          image: '/images/icons/erxes-18.svg',
          permission: 'tradingStockShow'
        },
        {
          text: 'Stock Order',
          to: '/trading/stock-order',
          scope: 'trading',
          location: 'settings',
          image: '/images/icons/erxes-18.svg',
          permission: 'tradingOrderShow'
        },
        {
          text: 'Order List',
          to: '/trading/order-list',
          scope: 'trading',
          location: 'settings',
          image: '/images/icons/erxes-18.svg',
          permission: 'tradingOrderShow'
        },
        {
          text: 'Wallet List',
          to: '/trading/wallet-list',
          scope: 'trading',
          location: 'settings',
          image: '/images/icons/erxes-18.svg',
          permission: 'tradingWalletShow'
        },
        {
          text: 'Withdraw List',
          to: '/trading/withdraw-list',
          scope: 'trading',
          location: 'settings',
          image: '/images/icons/erxes-18.svg',
          permission: 'tradingWithdrawShow'
        },
        {
          text: 'Nominal statement list',
          to: '/trading/nominal-statement-list',
          location: 'settings',
          scope: 'trading',
          image: '/images/icons/erxes-18.svg',
        },
        {
          text: 'Contract note list',
          to: '/trading/contract-list',
          location: 'settings',
          scope: 'trading',
          image: '/images/icons/erxes-18.svg',
        }
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
            {
                name: 'tradingAll',
                description: 'All',
                use: ['tradingOrderManagement', 'tradingStockManagement',
                    'tradingWithdrawManagement', 'tradingCustomerFeeManagement',
                    'tradingWalletManagement', 'tradingStatementShow'
                ]
            },
            {
                name: 'tradingOrderManagement',
                description: 'Manage orders',
                use: ['tradingOrderShow']
            },
            {
                name: 'tradingOrderShow',
                description: 'Show orders'
            },
            {
                name: 'tradingStockManagement',
                description: 'Manage stocks',
                use: ['tradingStockShow']
            },
            {
                name: 'tradingStockShow',
                description: 'Show stocks'
            },
            {
                name: 'tradingWithdrawManagement',
                description: 'Manage withdraws',
                use: ['tradingWithdrawShow']
            },
            {
                name: 'tradingWithdrawShow',
                description: 'Show withdraw'
            },
            {
                name: 'tradingCustomerFeeManagement',
                description: 'Manage customer fee',
                use: ['tradingCustomerFeeShow']
            },
            {
                name: 'tradingCustomerFeeShow',
                description: 'Show customer fee'
            },
            {
                name: 'tradingWalletManagement',
                description: 'Manage wallets',
                use: ['tradingWalletShow']
            },
            {
                name: 'tradingWalletShow',
                description: 'Show wallets'
            },
            {
                name: 'tradingStatementShow',
                description: "Show statements"
            }
        ]
        },
      },
    },
  },
  apex: {
    ui: {
      name: 'apex',
      scope: 'apex',
      exposes: {
        './routes': './src/routes.tsx',
        './clientPortalUserDetailAction':
          './src/components/ClientPortalUserDetailAction.tsx',
      },
      clientPortalUserDetailAction: './clientPortalUserDetailAction',
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
        {
          text: 'Stories',
          to: '/settings/apexstories',
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
