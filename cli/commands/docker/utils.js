window.plugins = [
  {
    name: 'contacts',
    scope: 'contacts',
    exposes: {
      './routes': './src/routes.tsx',
      './activityLog': './src/activityLogs/activityLog.tsx',
      './automation': './src/automations/automation.tsx',
      './contactDetailHeader': './src/customers/containers/LeadState',
      './selectRelation': './src/relation/SelectRelation.tsx'
    },
    routes: {
      url:
        'https://staging.erxes.io/js/plugins/plugin-contacts-ui/remoteEntry.js',
      scope: 'contacts',
      module: './routes'
    },
    activityLog: './activityLog',
    automation: './automation',
    selectRelation: './selectRelation',
    contactDetailHeader: './contactDetailHeader',
    menus: [
      {
        text: 'Contacts',
        url: '/contacts/customer',
        icon: 'icon-users',
        location: 'mainNavigation',
        permission: 'showCustomers'
      }
    ],
    url: 'https://staging.erxes.io/js/plugins/plugin-contacts-ui/remoteEntry.js'
  },
  {
    name: 'tags',
    scope: 'tags',
    exposes: {
      './routes': './src/routes.tsx',
      './activityLog': './src/activityLogs/activityLog.tsx'
    },
    routes: {
      url: 'https://staging.erxes.io/js/plugins/plugin-tags-ui/remoteEntry.js',
      scope: 'tags',
      module: './routes'
    },
    activityLog: './activityLog',
    menus: [
      {
        text: 'Tags',
        to: '/tags',
        image: '/images/icons/erxes-18.svg',
        location: 'settings',
        scope: 'tags',
        action: 'tagsAll',
        permissions: ['showTags', 'manageTags']
      }
    ],
    url: 'https://staging.erxes.io/js/plugins/plugin-tags-ui/remoteEntry.js'
  },
  {
    name: 'inbox',
    scope: 'inbox',
    exposes: {
      './routes': './src/routes.tsx',
      './activityLog': './src/activityLogs/activityLog.tsx',
      './automation': './src/automations/automation.tsx',
      './unreadCount': './src/inbox/containers/UnreadCount.tsx',
      './actionForms': './src/settings/integrations/containers/ActionForms'
    },
    routes: {
      url: 'https://staging.erxes.io/js/plugins/plugin-inbox-ui/remoteEntry.js',
      scope: 'inbox',
      module: './routes'
    },
    activityLog: './activityLog',
    automation: './automation',
    actionForms: './actionForms',
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
      },
      {
        text: 'Widget Script Manager',
        to: '/settings/scripts',
        image: '/images/icons/erxes-34.png',
        location: 'settings',
        scope: 'inbox',
        action: 'scriptsAll',
        permissions: ['manageScripts', 'showScripts']
      }
    ],
    customNavigationLabel: [
      { text: 'unreadCount', component: './unreadCount', scope: 'inbox' }
    ],
    url: 'https://staging.erxes.io/js/plugins/plugin-inbox-ui/remoteEntry.js'
  },
  {
    name: 'forms',
    scope: 'forms',
    exposes: {
      './routes': './src/routes.tsx',
      './segmentForm': './src/segmentForm.tsx',
      './importExportUploadForm': './src/components/ColumnChooser',
      './fieldPreview': './src/components/FieldsPreview',
      './formPreview': './src/containers/FieldForm',
      './contactDetailLeftSidebar': './src/containers/CustomFieldsSection',
      './relationForm': './src/containers/RelationForm.tsx'
    },
    routes: {
      url: 'https://staging.erxes.io/js/plugins/plugin-forms-ui/remoteEntry.js',
      scope: 'forms',
      module: './routes'
    },
    relationForm: './relationForm',
    segmentForm: './segmentForm',
    formPreview: './formPreview',
    fieldPreview: './fieldPreview',
    importExportUploadForm: './importExportUploadForm',
    contactDetailLeftSidebar: './contactDetailLeftSidebar',
    menus: [
      {
        text: 'Properties',
        to: '/settings/properties',
        image: '/images/icons/erxes-01.svg',
        location: 'settings',
        scope: 'forms',
        action: 'formsAll',
        permissions: ['showForms', 'manageForms']
      }
    ],
    url: 'https://staging.erxes.io/js/plugins/plugin-forms-ui/remoteEntry.js'
  },
  {
    name: 'cards',
    scope: 'cards',
    url: 'https://staging.erxes.io/js/plugins/plugin-cards-ui/remoteEntry.js',
    exposes: {
      './routes': './src/routes.tsx',
      './settings': './src/Settings.tsx',
      './propertyGroupForm': './src/propertyGroupForm.tsx',
      './segmentForm': './src/segmentForm.tsx',
      './activityLog': './src/activityLogs/activityLog.tsx',
      './automation': './src/automations/automation.tsx',
      './contactDetailRightSidebar': './src/RightSidebar.tsx',
      './selectRelation': './src/common/SelectRelation.tsx'
    },
    routes: {
      url: 'https://staging.erxes.io/js/plugins/plugin-cards-ui/remoteEntry.js',
      scope: 'cards',
      module: './routes'
    },
    propertyGroupForm: './propertyGroupForm',
    segmentForm: './segmentForm',
    activityLog: './activityLog',
    automation: './automation',
    contactDetailRightSidebar: './contactDetailRightSidebar',
    selectRelation: './selectRelation',
    menus: [
      {
        text: 'Sales Pipeline',
        url: '/deal',
        icon: 'icon-piggy-bank',
        location: 'mainNavigation',
        permission: 'showDeals'
      },
      {
        text: 'Task',
        url: '/task',
        icon: 'icon-file-check-alt',
        location: 'mainNavigation',
        permission: 'showTasks'
      },
      {
        text: 'Ticket',
        url: '/ticket',
        icon: 'icon-ticket',
        location: 'mainNavigation',
        permission: 'showTickets'
      },
      {
        text: 'Growth Hacking',
        url: '/growthHack',
        icon: 'icon-idea',
        location: 'mainNavigation',
        permission: 'showGrowthHacks'
      },
      {
        text: 'Sales Pipelines',
        to: '/settings/boards/deal',
        image: '/images/icons/erxes-25.png',
        location: 'settings',
        scope: 'cards',
        action: 'dealsAll',
        permissions: [
          'dealBoardsAdd',
          'dealBoardsEdit',
          'dealBoardsRemove',
          'dealPipelinesAdd',
          'dealPipelinesEdit',
          'dealPipelinesUpdateOrder',
          'dealPipelinesRemove',
          'dealPipelinesArchive',
          'dealPipelinesArchive',
          'dealStagesAdd',
          'dealStagesEdit',
          'dealStagesUpdateOrder',
          'dealStagesRemove'
        ]
      },
      {
        text: 'Task Pipelines',
        to: '/settings/boards/task',
        image: '/images/icons/erxes-13.svg',
        location: 'settings',
        scope: 'cards',
        action: 'tasksAll',
        permissions: [
          'taskBoardsAdd',
          'taskBoardsEdit',
          'taskBoardsRemove',
          'taskPipelinesAdd',
          'taskPipelinesEdit',
          'taskPipelinesUpdateOrder',
          'taskPipelinesRemove',
          'taskPipelinesArchive',
          'taskPipelinesCopied',
          'taskStagesAdd',
          'taskStagesEdit',
          'taskStagesUpdateOrder',
          'taskStagesRemove',
          'tasksAll'
        ]
      },
      {
        text: 'Ticket Pipelines',
        to: '/settings/boards/ticket',
        image: '/images/icons/erxes-19.svg',
        location: 'settings',
        scope: 'cards',
        action: 'ticketsAll',
        permissions: [
          'ticketBoardsAdd',
          'ticketBoardsEdit',
          'ticketBoardsRemove',
          'ticketPipelinesAdd',
          'ticketPipelinesEdit',
          'ticketPipelinesUpdateOrder',
          'ticketPipelinesRemove',
          'ticketPipelinesArchive',
          'ticketPipelinesCopied',
          'ticketStagesAdd',
          'ticketStagesEdit',
          'ticketStagesUpdateOrder',
          'ticketStagesRemove'
        ]
      },
      {
        text: 'Growth Hacking Templates',
        to: '/settings/boards/growthHackTemplate',
        image: '/images/icons/erxes-12.svg',
        location: 'settings',
        scope: 'cards',
        action: 'growthHacksAll',
        permissions: [
          'growthHackTemplatesAdd',
          'growthHackTemplatesEdit',
          'growthHackTemplatesRemove',
          'growthHackTemplatesDuplicate',
          'showGrowthHackTemplates'
        ]
      }
    ]
  }
];
