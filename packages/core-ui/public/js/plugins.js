window.plugins = [
  {
    name: "exmfeed",
    port: 3111,
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      url: "http://localhost:3111/remoteEntry.js",
      scope: "exmfeed",
      module: "./routes",
    },
    menus: [
      {
        text: "Exm feed",
        url: "/erxes-plugin-exm-feed/home",
        icon: "icon-list-2",
        location: "mainNavigation",
        permission: "showExmActivityFeed",
      },
    ],
  },
  {
    name: "chats",
    port: 3110,
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      url: "http://localhost:3110/remoteEntry.js",
      scope: "chats",
      module: "./routes",
    },
    menus: [
      {
        text: "Chat",
        url: "/erxes-plugin-chat/home",
        icon: "icon-cog",
        location: "mainNavigation",
        permission: "showChats",
      },
    ],
  },
  {
    name: 'engages',
    port: 3001,
    exposes: { './routes': './src/routes.tsx' },
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
        location: 'mainNavigation',
        permission: 'showEngagesMessages'
      },
      {
        text: 'Campaign settings',
        to: '/settings/campaign-configs',
        image: '/images/icons/erxes-31.png',
        location: 'settings',
        scope: 'engages',
        action: '',
        permissions: []
      }
    ]
  },
  {
    name: 'inbox',
    port: 3009,
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url: 'http://localhost:3009/remoteEntry.js',
      scope: 'inbox',
      module: './routes'
    },
    menus: [
      {
        text: 'Team Inbox',
        url: '/inbox',
        icon: 'icon-chat',
        location: 'mainNavigation',
        permission: 'showConversations'
      },
      {
        text: 'Bookings',
        url: '/bookings',
        icon: 'icon-paste',
        location: 'mainNavigation',
        permission: 'showIntegrations'
      },
      {
        text: 'Forms',
        url: '/forms',
        icon: 'icon-laptop',
        location: 'mainNavigation',
        permission: 'showForms'
      },
      {
        text: 'Skills',
        to: '/settings/skills',
        image: '/images/icons/erxes-29.png',
        location: 'settings',
        scope: 'inbox',
        action: 'skillTypesAll',
        permissions: [
          'getSkillTypes',
          'getSkill',
          'getSkills',
          'manageSkills',
          'manageSkillTypes'
        ]
      },
      {
        text: 'Channels',
        to: '/settings/channels',
        image: '/images/icons/erxes-05.svg',
        location: 'settings',
        scope: 'inbox',
        action: 'channelsAll',
        permissions: ['showChannels', 'manageChannels']
      },
      {
        text: 'Integrations',
        to: '/settings/integrations',
        image: '/images/icons/erxes-04.svg',
        location: 'settings',
        scope: 'inbox',
        action: 'integrationsAll',
        permissions: [
          'showIntegrations',
          'integrationsCreateMessengerIntegration',
          'integrationsEditMessengerIntegration',
          'integrationsSaveMessengerAppearanceData',
          'integrationsSaveMessengerConfigs',
          'integrationsCreateLeadIntegration',
          'integrationsEditLeadIntegration',
          'integrationsRemove',
          'integrationsArchive',
          'integrationsEdit'
        ]
      },
      {
        text: 'Integrations config',
        to: '/settings/integrations-config',
        image: '/images/icons/erxes-24.svg',
        location: 'settings',
        scope: 'inbox',
        action: 'generalSettingsAll',
        permissions: ['manageGeneralSettings', 'showGeneralSettings']
      },
      {
        text: 'Responses',
        to: '/settings/response-templates',
        image: '/images/icons/erxes-10.svg',
        location: 'settings',
        scope: 'inbox',
        action: 'responseTemplatesAll',
        permissions: ['manageResponseTemplate', 'showResponseTemplates']
      }
    ]
  },
  {
    name: "forms",
    port: 3005,
    exposes: { "./routes": "./src/routes.tsx" },
    routes: {
      url: "http://localhost:3005/remoteEntry.js",
      scope: "forms",
      module: "./routes",
    },
    menus: [
      {
        text: "Properties",
        to: "/settings/properties",
        image: "/images/icons/erxes-01.svg",
        location: "settings",
        scope: "forms",
        action: "",
        permissions: [],
      },
    ],
  },
  {
    name: "logs",
    port: 3040,
    exposes: { "./routes": "./src/routes.tsx" },
    routes: {
      url: "http://localhost:3040/remoteEntry.js",
      scope: "logs",
      module: "./routes",
    },
    menus: [
      {
        text: "Logs",
        to: "/settings/logs",
        image: "/images/icons/erxes-33.png",
        location: "settings",
        scope: "logs",
        component: "./settings",
        action: "",
        permissions: [],
      },
    ],
  },
  {
    name: "contacts",
    port: 3011,
    exposes: { "./routes": "./src/routes.tsx" },
    routes: {
      url: "http://localhost:3011/remoteEntry.js",
      scope: "contacts",
      module: "./routes",
    },
    menus: [
      {
        text: "Contacts",
        url: "/contacts/customer",
        icon: "icon-users",
        location: "mainNavigation",
        permission: "showCustomers",
      },
    ],
  },
  {
    name: "loyalty",
    port: 3002,
    exposes: { "./routes": "./src/routes.tsx", "./sidebar": "./src/containers/Sidebar.tsx", },
    routes: {
      url: "http://localhost:3002/remoteEntry.js",
      scope: "loyalty",
      module: "./routes",
    },
    menus: [
      {
        text: "Loyalty",
        url: "/vouchers",
        icon: "icon-piggybank",
        location: "mainNavigation",
        permission: "showLoyalties",
      },
      {
        text: "Loyalty config",
        to: "/erxes-plugin-loyalty/settings/general",
        image: "/images/icons/erxes-16.svg",
        location: "settings",
        scope: "loyalty",
        action: "loyaltyConfig",
        permissions: ["loyaltyConfig"],
      },
    ],
    customerRightSidebarSection: {
      text: "customerSection",
      component: "./sidebar",
      scope: "loyalty",
    },
    companyRightSidebarSection: {
      text: "companySection",
      component: "./sidebar",
      scope: "loyalty",
    },
    userRightSidebarSection: {
      text: "userSection",
      component: "./sidebar",
      scope: "loyalty",
    },
  },
];
