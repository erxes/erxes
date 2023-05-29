window.plugins = [
  {
    name: 'contacts',
    scope: 'contacts',
    exposes: {
      './routes': './src/routes.tsx',
      './activityLog': './src/activityLogs/activityLog.tsx',
      './automation': './src/automations/automation.tsx',
      './contactDetailHeader': './src/customers/containers/LeadState'
    },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-contacts-ui/remoteEntry.js',
      scope: 'contacts',
      module: './routes'
    },
    activityLog: './activityLog',
    automation: './automation',
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
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-contacts-ui/remoteEntry.js'
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
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-inbox-ui/remoteEntry.js',
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
    url: 'https://bg.bichilglobus.mn/js/plugins/plugin-inbox-ui/remoteEntry.js'
  },
  {
    name: 'facebook',
    scope: 'facebook',
    exposes: {
      './routes': './src/routes.tsx',
      './inboxIntegrationSettings':
        './src/containers/UpdateConfigsContainer.tsx',
      './activityLog': './src/containers/ActivityLogsContainer.tsx',
      './inboxConversationDetailRespondBoxMask':
        './src/containers/TagMessageContainer.tsx',
      './inboxConversationDetail':
        './src/containers/post/FbCommentsContainer.tsx'
    },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-facebook-ui/remoteEntry.js',
      scope: 'facebook',
      module: './routes'
    },
    inboxIntegrationSettings: './inboxIntegrationSettings',
    inboxDirectMessage: {
      messagesQuery: {
        query:
          '\n          query facebookConversationMessages(\n            $conversationId: String!\n            $skip: Int\n            $limit: Int\n            $getFirst: Boolean\n          ) {\n            facebookConversationMessages(\n              conversationId: $conversationId,\n              skip: $skip,\n              limit: $limit,\n              getFirst: $getFirst\n            ) {\n              _id\n              content\n              conversationId\n              customerId\n              userId\n              createdAt\n              isCustomerRead\n              internal\n\n              attachments {\n                url\n                name\n                type\n                size\n              }\n\n              user {\n                _id\n                username\n                details {\n                  avatar\n                  fullName\n                  position\n                }\n              }\n\n              customer {\n                _id\n                avatar\n                firstName\n                middleName\n                lastName\n                primaryEmail\n                primaryPhone\n                state\n\n                companies {\n                  _id\n                  primaryName\n                  website\n                }\n\n                customFieldsData\n                tagIds\n              }\n            }\n          }\n        ',
        name: 'facebookConversationMessages',
        integrationKind: 'facebook-messenger'
      },
      countQuery: {
        query:
          '\n          query facebookConversationMessagesCount($conversationId: String!) {\n            facebookConversationMessagesCount(conversationId: $conversationId)\n          }\n        ',
        name: 'facebookConversationMessagesCount',
        integrationKind: 'facebook-messenger'
      }
    },
    inboxIntegrations: [
      {
        name: 'Facebook Post',
        description: 'Connect to Facebook posts right from your Team Inbox',
        inMessenger: false,
        isAvailable: true,
        kind: 'facebook-post',
        logo: '/images/integrations/facebook.png',
        createModal: 'facebook-post',
        createUrl: '/settings/integrations/createFacebook',
        category:
          'All integrations, For support teams, Marketing automation, Social media',
        components: ['inboxConversationDetail']
      },
      {
        name: 'Facebook Messenger',
        description:
          'Connect and manage Facebook Messages right from your Team Inbox',
        inMessenger: false,
        isAvailable: true,
        kind: 'facebook-messenger',
        logo: '/images/integrations/fb-messenger.png',
        createModal: 'facebook-messenger',
        createUrl: '/settings/integrations/createFacebook',
        category:
          'All integrations, For support teams, Messaging, Social media, Conversation',
        components: ['inboxConversationDetailRespondBoxMask']
      }
    ],
    activityLog: './activityLog',
    inboxConversationDetailRespondBoxMask:
      './inboxConversationDetailRespondBoxMask',
    inboxConversationDetail: './inboxConversationDetail',
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-facebook-ui/remoteEntry.js'
  },
  {
    name: 'tags',
    scope: 'tags',
    exposes: {
      './routes': './src/routes.tsx',
      './activityLog': './src/activityLogs/activityLog.tsx'
    },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-tags-ui/remoteEntry.js',
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
    url: 'https://bg.bichilglobus.mn/js/plugins/plugin-tags-ui/remoteEntry.js'
  },
  {
    name: 'cards',
    scope: 'cards',
    url: 'https://bg.bichilglobus.mn/js/plugins/plugin-cards-ui/remoteEntry.js',
    exposes: {
      './routes': './src/routes.tsx',
      './settings': './src/Settings.tsx',
      './propertyGroupForm': './src/propertyGroupForm.tsx',
      './segmentForm': './src/segmentForm.tsx',
      './activityLog': './src/activityLogs/activityLog.tsx',
      './automation': './src/automations/automation.tsx',
      './contactDetailRightSidebar': './src/RightSidebar.tsx'
    },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-cards-ui/remoteEntry.js',
      scope: 'cards',
      module: './routes'
    },
    propertyGroupForm: './propertyGroupForm',
    segmentForm: './segmentForm',
    activityLog: './activityLog',
    automation: './automation',
    contactDetailRightSidebar: './contactDetailRightSidebar',
    menus: [
      {
        text: 'Sales Pipeline',
        url: '/deal',
        icon: 'icon-piggy-bank',
        location: 'mainNavigation',
        permission: 'showDeals'
      },
      {
        text: 'Purchase Pipeline',
        url: '/purchase',
        icon: 'icon-bag-alt',
        location: 'mainNavigation',
        permission: 'showPurchases'
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
        text: 'Purchase Pipelines',
        to: '/settings/boards/purchase',
        image: '/images/icons/erxes-25.png',
        location: 'settings',
        scope: 'cards',
        action: 'purchasesAll',
        permissions: [
          'purchaseBoardsAdd',
          'purchaseBoardsEdit',
          'purchaseBoardsRemove',
          'purchasePipelinesAdd',
          'purchasePipelinesEdit',
          'purchasePipelinesUpdateOrder',
          'purchasePipelinesRemove',
          'purchasePipelinesArchive',
          'purchasePipelinesArchive',
          'purchaseStagesAdd',
          'purchaseStagesEdit',
          'purchaseStagesUpdateOrder',
          'purchaseStagesRemove'
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
  },
  {
    name: 'automations',
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-automations-ui/remoteEntry.js',
      scope: 'automations',
      module: './routes'
    },
    menus: [
      {
        text: 'Automations',
        url: '/automations',
        location: 'mainNavigation',
        icon: 'icon-circular',
        permission: 'showAutomations'
      }
    ],
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-automations-ui/remoteEntry.js'
  },
  {
    name: 'segments',
    scope: 'segments',
    exposes: {
      './routes': './src/routes.tsx',
      './importExportFilterForm': './src/containers/SegmentsForm.tsx',
      './teamMemberSidebarComp': './src/containers/SegmentFilter.tsx'
    },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-segments-ui/remoteEntry.js',
      scope: 'segments',
      module: './routes'
    },
    importExportFilterForm: './importExportFilterForm',
    teamMemberSidebarComp: './teamMemberSidebarComp',
    menus: [
      {
        text: 'Segments',
        url: '/segments',
        icon: 'icon-chart-pie-alt',
        location: 'mainNavigation',
        permission: 'showSegments'
      }
    ],
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-segments-ui/remoteEntry.js'
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
      './contactDetailLeftSidebar': './src/containers/CustomFieldsSection'
    },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-forms-ui/remoteEntry.js',
      scope: 'forms',
      module: './routes'
    },
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
    url: 'https://bg.bichilglobus.mn/js/plugins/plugin-forms-ui/remoteEntry.js'
  },
  {
    name: 'engages',
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-engages-ui/remoteEntry.js',
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
        image: '/images/icons/erxes-08.svg',
        location: 'settings',
        scope: 'engages',
        action: 'engagesAll',
        permissions: ['showEngagesMessages']
      }
    ],
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-engages-ui/remoteEntry.js'
  },
  {
    name: 'logs',
    scope: 'logs',
    exposes: {
      './routes': './src/routes.tsx',
      './contactDetailContent': './src/logs/Activities.tsx'
    },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-logs-ui/remoteEntry.js',
      scope: 'logs',
      module: './routes'
    },
    contactDetailContent: './contactDetailContent',
    menus: [
      {
        text: 'logs',
        to: '/settings/logs',
        image: '/images/icons/erxes-33.png',
        location: 'settings',
        scope: 'logs',
        component: './settings',
        action: '',
        permissions: []
      },
      {
        text: 'Email Deliveries',
        to: '/settings/emailDelivery',
        image: '/images/icons/erxes-27.png',
        location: 'settings',
        scope: 'logs',
        component: './settings',
        action: '',
        permissions: []
      }
    ],
    url: 'https://bg.bichilglobus.mn/js/plugins/plugin-logs-ui/remoteEntry.js'
  },
  {
    name: 'knowledgebase',
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-knowledgebase-ui/remoteEntry.js',
      scope: 'knowledgebase',
      module: './routes'
    },
    menus: [
      {
        text: 'Knowledge Base',
        url: '/knowledgeBase',
        icon: 'icon-book-open',
        location: 'mainNavigation',
        permission: 'showKnowledgeBase'
      }
    ],
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-knowledgebase-ui/remoteEntry.js'
  },
  {
    name: 'notifications',
    exposes: {
      './routes': './src/routes.tsx',
      './settings': './src/containers/Widget.tsx'
    },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-notifications-ui/remoteEntry.js',
      scope: 'notifications',
      module: './routes'
    },
    menus: [
      {
        text: 'notifications',
        url: '/notifications',
        icon: 'icon-book-open',
        location: 'topNavigation',
        scope: 'notifications',
        component: './settings'
      },
      {
        text: 'Notification settings',
        to: '/settings/notifications',
        image: '/images/icons/erxes-11.svg',
        location: 'settings',
        scope: 'notifications'
      }
    ],
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-notifications-ui/remoteEntry.js'
  },
  {
    name: 'chats',
    exposes: {
      './routes': './src/routes.tsx',
      './widget': './src/components/Widget.tsx'
    },
    widget: './widget',
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-chats-ui/remoteEntry.js',
      scope: 'chats',
      module: './routes'
    },
    menus: [
      {
        text: 'Chat Widget',
        url: '/erxes-plugin-chat/widget',
        icon: 'icon-chat-1',
        location: 'topNavigation',
        scope: 'chats',
        component: './widget'
      },
      {
        text: 'Chat',
        url: '/erxes-plugin-chat',
        icon: 'icon-chat-1',
        location: 'mainNavigation',
        permission: 'showChats'
      }
    ],
    url: 'https://bg.bichilglobus.mn/js/plugins/plugin-chats-ui/remoteEntry.js'
  },
  {
    name: 'clientportal',
    scope: 'clientportal',
    exposes: {
      './routes': './src/routes.tsx',
      './cardDetailAction': './src/containers/comments/CardDetailAction.tsx'
    },
    cardDetailAction: './cardDetailAction',
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-clientportal-ui/remoteEntry.js',
      scope: 'clientportal',
      module: './routes'
    },
    menus: [
      {
        text: 'Client Portal',
        to: '/settings/client-portal',
        image: '/images/icons/erxes-32.png',
        location: 'settings',
        scope: 'clientportal',
        action: '',
        permissions: []
      }
    ],
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-clientportal-ui/remoteEntry.js'
  },
  {
    name: 'products',
    scope: 'products',
    exposes: {
      './routes': './src/routes.tsx',
      './extendFormField':
        './src/containers/productCategory/SelectProductCategory.tsx',
      './extendFormFieldChoice': './src/components/product/FormFieldChoice.tsx'
    },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-products-ui/remoteEntry.js',
      scope: 'products',
      module: './routes'
    },
    extendFormField: './extendFormField',
    extendFormFieldChoice: './extendFormFieldChoice',
    menus: [
      {
        text: 'Product and services',
        to: '/settings/product-service/',
        image: '/images/icons/erxes-31.png',
        location: 'settings',
        scope: 'products',
        action: 'productsAll',
        permissions: ['showProducts', 'manageProducts']
      },
      {
        text: 'Configs of Products',
        to: '/settings/products-config/',
        image: '/images/icons/erxes-07.svg',
        location: 'settings',
        scope: 'products',
        action: 'productsAll',
        permissions: ['showProducts', 'manageProducts']
      }
    ],
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-products-ui/remoteEntry.js'
  },
  {
    name: 'dashboard',
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-dashboard-ui/remoteEntry.js',
      scope: 'dashboard',
      module: './routes'
    },
    menus: [
      {
        text: 'Reports',
        url: '/dashboard',
        icon: 'icon-dashboard',
        location: 'mainNavigation',
        permission: 'showDashboards'
      }
    ],
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-dashboard-ui/remoteEntry.js'
  },
  {
    name: 'emailtemplates',
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-emailtemplates-ui/remoteEntry.js',
      scope: 'emailtemplates',
      module: './routes'
    },
    menus: [
      {
        text: 'Email Templates',
        to: '/settings/email-templates',
        image: '/images/icons/erxes-09.svg',
        location: 'settings',
        scope: 'emailtemplates',
        action: 'emailTemplateAll',
        permissions: ['showEmailTemplates']
      }
    ],
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-emailtemplates-ui/remoteEntry.js'
  },
  {
    name: 'exm',
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url: 'https://bg.bichilglobus.mn/js/plugins/plugin-exm-ui/remoteEntry.js',
      scope: 'exm',
      module: './routes'
    },
    menus: [
      {
        text: 'Exm core',
        to: '/erxes-plugin-exm/home',
        image: '/images/icons/erxes-30.png',
        location: 'settings',
        action: '',
        permissions: ['showExms']
      }
    ],
    url: 'https://bg.bichilglobus.mn/js/plugins/plugin-exm-ui/remoteEntry.js'
  },
  {
    name: 'exmfeed',
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-exmfeed-ui/remoteEntry.js',
      scope: 'exmfeed',
      module: './routes'
    },
    menus: [
      {
        text: 'Exm feed',
        url: '/erxes-plugin-exm-feed/home',
        icon: 'icon-list-2',
        location: 'mainNavigation',
        permission: 'showExmActivityFeed'
      }
    ],
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-exmfeed-ui/remoteEntry.js'
  },
  {
    name: 'timeclock',
    scope: 'timeclock',
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-timeclock-ui/remoteEntry.js',
      scope: 'timeclock',
      module: './routes'
    },
    menus: [
      {
        text: 'Timeclocks',
        url: '/timeclocks',
        icon: 'icon-star',
        location: 'mainNavigation'
      }
    ],
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-timeclock-ui/remoteEntry.js'
  },
  {
    name: 'documents',
    scope: 'documents',
    exposes: {
      './routes': './src/routes.tsx',
      './cardDetailAction': './src/containers/CardDetailAction.tsx',
      './productListAction': './src/containers/ProductListAction.tsx'
    },
    cardDetailAction: './cardDetailAction',
    productListAction: './productListAction',
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-documents-ui/remoteEntry.js',
      scope: 'documents',
      module: './routes'
    },
    menus: [
      {
        text: 'Documents',
        to: '/settings/documents',
        image: '/images/icons/erxes-09.svg',
        location: 'settings',
        scope: 'documents',
        action: 'documentsAll',
        permissions: ['manageDocuments']
      }
    ],
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-documents-ui/remoteEntry.js'
  },
  {
    name: 'filemanager',
    scope: 'filemanager',
    exposes: { './routes': './src/routes.tsx' },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-filemanager-ui/remoteEntry.js',
      scope: 'filemanager',
      module: './routes'
    },
    menus: [
      {
        text: 'File Manager',
        url: '/filemanager',
        icon: 'icon-folder-1',
        location: 'mainNavigation',
        permissions: ['showFileManager']
      }
    ],
    url:
      'https://bg.bichilglobus.mn/js/plugins/plugin-filemanager-ui/remoteEntry.js'
  },
  {
    name: 'bichil',
    scope: 'bichil',
    exposes: {
      './routes': './src/routes.tsx',
      './bichilReportTable': './src/containers/report/ReportList.tsx',
      './bichilExportReportBtn': './src/components/report/ExportBtn.tsx'
    },
    routes: {
      url:
        'https://bg.bichilglobus.mn/js/plugins/plugin-bichil-ui/remoteEntry.js',
      scope: 'bichil',
      module: './routes'
    },
    bichilReportTable: './bichilReportTable',
    bichilExportReportBtn: './bichilExportReportBtn',
    menus: [
      {
        text: 'Bichils',
        to: '/bichils',
        image: '/images/icons/erxes-18.svg',
        location: 'settings',
        scope: 'bichil'
      }
    ],
    url: 'https://bg.bichilglobus.mn/js/plugins/plugin-bichil-ui/remoteEntry.js'
  }
];
