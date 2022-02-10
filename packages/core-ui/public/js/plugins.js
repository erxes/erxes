window.plugins = [
  {
    name: 'automations',
    port: 3008,
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url: 'http://localhost:3008/remoteEntry.js',
      scope: 'automations',
      module: './routes'
    },
    menus: [
      {
        text: 'Automations',
        url: '/automations',
        icon: 'icon-circular',
        location: 'mainNavigation'
      }
    ]
  },
  {
    name: 'calendar',
    port: 3006,
    exposes: {
      './routes': './src/routes.tsx',
      './settings': './src/Settings.tsx'
    },
    routes: {
      url: 'http://localhost:3006/remoteEntry.js',
      scope: 'calendar',
      module: './routes'
    },
    menus: [
      {
        text: 'Calendar',
        url: '/calendar',
        icon: 'icon-calendar-alt',
        location: 'mainNavigation'
      },
      {
        text: 'Calendar settings',
        icon: 'icon-calendar-alt',
        location: 'settings',
        scope: 'calendar',
        component: './settings'
      }
    ]
  },
  {
    name: 'deals',
    port: 3003,
    exposes: {
      './routes': './src/routes.tsx',
      './settings': './src/Settings.tsx'
    },
    routes: {
      url: 'http://localhost:3003/remoteEntry.js',
      scope: 'deals',
      module: './routes'
    },
    menus: [
      {
        text: 'Growth Hacking',
        url: '/growthHack',
        icon: 'icon-idea',
        location: 'mainNavigation'
      }
    ]
  },
  {
    name: 'clientPortal',
    port: 3015,
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url: 'http://localhost:3015/remoteEntry.js',
      scope: 'clientPortal',
      module: './routes'
    },
    menus: [
      {
        text: 'Client Portal',
        url: '/settings/client-portal',
        icon: 'icon-car',
        location: 'mainNavigation'
      }
    ]
  },
  {
    name: 'contacts',
    port: 3011,
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url: 'http://localhost:3011/remoteEntry.js',
      scope: 'contacts',
      module: './routes'
    },
    menus: [
      {
        text: 'Contacts',
        url: '/contacts/customer',
        icon: 'icon-users',
        location: 'mainNavigation'
      }
    ]
  },
  {
    name: 'engages',
    port: 3001,
    exposes: {
      './routes': './src/routes.tsx',
      './settings': './src/Settings.tsx'
    },
    routes: {
      url: 'http://localhost:3001/remoteEntry.js',
      scope: 'engages',
      module: './routes'
    },
    menus: [
      {
        text: 'Campaigns',
        url: '/campaigns',
        icon: 'icon-megaphone',
        location: 'mainNavigation'
      },
      {
        text: 'Campaigns settings',
        icon: 'icon-megaphone',
        location: 'settings',
        scope: 'engages',
        component: './settings'
      }
    ]
  },
  {
    name: 'inbox',
    port: 3009,
    exposes: {
      './routes': './src/routes.tsx',
      './settings': './src/Settings.tsx'
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
      },
      {
        text: 'Bookings',
        url: '/bookings',
        icon: 'icon-paste',
        location: 'mainNavigation'
      },
      {
        text: 'Forms',
        url: '/forms',
        icon: 'icon-head-1',
        location: 'mainNavigation'
      },
      {
        text: 'Skills',
        icon: 'icon-file-info-alt',
        location: 'settings',
        scope: 'inbox',
        component: './settings'
      },
      {
        text: 'Channels',
        icon: 'icon-layer-group',
        location: 'settings',
        scope: 'inbox',
        component: './settings'
      },
      {
        text: 'Integrations',
        icon: 'icon-puzzle-piece',
        location: 'settings',
        scope: 'inbox',
        component: './settings'
      },
      {
        text: 'Responses',
        icon: 'icon-files-landscapes',
        location: 'settings',
        scope: 'inbox',
        component: './settings'
      }
    ]
  },
  {
    name: 'knowledgeBase',
    port: 3004,
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url: 'http://localhost:3004/remoteEntry.js',
      scope: 'knowledgeBase',
      module: './routes'
    },
    menus: [
      {
        text: 'Knowledge Base',
        url: '/knowledgeBase',
        icon: 'icon-book-open',
        location: 'mainNavigation'
      }
    ]
  },
  {
    name: 'notifications',
    port: 3014,
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url: 'http://localhost:3014/remoteEntry.js',
      scope: 'notifications',
      module: './routes'
    },
    menus: [
      {
        text: 'notifications',
        url: '/notifications',
        icon: 'icon-book-open',
        location: 'mainNavigation'
      }
    ]
  },
  {
    name: 'dashboard',
    port: 3007,
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url: 'http://localhost:3007/remoteEntry.js',
      scope: 'dashboard',
      module: './routes'
    },
    menus: [
      {
        text: 'Dashboard',
        url: '/dashboard',
        icon: 'icon-dashboard',
        location: 'mainNavigation'
      }
    ]
  },
  {
    name: 'segments',
    port: 3013,
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url: 'http://localhost:3013/remoteEntry.js',
      scope: 'segments',
      module: './routes'
    },
    menus: [
      {
        text: 'Segments',
        url: '/segments',
        icon: 'icon-chart-pie-alt',
        location: 'mainNavigation'
      }
    ]
  },
  {
    name: 'tags',
    port: 3012,
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url: 'http://localhost:3012/remoteEntry.js',
      scope: 'tags',
      module: './routes'
    },
    menus: [
      {
        text: 'Tags',
        url: '/tags',
        icon: 'icon-book-open',
        location: 'mainNavigation'
      }
    ]
  },
  {
    name: 'team',
    port: 3010,
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url: 'http://localhost:3010/remoteEntry.js',
      scope: 'team',
      module: './routes'
    },
    menus: [
      {
        text: 'Team',
        url: '/settings/team',
        icon: 'icon-puzzle-piece',
        location: 'mainNavigation'
      }
    ]
  }
];
