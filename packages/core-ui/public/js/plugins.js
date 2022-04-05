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
        permission: 'showChats',
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
];
