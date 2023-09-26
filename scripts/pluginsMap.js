module.exports = {
  inbox: {
    ui: {
      name: 'inbox',
      scope: 'inbox',
      exposes: {
        './routes': './src/routes.tsx',
        './activityLog': './src/activityLogs/activityLog.tsx',
        './automation': './src/automations/automation.tsx',
        './unreadCount': './src/inbox/containers/UnreadCount.tsx',
        './actionForms': './src/settings/integrations/containers/ActionForms',
        './emailWidget': './src/inbox/containers/EmailWidget.tsx',
        './integrationDetailsForm': './src/forms/components/CallproEditForm.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-inbox-ui/remoteEntry.js',
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
        },
        {
          text: 'Send an Email',
          url: '/emailWidget',
          icon: 'icon-envelope',
          location: 'topNavigation',
          scope: 'inbox',
          component: './emailWidget'
        }
      ],
      customNavigationLabel: [
        { text: 'unreadCount', component: './unreadCount', scope: 'inbox' }
      ],
      integrationDetailsForm: './integrationDetailsForm',
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-inbox-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        inbox: {
          name: 'inbox',
          description: 'Inbox',
          actions: [
            {
              name: 'inboxAll',
              description: 'All',
              use: [
                'showConversations',
                'changeConversationStatus',
                'assignConversation',
                'conversationMessageAdd',
                'conversationResolveAll'
              ]
            },
            { name: 'showConversations', description: 'Show conversations' },
            {
              name: 'changeConversationStatus',
              description: 'Change conversation status'
            },
            { name: 'assignConversation', description: 'Assign conversation' },
            {
              name: 'conversationMessageAdd',
              description: 'Add conversation message'
            },
            {
              name: 'conversationResolveAll',
              description: 'Resolve all converstaion'
            }
          ]
        },
        integrations: {
          name: 'integrations',
          description: 'Integrations',
          actions: [
            {
              name: 'integrationsAll',
              description: 'All',
              use: [
                'showIntegrations',
                'integrationsCreateMessengerIntegration',
                'integrationsEditMessengerIntegration',
                'integrationsSaveMessengerAppearanceData',
                'integrationsSaveMessengerConfigs',
                'integrationsCreateLeadIntegration',
                'integrationsEditLeadIntegration',
                'integrationsRemove',
                'integrationsArchive',
                'integrationsEdit',
                'integrationsCreateBookingIntegration',
                'integrationsEditBookingIntegration'
              ]
            },
            { name: 'showIntegrations', description: 'Show integrations' },
            {
              name: 'integrationsCreateMessengerIntegration',
              description: 'Create messenger integration'
            },
            {
              name: 'integrationsEditMessengerIntegration',
              description: 'Edit messenger integration'
            },
            {
              name: 'integrationsSaveMessengerAppearanceData',
              description: 'Save messenger appearance data'
            },
            {
              name: 'integrationsSaveMessengerConfigs',
              description: 'Save messenger config'
            },
            {
              name: 'integrationsCreateLeadIntegration',
              description: 'Create lead integration'
            },
            {
              name: 'integrationsEditLeadIntegration',
              description: 'Edit lead integration'
            },
            { name: 'integrationsRemove', description: 'Remove integration' },
            {
              name: 'integrationsArchive',
              description: 'Archive an integration'
            },
            {
              name: 'integrationsEdit',
              description: 'Edit common integration fields'
            },
            {
              name: 'integrationsCreateBookingIntegration',
              description: 'Create booking integration'
            },
            {
              name: 'integrationsEditBookingIntegration',
              description: 'Edit booking integration'
            }
          ]
        },
        skillTypes: {
          name: 'skillTypes',
          description: 'Skill Types',
          actions: [
            {
              name: 'skillTypesAll',
              description: 'All',
              use: [
                'getSkillTypes',
                'createSkillType',
                'updateSkillType',
                'removeSkillType',
                'manageSkillTypes'
              ]
            },
            { name: 'getSkillTypes', description: 'Get skill types' },
            { name: 'createSkillType', description: 'Create skill type' },
            { name: 'updateSkillType', description: 'Update skill type' },
            { name: 'removeSkillType', description: 'Remove skill type' }
          ]
        },
        skills: {
          name: 'skills',
          description: 'Skills',
          actions: [
            {
              name: 'skillsAll',
              description: 'All',
              use: [
                'getSkill',
                'getSkills',
                'createSkill',
                'updateSkill',
                'removeSkill'
              ]
            },
            { name: 'getSkill', description: 'Get skill' },
            { name: 'getSkills', description: 'Get skills' },
            { name: 'createSkill', description: 'Create skill' },
            { name: 'updateSkill', description: 'Update skill' },
            { name: 'removeSkill', description: 'Remove skill' }
          ]
        },
        responseTemplates: {
          name: 'responseTemplates',
          description: 'Response templates',
          actions: [
            {
              name: 'responseTemplatesAll',
              description: 'All',
              use: ['manageResponseTemplate', 'showResponseTemplates']
            },
            {
              name: 'manageResponseTemplate',
              description: 'Manage response template'
            },
            {
              name: 'showResponseTemplates',
              description: 'Show response templates'
            }
          ]
        },
        channels: {
          name: 'channels',
          description: 'Channels',
          actions: [
            {
              name: 'channelsAll',
              description: 'All',
              use: [
                'showChannels',
                'manageChannels',
                'exportChannels',
                'removeChannels'
              ]
            },
            { name: 'manageChannels', description: 'Manage channels' },
            { name: 'removeChannels', description: 'Remove channels' },
            { name: 'showChannels', description: 'Show channel' },
            { name: 'exportChannels', description: 'Export channels' }
          ]
        },
        scripts: {
          name: 'scripts',
          description: 'Scripts',
          actions: [
            {
              name: 'scriptsAll',
              description: 'All',
              use: ['showScripts', 'manageScripts']
            },
            { name: 'manageScripts', description: 'Manage scripts' },
            { name: 'showScripts', description: 'Show scripts' }
          ]
        }
      },
      essyncer: [
        {
          name: 'conversations',
          schema: "{ 'customFieldsData' : <nested> }",
          script:
            "if(ns.indexOf('conversations') > -1) {var createdAt = JSON.stringify(doc.createdAt); var closedAt = JSON.stringify(doc.closedAt); var updatedAt = JSON.stringify(doc.updatedAt); var firstRespondedDate = JSON.stringify(doc.firstRespondedDate); if(createdAt){ doc.numberCreatedAt = Number(new Date(createdAt.replace(/\"/g,''))); } if(closedAt){ doc.numberClosedAt = Number(new Date(closedAt.replace(/\"/g,''))); } if(updatedAt){ doc.numberUpdatedAt= Number(new Date(updatedAt.replace(/\"/g,''))); } if(firstRespondedDate){ doc.numberFirstRespondedDate= Number(new Date(firstRespondedDate.replace(/\"/g,''))); }}"
        },
        { name: 'conversation_messages', schema: '{}', script: '' },
        { name: 'integrations', schema: '{}', script: '' },
        { name: 'channels', schema: '{}', script: '' }
      ]
    }
  },
  automations: {
    ui: {
      name: 'automations',
      scope: 'automations',
      exposes: {
        './routes': './src/routes.tsx',
        './activityLog': './src/activityLogs/index.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-automations-ui/remoteEntry.js',
        scope: 'automations',
        module: './routes'
      },
      activityLog: './activityLog',
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
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-automations-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        automations: {
          name: 'automations',
          description: 'Automations',
          actions: [
            {
              name: 'automationAll',
              description: 'All',
              use: [
                'showAutomations',
                'automationsAdd',
                'automationsEdit',
                'automationsRemove'
              ]
            },
            { name: 'showAutomations', description: 'Show automations' },
            { name: 'automationsAdd', description: 'Add automations' },
            { name: 'automationsEdit', description: 'Edit automations' },
            { name: 'automationsRemove', description: 'Remove automations' }
          ]
        }
      }
    }
  },
  calendar: {
    ui: {
      name: 'calendar',
      exposes: {
        './routes': './src/routes.tsx',
        './settings': './src/Settings.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-calendar-ui/remoteEntry.js',
        scope: 'calendar',
        module: './routes'
      },
      menus: [
        {
          text: 'Calendar',
          url: '/calendar',
          icon: 'icon-calendar-alt',
          location: 'mainNavigation',
          permission: 'showCalendars'
        },
        {
          text: 'Calendar settings',
          to: '/settings/calendars',
          image: '/images/icons/erxes-21.svg',
          location: 'settings',
          scope: 'calendar',
          action: 'calendarsAll',
          permissions: [
            'calendarsAdd',
            'calendarsEdit',
            'calendarsRemove',
            'showCalendars',
            'showCalendarGroups',
            'calendarGroupsAdd',
            'calendarGroupsEdit',
            'calendarGroupsRemove'
          ]
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-calendar-ui/remoteEntry.js'
    }
  },
  calls: {
    ui: {
      name: 'calls',
      scope: 'calls',
      exposes: {
        './routes': './src/routes.tsx',
        './call': './src/containers/Widget.tsx',
        './incomin-call': './src/containers/IncomingCall.tsx',
        './inboxIntegrationForm': './src/components/IntegrationForm.tsx',
        './integrationEditForm': './src/components/IntegrationEditForm.tsx',
        './integrationCustomActions': './src/components/TokenButton.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-calls-ui/remoteEntry.js',
        scope: 'calls',
        module: './routes'
      },
      menus: [
        {
          text: 'Calls',
          url: '/calls',
          icon: 'icon-outgoing-call',
          location: 'topNavigation',
          scope: 'calls',
          component: './call'
        },
        {
          text: 'Incoming calls',
          icon: 'icon-outgoing-call',
          location: 'topNavigation',
          scope: 'calls',
          component: './incomin-call'
        }
      ],
      inboxIntegrationForm: './inboxIntegrationForm',
      invoiceDetailRightSection: './invoiceDetailRightSection',
      integrationEditForm: './integrationEditForm',
      integrationCustomActions: './integrationCustomActions',
      inboxIntegrations: [
        {
          name: 'Grand stream',
          description: 'Configure Grand stream device',
          isAvailable: true,
          kind: 'calls',
          logo: '/images/integrations/grandstream.png',
          createModal: 'grandstream'
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-calls-ui/remoteEntry.js'
    }
  },
  cars: {
    ui: {
      name: 'cars',
      scope: 'cars',
      exposes: {
        './routes': './src/routes.tsx',
        './customerSidebar': './src/sidebars/CustomerSidebar.tsx',
        './companySidebar': './src/sidebars/CompanySidebar.tsx',
        './dealSidebar': './src/sidebars/DealSidebar.tsx',
        './selectRelation': './src/containers/SelectRelation.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cars-ui/remoteEntry.js',
        scope: 'cars',
        module: './routes'
      },
      selectRelation: './selectRelation',
      menus: [
        {
          text: 'Plugin Car',
          url: '/cars',
          location: 'mainNavigation',
          icon: 'icon-car',
          permission: 'showCars'
        }
      ],
      customerRightSidebarSection: [
        {
          text: 'customerSection',
          component: './customerSidebar',
          scope: 'cars'
        }
      ],
      companyRightSidebarSection: [
        { text: 'companySection', component: './companySidebar', scope: 'cars' }
      ],
      dealRightSidebarSection: [
        { text: 'dealSection', component: './dealSidebar', scope: 'cars' }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cars-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        cars: {
          name: 'cars',
          description: 'Cars',
          actions: [
            {
              name: 'all',
              description: 'All',
              use: ['showCars', 'manageCars']
            },
            { name: 'showCars', description: 'Show cars' },
            { name: 'manageCars', description: 'Manage cars' }
          ]
        }
      },
      essyncer: [{ name: 'cars', schema: '{}', script: '' }]
    }
  },
  cards: {
    ui: {
      name: 'cards',
      scope: 'cards',
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cards-ui/remoteEntry.js',
      exposes: {
        './routes': './src/routes.tsx',
        './settings': './src/Settings.tsx',
        './propertyGroupForm': './src/propertyGroupForm.tsx',
        './segmentForm': './src/segmentForm.tsx',
        './activityLog': './src/activityLogs/activityLog.tsx',
        './automation': './src/automations/automation.tsx',
        './contactDetailRightSidebar': './src/RightSidebar.tsx',
        './selectRelation': './src/common/SelectRelation.tsx',
        './invoiceDetailRightSection': './src/common/Item.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cards-ui/remoteEntry.js',
        scope: 'cards',
        module: './routes'
      },
      propertyGroupForm: './propertyGroupForm',
      segmentForm: './segmentForm',
      activityLog: './activityLog',
      automation: './automation',
      contactDetailRightSidebar: './contactDetailRightSidebar',
      invoiceDetailRightSection: './invoiceDetailRightSection',
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
          text: 'Purchases Pipeline',
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
          text: 'Purchases Pipelines',
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
    api: {
      permissions: {
        deals: {
          name: 'deals',
          description: 'Deals',
          actions: [
            {
              name: 'dealsAll',
              description: 'All',
              use: [
                'showDeals',
                'dealBoardsAdd',
                'dealBoardsEdit',
                'dealBoardsRemove',
                'dealPipelinesAdd',
                'dealPipelinesEdit',
                'dealPipelinesUpdateOrder',
                'dealPipelinesWatch',
                'dealPipelinesRemove',
                'dealPipelinesArchive',
                'dealPipelinesCopied',
                'dealStagesAdd',
                'dealStagesEdit',
                'dealStagesUpdateOrder',
                'dealStagesRemove',
                'dealsAdd',
                'dealsEdit',
                'dealsRemove',
                'dealsWatch',
                'dealsArchive',
                'dealsSort',
                'exportDeals',
                'dealUpdateTimeTracking'
              ]
            },
            { name: 'showDeals', description: 'Show deals' },
            { name: 'dealBoardsAdd', description: 'Add deal board' },
            { name: 'dealBoardsRemove', description: 'Remove deal board' },
            { name: 'dealPipelinesAdd', description: 'Add deal pipeline' },
            { name: 'dealPipelinesEdit', description: 'Edit deal pipeline' },
            {
              name: 'dealPipelinesRemove',
              description: 'Remove deal pipeline'
            },
            {
              name: 'dealPipelinesArchive',
              description: 'Archive deal pipeline'
            },
            {
              name: 'dealPipelinesCopied',
              description: 'Duplicate deal pipeline'
            },
            {
              name: 'dealPipelinesUpdateOrder',
              description: 'Update pipeline order'
            },
            { name: 'dealPipelinesWatch', description: 'Deal pipeline watch' },
            { name: 'dealStagesAdd', description: 'Add deal stage' },
            { name: 'dealStagesEdit', description: 'Edit deal stage' },
            {
              name: 'dealStagesUpdateOrder',
              description: 'Update stage order'
            },
            { name: 'dealStagesRemove', description: 'Remove deal stage' },
            { name: 'dealsAdd', description: 'Add deal' },
            { name: 'dealsEdit', description: 'Edit deal' },
            { name: 'dealsRemove', description: 'Remove deal' },
            { name: 'dealsWatch', description: 'Watch deal' },
            {
              name: 'dealsArchive',
              description: 'Archive all deals in a specific stage'
            },
            {
              name: 'dealsSort',
              description: 'Sort all deals in a specific stage'
            },
            { name: 'exportDeals', description: 'Export deals' },
            {
              name: 'dealUpdateTimeTracking',
              description: 'Update time tracking'
            }
          ]
        },
        purchases: {
          name: 'purchases',
          description: 'Purchases',
          actions: [
            {
              name: 'purchasesAll',
              description: 'All',
              use: [
                'showPurchases',
                'purchaseBoardsAdd',
                'purchaseBoardsEdit',
                'purchaseBoardsRemove',
                'purchasePipelinesAdd',
                'purchasePipelinesEdit',
                'purchasePipelinesUpdateOrder',
                'purchasePipelinesWatch',
                'purchasePipelinesRemove',
                'purchasePipelinesArchive',
                'purchasePipelinesCopied',
                'purchaseStagesAdd',
                'purchaseStagesEdit',
                'purchaseStagesUpdateOrder',
                'purchaseStagesRemove',
                'purchasesAdd',
                'purchasesEdit',
                'purchasesRemove',
                'purchasesWatch',
                'purchasesArchive',
                'purchasesSort',
                'exportPurchases',
                'purchaseUpdateTimeTracking'
              ]
            },
            { name: 'showPurchases', description: 'Show purchases' },
            { name: 'purchaseBoardsAdd', description: 'Add purchase board' },
            {
              name: 'purchaseBoardsRemove',
              description: 'Remove purchase board'
            },
            {
              name: 'purchasePipelinesAdd',
              description: 'Add purchase pipeline'
            },
            {
              name: 'purchasePipelinesEdit',
              description: 'Edit purchase pipeline'
            },
            {
              name: 'purchasePipelinesRemove',
              description: 'Remove purchase pipeline'
            },
            {
              name: 'purchasePipelinesArchive',
              description: 'Archive purchase pipeline'
            },
            {
              name: 'purchasePipelinesCopied',
              description: 'Duplicate purchase pipeline'
            },
            {
              name: 'purchasePipelinesUpdateOrder',
              description: 'Update pipeline order'
            },
            {
              name: 'purchasePipelinesWatch',
              description: 'purchase pipeline watch'
            },
            { name: 'purchaseStagesAdd', description: 'Add purchase stage' },
            { name: 'purchaseStagesEdit', description: 'Edit purchase stage' },
            {
              name: 'purchaseStagesUpdateOrder',
              description: 'Update stage order'
            },
            {
              name: 'purchaseStagesRemove',
              description: 'Remove purchase stage'
            },
            { name: 'purchasesAdd', description: 'Add purchase' },
            { name: 'purchasesEdit', description: 'Edit purchase' },
            { name: 'purchasesRemove', description: 'Remove purchase' },
            { name: 'purchasesWatch', description: 'Watch purchase' },
            {
              name: 'purchasesArchive',
              description: 'Archive all purchases in a specific stage'
            },
            {
              name: 'purchasesSort',
              description: 'Sort all purchases in a specific stage'
            },
            { name: 'exportpurchases', description: 'Export purchases' },
            {
              name: 'purchaseUpdateTimeTracking',
              description: 'Update time tracking'
            }
          ]
        },
        tickets: {
          name: 'tickets',
          description: 'Tickets',
          actions: [
            {
              name: 'ticketsAll',
              description: 'All',
              use: [
                'showTickets',
                'ticketBoardsAdd',
                'ticketBoardsEdit',
                'ticketBoardsRemove',
                'ticketPipelinesAdd',
                'ticketPipelinesEdit',
                'ticketPipelinesUpdateOrder',
                'ticketPipelinesWatch',
                'ticketPipelinesRemove',
                'ticketPipelinesArchive',
                'ticketPipelinesCopied',
                'ticketStagesAdd',
                'ticketStagesEdit',
                'ticketStagesUpdateOrder',
                'ticketStagesRemove',
                'ticketsAdd',
                'ticketsEdit',
                'ticketsRemove',
                'ticketsWatch',
                'ticketsArchive',
                'ticketsSort',
                'exportTickets',
                'ticketUpdateTimeTracking'
              ]
            },
            { name: 'showTickets', description: 'Show tickets' },
            { name: 'ticketBoardsAdd', description: 'Add ticket board' },
            { name: 'ticketBoardsEdit', description: 'Edit ticket board' },
            { name: 'ticketBoardsRemove', description: 'Remove ticket board' },
            { name: 'ticketPipelinesAdd', description: 'Add ticket pipeline' },
            {
              name: 'ticketPipelinesEdit',
              description: 'Edit ticket pipeline'
            },
            {
              name: 'ticketPipelinesRemove',
              description: 'Remove ticket pipeline'
            },
            {
              name: 'ticketPipelinesArchive',
              description: 'Archive ticket pipeline'
            },
            {
              name: 'ticketPipelinesCopied',
              description: 'Duplicate ticket pipeline'
            },
            {
              name: 'ticketPipelinesWatch',
              description: 'Ticket pipeline watch'
            },
            {
              name: 'ticketPipelinesUpdateOrder',
              description: 'Update pipeline order'
            },
            { name: 'ticketStagesAdd', description: 'Add ticket stage' },
            { name: 'ticketStagesEdit', description: 'Edit ticket stage' },
            {
              name: 'ticketStagesUpdateOrder',
              description: 'Update stage order'
            },
            { name: 'ticketStagesRemove', description: 'Remove ticket stage' },
            { name: 'ticketsAdd', description: 'Add ticket' },
            { name: 'ticketsEdit', description: 'Edit ticket' },
            { name: 'ticketsRemove', description: 'Remove ticket' },
            { name: 'ticketsWatch', description: 'Watch ticket' },
            {
              name: 'ticketsArchive',
              description: 'Archive all tickets in a specific stage'
            },
            {
              name: 'ticketsSort',
              description: 'Sort all tickets in a specific stage'
            },
            { name: 'exportTickets', description: 'Export tickets' },
            {
              name: 'ticketUpdateTimeTracking',
              description: 'Update time tracking'
            }
          ]
        },
        growthHacks: {
          name: 'growthHacks',
          description: 'Growth hacking',
          actions: [
            {
              name: 'growthHacksAll',
              description: 'All',
              use: [
                'showGrowthHacks',
                'growthHackBoardsAdd',
                'growthHackBoardsEdit',
                'growthHackBoardsRemove',
                'growthHackPipelinesAdd',
                'growthHackPipelinesEdit',
                'growthHackPipelinesUpdateOrder',
                'growthHackPipelinesWatch',
                'growthHackPipelinesRemove',
                'growthHackPipelinesArchive',
                'growthHackPipelinesCopied',
                'growthHackStagesAdd',
                'growthHackStagesEdit',
                'growthHackStagesUpdateOrder',
                'growthHackStagesRemove',
                'growthHacksAdd',
                'growthHacksEdit',
                'growthHacksRemove',
                'growthHacksWatch',
                'growthHacksArchive',
                'growthHacksSort',
                'growthHackTemplatesAdd',
                'growthHackTemplatesEdit',
                'growthHackTemplatesRemove',
                'growthHackTemplatesDuplicate',
                'showGrowthHackTemplates'
              ]
            },
            { name: 'showGrowthHacks', description: 'Show growth hacks' },
            {
              name: 'growthHackBoardsAdd',
              description: 'Add growth hacking board'
            },
            {
              name: 'growthHackBoardsRemove',
              description: 'Remove growth hacking board'
            },
            {
              name: 'growthHackPipelinesAdd',
              description: 'Add growth hacking pipeline'
            },
            {
              name: 'growthHackPipelinesEdit',
              description: 'Edit growth hacking pipeline'
            },
            {
              name: 'growthHackPipelinesRemove',
              description: 'Remove growth hacking pipeline'
            },
            {
              name: 'growthHackPipelinesArchive',
              description: 'Archive growth hacking pipeline'
            },
            {
              name: 'growthHackPipelinesCopied',
              description: 'Copied growth hacking pipeline'
            },
            {
              name: 'growthHackPipelinesWatch',
              description: 'Growth hacking pipeline watch'
            },
            {
              name: 'growthHackPipelinesUpdateOrder',
              description: 'Update pipeline order'
            },
            {
              name: 'growthHackStagesAdd',
              description: 'Add growth hacking stage'
            },
            {
              name: 'growthHackStagesEdit',
              description: 'Edit growth hacking stage'
            },
            {
              name: 'growthHackStagesUpdateOrder',
              description: 'Update stage order'
            },
            {
              name: 'growthHackStagesRemove',
              description: 'Remove growth hacking stage'
            },
            { name: 'growthHacksAdd', description: 'Add growth hacking' },
            { name: 'growthHacksEdit', description: 'Edit growth hacking' },
            { name: 'growthHacksRemove', description: 'Remove growth hacking' },
            { name: 'growthHacksWatch', description: 'Watch growth hacking' },
            {
              name: 'growthHacksArchive',
              description: 'Archive all growth hacks in a specific stage'
            },
            {
              name: 'growthHacksSort',
              description: 'Sort all growth hacks in a specific stage'
            },
            {
              name: 'growthHackTemplatesAdd',
              description: 'Add growth hacking template'
            },
            {
              name: 'growthHackTemplatesEdit',
              description: 'Edit growth hacking template'
            },
            {
              name: 'growthHackTemplatesRemove',
              description: 'Remove growth hacking template'
            },
            {
              name: 'growthHackTemplatesDuplicate',
              description: 'Duplicate growth hacking template'
            },
            {
              name: 'showGrowthHackTemplates',
              description: 'Show growth hacking template'
            }
          ]
        },
        tasks: {
          name: 'tasks',
          description: 'Tasks',
          actions: [
            {
              name: 'tasksAll',
              description: 'All',
              use: [
                'showTasks',
                'taskBoardsAdd',
                'taskBoardsEdit',
                'taskBoardsRemove',
                'taskPipelinesAdd',
                'taskPipelinesEdit',
                'taskPipelinesUpdateOrder',
                'taskPipelinesWatch',
                'taskPipelinesRemove',
                'taskPipelinesArchive',
                'taskPipelinesCopied',
                'taskStagesAdd',
                'taskStagesEdit',
                'taskStagesUpdateOrder',
                'taskStagesRemove',
                'tasksAdd',
                'tasksEdit',
                'tasksRemove',
                'tasksWatch',
                'tasksArchive',
                'tasksSort',
                'taskUpdateTimeTracking',
                'exportTasks'
              ]
            },
            { name: 'showTasks', description: 'Show tasks' },
            { name: 'taskBoardsAdd', description: 'Add task board' },
            { name: 'taskBoardsRemove', description: 'Remove task board' },
            { name: 'taskPipelinesAdd', description: 'Add task pipeline' },
            { name: 'taskPipelinesEdit', description: 'Edit task pipeline' },
            {
              name: 'taskPipelinesRemove',
              description: 'Remove task pipeline'
            },
            {
              name: 'taskPipelinesArchive',
              description: 'Archive task pipeline'
            },
            {
              name: 'taskPipelinesCopied',
              description: 'Duplicate task pipeline'
            },
            { name: 'taskPipelinesWatch', description: 'Task pipeline watch' },
            {
              name: 'taskPipelinesUpdateOrder',
              description: 'Update pipeline order'
            },
            { name: 'taskStagesAdd', description: 'Add task stage' },
            { name: 'taskStagesEdit', description: 'Edit task stage' },
            {
              name: 'taskStagesUpdateOrder',
              description: 'Update stage order'
            },
            { name: 'taskStagesRemove', description: 'Remove task stage' },
            { name: 'tasksAdd', description: 'Add task' },
            { name: 'tasksEdit', description: 'Edit task' },
            { name: 'tasksRemove', description: 'Remove task' },
            { name: 'tasksWatch', description: 'Watch task' },
            {
              name: 'tasksArchive',
              description: 'Archive all tasks in a specific stage'
            },
            {
              name: 'tasksSort',
              description: 'Sort all tasks in a specific stage'
            },
            {
              name: 'taskUpdateTimeTracking',
              description: 'Update time tracking'
            },
            { name: 'exportTasks', description: 'Export tasks' }
          ]
        }
      },
      essyncer: [
        {
          name: 'deals',
          schema:
            "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
          script:
            "if(ns.indexOf('deals') > -1) { if (doc.productsData) { var productsDataString = JSON.stringify(doc.productsData); var amount = 0; var productsData = JSON.parse(productsDataString); for (var i = 0; i < productsData.length; i++){ amount = amount + productsData[i].amount; } doc.amount = amount; } } "
        },
        {
          name: 'tickets',
          schema:
            "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
          script: ''
        },
        {
          name: 'tasks',
          schema:
            "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
          script: ''
        },
        {
          name: 'purchases',
          schema:
            "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
          script:
            "if(ns.indexOf('purchases') > -1) { if (doc.productsData) { var productsDataString = JSON.stringify(doc.productsData); var amount = 0; var productsData = JSON.parse(productsDataString); for (var i = 0; i < productsData.length; i++){ amount = amount + productsData[i].amount; } doc.amount = amount; } } "
        },
        { name: 'stages', schema: '{}', script: '' },
        { name: 'pipelines', schema: '{}', script: '' }
      ]
    }
  },
  chats: {
    ui: {
      name: 'chats',
      exposes: {
        './routes': './src/routes.tsx',
        './widget': './src/containers/Widget.tsx'
      },
      widget: './widget',
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-chats-ui/remoteEntry.js',
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
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-chats-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        chats: {
          name: 'chats',
          description: 'Chats',
          actions: [
            {
              name: 'chatsAll',
              description: 'All',
              use: ['showChats', 'manageChats']
            },
            { name: 'showChats', description: 'Show chats' },
            { name: 'manageChats', description: 'Manage Chats' }
          ]
        }
      }
    }
  },
  clientportal: {
    ui: {
      name: 'clientportal',
      scope: 'clientportal',
      exposes: {
        './routes': './src/routes.tsx',
        './cardDetailAction': './src/containers/comments/CardDetailAction.tsx',
        './fieldConfig': './src/containers/FieldConfigForm.tsx'
      },
      cardDetailAction: './cardDetailAction',
      fieldConfig: './fieldConfig',
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-clientportal-ui/remoteEntry.js',
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
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-clientportal-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        clientPortal: {
          name: 'clientPortal',
          description: 'Client portal',
          actions: [
            {
              name: 'clientPortalAll',
              description: 'All',
              use: ['manageClientPortal', 'removeClientPortal', 'updateUser']
            },
            { name: 'manageClientPortal', description: 'Manage client portal' },
            { name: 'removeClientPortal', description: 'Remove client portal' },
            { name: 'updateUser', description: 'Update user' }
          ]
        }
      }
    }
  },
  contacts: {
    ui: {
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
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-contacts-ui/remoteEntry.js',
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
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-contacts-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        companies: {
          name: 'companies',
          description: 'Companies',
          actions: [
            {
              name: 'companiesAll',
              description: 'All',
              use: [
                'companiesAdd',
                'companiesEdit',
                'companiesRemove',
                'companiesMerge',
                'showCompanies',
                'showCompaniesMain',
                'exportCompanies'
              ]
            },
            { name: 'companiesAdd', description: 'Add companies' },
            { name: 'companiesEdit', description: 'Edit companies' },
            { name: 'companiesRemove', description: 'Remove companies' },
            { name: 'companiesMerge', description: 'Merge companies' },
            { name: 'showCompanies', description: 'Show companies' },
            { name: 'showCompaniesMain', description: 'Show companies main' },
            {
              name: 'exportCompanies',
              description: 'Export companies to xls file'
            }
          ]
        },
        customers: {
          name: 'customers',
          description: 'Customers',
          actions: [
            {
              name: 'customersAll',
              description: 'All',
              use: [
                'showCustomers',
                'customersAdd',
                'customersEdit',
                'customersMerge',
                'customersRemove',
                'exportCustomers',
                'customersChangeState'
              ]
            },
            { name: 'exportCustomers', description: 'Export customers' },
            { name: 'showCustomers', description: 'Show customers' },
            { name: 'customersAdd', description: 'Add customer' },
            { name: 'customersEdit', description: 'Edit customer' },
            { name: 'customersMerge', description: 'Merge customers' },
            { name: 'customersRemove', description: 'Remove customers' },
            {
              name: 'customersChangeState',
              description: 'Change customer state'
            }
          ]
        }
      },
      essyncer: [
        {
          name: 'customers',
          schema:
            "{'createdAt': { 'type': 'date' }, 'organizationId': { 'type': 'keyword' }, 'state': { 'type': 'keyword' }, 'primaryEmail': { 'type': 'text', 'analyzer': 'uax_url_email_analyzer' }, 'primaryPhone': { 'type': 'text', 'fields': { 'raw': { 'type': 'keyword' } } }, 'primaryAddress': { 'type': 'text', 'fields': { 'raw': { 'type': 'keyword' } } }, 'code': { 'type': 'text', 'fields': { 'raw': { 'type': 'keyword' } } }, 'integrationId': { 'type': 'keyword' }, 'relatedIntegrationIds': { 'type': 'keyword' }, 'scopeBrandIds': { 'type': 'keyword' }, 'ownerId': { 'type': 'keyword' }, 'position': { 'type': 'keyword' }, 'leadStatus': { 'type': 'keyword' }, 'tagIds': { 'type': 'keyword' }, 'companyIds': { 'type': 'keyword' }, 'mergedIds': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'emailValidationStatus': { 'type': 'keyword' }, 'customFieldsData': <nested>, 'trackedData': <nested>}",
          script:
            "if (ns.indexOf('customers') > -1) { if (doc.urlVisits) { delete doc.urlVisits } if (doc.trackedDataBackup) { delete doc.trackedDataBackup } if (doc.customFieldsDataBackup) { delete doc.customFieldsDataBackup } if (doc.messengerData) { delete doc.messengerData }}"
        },
        {
          name: 'companies',
          schema:
            "{ 'createdAt': { 'type': 'date' }, 'primaryEmail': { 'type': 'text', 'analyzer': 'uax_url_email_analyzer' }, 'primaryName': { 'type': 'text', 'fields': { 'raw': { 'type': 'keyword' } } }, 'primaryAddress': { 'type': 'text', 'fields': { 'raw': { 'type': 'keyword' } } }, 'scopeBrandIds': { 'type': 'keyword' }, 'plan': { 'type': 'keyword' }, 'industry': { 'type': 'keyword' }, 'parentCompanyId': { 'type': 'keyword' }, 'ownerId': { 'type': 'keyword' }, 'tagIds': { 'type': 'keyword' }, 'mergedIds': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'businessType': { 'type': 'keyword' }, 'customFieldsData' : <nested>, 'trackedData': <nested> }",
          script: ''
        }
      ]
    }
  },
  dashboard: {
    ui: {
      name: 'dashboard',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-dashboard-ui/remoteEntry.js',
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
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-dashboard-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        dashboards: {
          name: 'dashboards',
          description: 'Dashboards',
          actions: [
            {
              name: 'dashboardsAll',
              description: 'All',
              use: [
                'showDashboards',
                'dashboardAdd',
                'dashboardEdit',
                'dashboardRemove',
                'dashboardItemAdd',
                'dashboardItemEdit',
                'dashboardItemRemove'
              ]
            },
            { name: 'dashboardAdd', description: 'Add dashboard' },
            { name: 'dashboardEdit', description: 'Edit dashboard' },
            { name: 'dashboardRemove', description: 'Remove dashboard' },
            { name: 'dashboardItemAdd', description: 'Add dashboard item' },
            { name: 'dashboardItemEdit', description: 'Edit dashboard item' },
            {
              name: 'dashboardItemRemove',
              description: 'Remove dashboard item'
            },
            { name: 'showDashboards', description: 'Show dashboards' }
          ]
        }
      }
    }
  },
  ebarimt: {
    ui: {
      name: 'ebarimt',
      exposes: {
        './routes': './src/routes.tsx',
        './response': './src/response.tsx'
      },
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-ebarimt-ui/remoteEntry.js',
      scope: 'ebarimt',
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-ebarimt-ui/remoteEntry.js',
        scope: 'ebarimt',
        module: './routes'
      },
      menus: [
        {
          text: 'Put Responses',
          url: '/put-responses',
          icon: 'icon-lamp',
          location: 'mainNavigation',
          permission: 'managePutResponses'
        },
        {
          text: 'Ebarimt config',
          to: '/erxes-plugin-ebarimt/settings/general',
          image: '/images/icons/erxes-04.svg',
          location: 'settings',
          scope: 'ebarimt',
          action: 'syncEbarimtConfig',
          permission: 'syncEbarimtConfig'
        }
      ],
      layout: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-ebarimt-ui/remoteEntry.js',
        scope: 'ebarimt',
        module: './response'
      }
    },
    api: {
      permissions: {
        ebarimt: {
          name: 'ebarimt',
          description: 'Ebarimt',
          actions: [
            {
              name: 'ebarimtAll',
              description: 'All',
              use: ['managePutResponses', 'syncEbarimtConfig']
            },
            { name: 'managePutResponses', description: 'Manage Put responses' },
            { name: 'syncEbarimtConfig', description: 'Manage ebarimt config' }
          ]
        }
      }
    }
  },
  emailtemplates: {
    ui: {
      name: 'emailtemplates',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-emailtemplates-ui/remoteEntry.js',
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
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-emailtemplates-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        emailTemplates: {
          name: 'emailTemplates',
          description: 'Email template',
          actions: [
            {
              name: 'emailTemplateAll',
              description: 'All',
              use: [
                'showEmailTemplates',
                'manageEmailTemplate',
                'removeEmailTemplate'
              ]
            },
            {
              name: 'manageEmailTemplate',
              description: 'Manage email template'
            },
            {
              name: 'removeEmailTemplate',
              description: 'Remove email template'
            },
            { name: 'showEmailTemplates', description: 'Show email templates' }
          ]
        }
      }
    }
  },
  engages: {
    ui: {
      name: 'engages',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-engages-ui/remoteEntry.js',
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
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-engages-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        engages: {
          name: 'engages',
          description: 'Campaigns',
          actions: [
            {
              name: 'engagesAll',
              description: 'All',
              use: [
                'engageMessageSetLiveManual',
                'engageMessageSetPause',
                'engageMessageSetLive',
                'showEngagesMessages',
                'engageMessageAdd',
                'engageMessageEdit',
                'engageMessageRemove'
              ]
            },
            {
              name: 'engageMessageSetLive',
              description: 'Set an auto campaign live'
            },
            { name: 'engageMessageSetPause', description: 'Pause a campaign' },
            {
              name: 'engageMessageSetLiveManual',
              description: 'Set a manual campaign live'
            },
            { name: 'engageMessageRemove', description: 'Remove a campaign' },
            { name: 'engageMessageEdit', description: 'Edit a campaign' },
            { name: 'engageMessageAdd', description: 'Add a campaign' },
            { name: 'showEngagesMessages', description: 'See campaign list' }
          ]
        }
      },
      essyncer: [{ name: 'engage_messages', schema: '{}', script: '' }]
    }
  },
  exm: {
    ui: {
      name: 'exm',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-exm-ui/remoteEntry.js',
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
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-exm-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        exm: {
          name: 'exm',
          description: 'Exm core',
          actions: [
            { name: 'showExms', description: 'Show exm' },
            { name: 'manageExms', description: 'Manage exm' },
            {
              name: 'exmsAll',
              description: 'All',
              use: ['showExms', 'manageExms']
            }
          ]
        }
      }
    }
  },
  exmfeed: {
    ui: {
      name: 'exmfeed',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-exmfeed-ui/remoteEntry.js',
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
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-exmfeed-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        engages: {
          name: 'exmfeed',
          description: 'Exm feed',
          actions: [
            {
              name: 'showExmActivityFeed',
              description: 'Show exm activity feed'
            },
            {
              name: 'manageExmActivityFeed',
              description: 'Manage exm activity feed'
            },
            {
              name: 'exmActivityFeedAll',
              description: 'All',
              use: ['showExmActivityFeed', 'manageExmActivityFeed']
            }
          ]
        }
      }
    }
  },
  forms: {
    ui: {
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
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-forms-ui/remoteEntry.js',
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
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-forms-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        forms: {
          name: 'forms',
          description: 'Form',
          actions: [
            {
              name: 'formsAll',
              description: 'All',
              use: ['showForms', 'manageForms']
            },
            { name: 'manageForms', description: 'Manage forms' },
            { name: 'showForms', description: 'Show forms' }
          ]
        }
      },
      essyncer: [
        { name: 'forms', schema: '{}', script: '' },
        { name: 'fields', schema: '{}', script: '' },
        { name: 'fields_groups', schema: '{}', script: '' },
        {
          name: 'form_submissions',
          schema: "{ 'value': { 'type': 'text' } }",
          script: ''
        }
      ]
    }
  },
  integrations: {},
  internalnotes: {},
  knowledgebase: {
    ui: {
      name: 'knowledgebase',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-knowledgebase-ui/remoteEntry.js',
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
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-knowledgebase-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        knowledgeBase: {
          name: 'knowledgeBase',
          description: 'KnowledgeBase',
          actions: [
            {
              name: 'knowledgeBaseAll',
              description: 'All',
              use: ['showKnowledgeBase', 'manageKnowledgeBase']
            },
            {
              name: 'manageKnowledgeBase',
              description: 'Manage knowledge base'
            },
            { name: 'showKnowledgeBase', description: 'Show knowledge base' }
          ]
        }
      }
    }
  },
  logs: {
    ui: {
      name: 'logs',
      scope: 'logs',
      exposes: {
        './routes': './src/routes.tsx',
        './contactDetailContent': './src/logs/Activities.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-logs-ui/remoteEntry.js',
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
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-logs-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        logs: {
          name: 'logs',
          description: 'Logs',
          actions: [{ name: 'viewLogs', description: 'View logs' }]
        }
      }
    }
  },
  loyalties: {
    ui: {
      name: 'loyalties',
      scope: 'loyalties',
      exposes: {
        './routes': './src/routes.tsx',
        './customerSidebar': './src/containers/CustomerSidebar.tsx',
        './companySidebar': './src/containers/CompanySidebar.tsx',
        './userSidebar': './src/containers/UserSidebar.tsx',
        './automation': './src/automations/automation.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loyalties-ui/remoteEntry.js',
        scope: 'loyalties',
        module: './routes'
      },
      automation: './automation',
      menus: [
        {
          text: 'Loyalties',
          url: '/vouchers',
          icon: 'icon-piggybank',
          location: 'mainNavigation',
          permission: 'showLoyalties'
        },
        {
          text: 'Loyalties config',
          to: '/erxes-plugin-loyalty/settings/general',
          image: '/images/icons/erxes-16.svg',
          location: 'settings',
          scope: 'loyalties',
          action: 'loyaltyConfig',
          permissions: ['manageLoyalties', 'showLoyalties']
        }
      ],
      customerRightSidebarSection: [
        {
          text: 'customerSection',
          component: './customerSidebar',
          scope: 'loyalties'
        }
      ],
      companyRightSidebarSection: [
        {
          text: 'companySection',
          component: './companySidebar',
          scope: 'loyalties'
        }
      ],
      userRightSidebarSection: [
        { text: 'userSection', component: './userSidebar', scope: 'loyalties' }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loyalties-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        loyalties: {
          name: 'loyalties',
          description: 'Loyalties',
          actions: [
            {
              name: 'loyaltyAll',
              description: 'All',
              use: ['showLoyalties', 'manageLoyalties']
            },
            { name: 'showLoyalties', description: 'Show loyalties' },
            { name: 'manageLoyalties', description: 'Manage loyalties' }
          ]
        }
      }
    }
  },
  notifications: {
    ui: {
      name: 'notifications',
      exposes: {
        './routes': './src/routes.tsx',
        './settings': './src/containers/Widget.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-notifications-ui/remoteEntry.js',
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
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-notifications-ui/remoteEntry.js'
    }
  },
  webhooks: {
    ui: {
      name: 'webhooks',
      scope: 'webhooks',
      exposes: {
        './routes': './src/routes.tsx',
        './automation': './src/automations/automations.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-webhooks-ui/remoteEntry.js',
        scope: 'webhooks',
        module: './routes'
      },
      automation: './automation',
      menus: [
        {
          text: 'Outgoing webhooks',
          to: '/settings/webhooks',
          image: '/images/icons/erxes-11.svg',
          location: 'settings',
          scope: 'webhooks',
          action: 'webhooksAll',
          permissions: ['showWebhooks']
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-webhooks-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        webhooks: {
          name: 'webhooks',
          description: 'Webhooks',
          actions: [
            {
              name: 'webhooksAll',
              description: 'All',
              use: ['showWebhooks', 'manageWebhooks']
            },
            { name: 'showWebhooks', description: 'Show webhooks' },
            { name: 'manageWebhooks', description: 'Manage webhooks' }
          ]
        }
      }
    }
  },
  pos: {
    ui: {
      name: 'pos',
      scope: 'pos',
      exposes: {
        './routes': './src/routes.tsx',
        './invoiceDetailRightSection':
          './src/orders/containers/InvoiceDetail.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-pos-ui/remoteEntry.js',
        scope: 'pos',
        module: './routes'
      },
      invoiceDetailRightSection: './invoiceDetailRightSection',
      menus: [
        {
          text: 'Pos Orders',
          url: '/pos-orders',
          icon: 'icon-lamp',
          location: 'mainNavigation',
          permission: 'showPos'
        },
        {
          text: 'POS',
          to: '/pos',
          image: '/images/icons/erxes-05.svg',
          location: 'settings',
          scope: 'pos',
          action: 'posConfig',
          permissions: ['showPos']
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-pos-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        pos: {
          name: 'pos',
          description: 'POS',
          actions: [
            {
              name: 'posAll',
              description: 'All',
              use: ['managePos', 'showPos']
            },
            { name: 'managePos', description: 'Manage POS' },
            { name: 'showPos', description: 'Show' }
          ]
        }
      },
      essyncer: [
        {
          name: 'pos_orders',
          schema:
            "{'items': <nested>, 'customerId': { 'type': 'keyword' }, 'customerType': { 'type': 'keyword' }, 'ownerId': { 'type': 'keyword' }}",
          script: ''
        }
      ]
    }
  },
  products: {
    ui: {
      name: 'products',
      scope: 'products',
      exposes: {
        './routes': './src/routes.tsx',
        './extendFormField':
          './src/containers/productCategory/SelectProductCategory.tsx',
        './extendFormFieldChoice':
          './src/components/product/FormFieldChoice.tsx',
        './propertyGroupForm': './src/propertyGroupForm.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-products-ui/remoteEntry.js',
        scope: 'products',
        module: './routes'
      },
      extendFormField: './extendFormField',
      extendFormFieldChoice: './extendFormFieldChoice',
      propertyGroupForm: './propertyGroupForm',
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
          to: '/settings/uoms-manage/',
          image: '/images/icons/erxes-07.svg',
          location: 'settings',
          scope: 'products',
          action: 'productsAll',
          permissions: ['showProducts', 'manageProducts']
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-products-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        products: {
          name: 'products',
          description: 'Products',
          actions: [
            {
              name: 'productsAll',
              description: 'All',
              use: [
                'showProducts',
                'manageProducts',
                'productsMerge',
                'removeProducts'
              ]
            },
            { name: 'manageProducts', description: 'Manage products' },
            { name: 'removeProducts', description: 'Remove products' },
            { name: 'showProducts', description: 'Show products' },
            { name: 'productsMerge', description: 'Merge products' }
          ]
        }
      },
      essyncer: [
        {
          name: 'products',
          schema:
            "{ 'code': { 'type': 'keyword' }, 'name': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'order': { 'type': 'keyword' }, 'description': { 'type': 'keyword' }, 'tagIds': { 'type': 'keyword' }, 'categoryId': { 'type': 'keyword' }, 'type': { 'type': 'keyword' }, 'taxCode': { 'type': 'keyword' }, 'taxType': { 'type': 'keyword' }, 'vendorId': { 'type': 'keyword' }, 'customFieldsData': <nested>, 'barcodes': { 'type': 'keyword' } }",
          script: ''
        }
      ]
    }
  },
  reactions: {},
  segments: {
    ui: {
      name: 'segments',
      scope: 'segments',
      exposes: {
        './routes': './src/routes.tsx',
        './importExportFilterForm': './src/containers/SegmentsForm.tsx',
        './teamMemberSidebarComp': './src/containers/SegmentFilter.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-segments-ui/remoteEntry.js',
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
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-segments-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        segments: {
          name: 'segments',
          description: 'Segments',
          actions: [
            {
              name: 'segmentsAll',
              description: 'All',
              use: ['showSegments', 'manageSegments']
            },
            { name: 'manageSegments', description: 'Manage segments' },
            { name: 'showSegments', description: 'Show segments list' }
          ]
        }
      }
    }
  },
  syncerkhet: {
    ui: {
      name: 'syncerkhet',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-syncerkhet-ui/remoteEntry.js',
        scope: 'syncerkhet',
        module: './routes'
      },
      menus: [
        {
          text: 'Sync Erkhet',
          to: '/erxes-plugin-sync-erkhet/settings/general',
          image: '/images/icons/erxes-04.svg',
          location: 'settings',
          scope: 'syncerkhet',
          action: 'syncErkhetConfig',
          permission: 'syncErkhetConfig'
        },
        {
          text: 'Sync Erkhet',
          url: '/sync-erkhet-history',
          icon: 'icon-file-check-alt',
          location: 'mainNavigation',
          scope: 'syncerkhet',
          permission: 'syncErkhetConfig'
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-syncerkhet-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        syncerkhet: {
          name: 'erkhet',
          description: 'Erkhet',
          actions: [
            { name: 'syncErkhetConfig', description: 'Manage erkhet config' }
          ]
        }
      }
    }
  },
  tags: {
    ui: {
      name: 'tags',
      scope: 'tags',
      exposes: {
        './routes': './src/routes.tsx',
        './activityLog': './src/activityLogs/activityLog.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tags-ui/remoteEntry.js',
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
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tags-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        tags: {
          name: 'tags',
          description: 'Tags',
          actions: [
            {
              name: 'tagsAll',
              description: 'All',
              use: ['showTags', 'manageTags']
            },
            { name: 'manageTags', description: 'Manage tags' },
            { name: 'showTags', description: 'Show tags' }
          ]
        }
      },
      essyncer: [{ name: 'tags', schema: '{}', script: '' }]
    }
  },
  salesplans: {
    ui: {
      name: 'salesplans',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-salesplans-ui/remoteEntry.js',
        scope: 'salesplans',
        module: './routes'
      },
      menus: [
        {
          text: 'Sales Plans',
          to: '/salesplans/labels',
          image: '/images/icons/erxes-31.png',
          location: 'settings',
          scope: 'salesplans',
          action: ''
        },
        {
          text: 'Sales Plans',
          url: '/sales-plans/day-labels',
          icon: 'icon-file-check-alt',
          location: 'mainNavigation',
          scope: 'salesplans',
          permission: 'showSalesPlans'
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-salesplans-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        salesplans: {
          name: 'salesplans',
          description: 'Sales Plans',
          actions: [
            {
              name: 'salesplansAll',
              description: 'All',
              use: ['showSalesPlans', 'manageSalesPlans']
            },
            {
              name: 'manageSalesPlans',
              description: 'Manage Sales Plans',
              use: ['showSalesPlans']
            },
            { name: 'showSalesPlans', description: 'Show Sales Plans' }
          ]
        }
      }
    }
  },
  processes: {
    ui: {
      name: 'processes',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-processes-ui/remoteEntry.js',
        scope: 'processes',
        module: './routes'
      },
      menus: [
        {
          text: 'Processes',
          to: '/processes/jobs',
          image: '/images/icons/erxes-31.png',
          location: 'settings',
          scope: 'processes',
          action: '',
          permissions: ['showJobs', 'manageJobs']
        },
        {
          text: 'Processes',
          url: '/processes/overallWorks',
          icon: 'icon-file-check-alt',
          location: 'mainNavigation',
          scope: 'processes',
          permission: 'showWorks'
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-processes-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        processes: {
          name: 'processes',
          description: 'Processes',
          actions: [
            {
              name: 'processesAll',
              description: 'All',
              use: ['showJobs', 'manageJobs', 'showWorks', 'manageWorks']
            },
            { name: 'showJobs', description: 'Show Jobs' },
            { name: 'manageJobs', description: 'Manage Jobs' },
            { name: 'showWorks', description: 'Show Works' },
            { name: 'manageWorks', description: 'Manage Works' }
          ]
        }
      }
    }
  },
  inventories: {
    ui: {
      name: 'inventories',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-inventories-ui/remoteEntry.js',
        scope: 'inventories',
        module: './routes'
      },
      menus: [
        {
          text: 'Remainders',
          url: '/inventories/remainders',
          icon: 'icon-box',
          location: 'mainNavigation',
          scope: 'inventories',
          action: 'inventoriesAll',
          permissions: ['showProducts', 'manageProducts']
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-inventories-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        inventories: {
          name: 'inventories',
          description: 'Inventories',
          actions: [
            {
              name: 'inventoriesAll',
              description: 'All',
              use: ['manageRemainders']
            },
            { name: 'manageRemainder', description: 'Manage remainders' }
          ]
        }
      }
    }
  },
  posclient: {},
  webbuilder: {
    ui: {
      name: 'webbuilder',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-webbuilder-ui/remoteEntry.js',
        scope: 'webbuilder',
        module: './routes'
      },
      menus: [
        {
          text: 'X Builder',
          url: '/xbuilder',
          icon: 'icon-window-grid',
          location: 'mainNavigation',
          permission: 'showWebbuilder'
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-webbuilder-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        webbuilder: {
          name: 'webbuilder',
          description: 'Webbuilder',
          actions: [
            {
              name: 'webbuilderAll',
              description: 'All',
              use: ['showWebbuilder', 'manageWebbuilder']
            },
            { name: 'showWebbuilder', description: 'Show webbuilder' },
            { name: 'manageWebbuilder', description: 'Manage webbuilder' }
          ]
        }
      }
    }
  },
  payment: {
    ui: {
      name: 'payment',
      scope: 'payment',
      exposes: {
        './routes': './src/routes.tsx',
        './SelectPayments': './src/containers/SelectPayments.tsx',
        './invoiceSection': './src/containers/invoice/InvoiceSection.tsx',
        './paymentConfig': './src/containers/paymentConfig/Form.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-payment-ui/remoteEntry.js',
        scope: 'payment',
        module: './routes'
      },
      selectPayments: './SelectPayments',
      paymentConfig: './paymentConfig',
      invoiceSection: './invoiceSection',
      menus: [
        {
          text: 'Invoices',
          url: '/payment/invoices',
          icon: 'icon-list',
          location: 'mainNavigation',
          permission: 'showInvoices'
        },
        {
          text: 'Payments',
          to: '/settings/payments',
          image: '/images/icons/erxes-18.svg',
          location: 'settings',
          scope: 'payment',
          action: 'paymentsAll',
          permissions: ['showPayments']
        }
      ],
      dealRightSidebarSection: [
        {
          text: 'invoiceSection',
          component: './invoiceSection',
          scope: 'payment'
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-payment-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        payments: {
          name: 'payments',
          description: 'Payments',
          actions: [
            {
              name: 'paymentsAll',
              description: 'All',
              use: [
                'paymentAdd',
                'paymentEdit',
                'paymentRemove',
                'showPayments'
              ]
            },
            { name: 'paymentAdd', description: 'Add payments' },
            { name: 'paymentEdit', description: 'Edit payments' },
            { name: 'paymentRemove', description: 'Remove payments' },
            { name: 'showPayments', description: 'Show payments' }
          ]
        },
        invoices: {
          name: 'invoices',
          description: 'Invoices',
          actions: [
            { name: 'invoicesAll', description: 'All', use: ['showInvoices'] },
            { name: 'showInvoices', description: 'Show invoices' }
          ]
        }
      }
    }
  },
  imap: {
    ui: {
      name: 'imap',
      scope: 'imap',
      exposes: {
        './routes': './src/routes.tsx',
        './inboxIntegrationSettings':
          './src/components/IntegrationSettings.tsx',
        './inboxIntegrationForm': './src/components/IntegrationForm.tsx',
        './inboxConversationDetail': './src/components/ConversationDetail.tsx',
        './activityLog': './src/components/ActivityLog.tsx',
        './integrationDetailsForm': './src/components/IntegrationEditForm.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-imap-ui/remoteEntry.js',
        scope: 'imap',
        module: './routes'
      },
      inboxIntegrationSettings: './inboxIntegrationSettings',
      inboxIntegrationForm: './inboxIntegrationForm',
      inboxConversationDetail: './inboxConversationDetail',
      inboxIntegrations: [
        {
          name: 'IMAP',
          description:
            'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
          inMessenger: false,
          isAvailable: true,
          kind: 'imap',
          logo: '/images/integrations/email.png',
          createModal: 'imap',
          category:
            'All integrations, For support teams, Marketing automation, Email marketing',
          components: ['inboxConversationDetail']
        }
      ],
      integrationDetailsForm: './integrationDetailsForm',
      activityLog: './activityLog',
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-imap-ui/remoteEntry.js'
    }
  },
  block: {
    ui: {
      name: 'block',
      scope: 'block',
      exposes: {
        './routes': './src/routes.tsx',
        './customerSidebar': './src/containers/CustomerSideBar.tsx',
        './activityLog': './src/activityLogs/activityLog.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-block-ui/remoteEntry.js',
        scope: 'block',
        module: './routes'
      },
      activityLog: './activityLog',
      menus: [
        {
          text: 'Blocks',
          to: '/block/list',
          image: '/images/icons/erxes-18.svg',
          location: 'settings'
        }
      ],
      customerRightSidebarSection: [
        {
          text: 'customerSection',
          component: './customerSidebar',
          scope: 'block'
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-block-ui/remoteEntry.js'
    }
  },
  assets: {
    ui: {
      name: 'assets',
      scope: 'assets',
      exposes: {
        './routes': './src/routes.tsx',
        './selectWithAsset': './src/common/SelectWithAssets.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-assets-ui/remoteEntry.js',
        scope: 'assets',
        module: './routes'
      },
      formsExtraFields: [
        { scope: 'assets', component: './selectWithAsset', type: 'asset' }
      ],
      menus: [
        {
          text: 'Assets',
          to: '/settings/assets/',
          image: '/images/icons/erxes-18.svg',
          location: 'settings',
          scope: 'assets',
          action: 'assetsAll',
          permissions: ['showAssets', 'manageAssets']
        },
        {
          text: 'Asset & Movements',
          url: '/asset-movements',
          icon: 'icon-piggybank',
          location: 'mainNavigation',
          action: 'assetsAll',
          permissions: ['showAssets', 'manageAssets']
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-assets-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        products: {
          name: 'assets',
          description: 'Assets',
          actions: [
            {
              name: 'assetsAll',
              description: 'All',
              use: ['showAssets', 'manageAssets', 'assetsMerge']
            },
            {
              name: 'manageAssets',
              description: 'Manage assets',
              use: ['showAssets']
            },
            { name: 'showAssets', description: 'Show assets' },
            { name: 'assetsMerge', description: 'Merge assets' },
            {
              name: 'assetsAssignKbArticles',
              description: 'Assign knowledgebase articles'
            }
          ]
        }
      }
    }
  },
  riskassessment: {
    ui: {
      name: 'riskassessment',
      scope: 'riskassessment',
      exposes: {
        './routes': './src/routes.tsx',
        './cardSideBarSection':
          './src/assessments/section/containers/Section.tsx',
        './selectVistors': './src/Visitors.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-riskassessment-ui/remoteEntry.js',
        scope: 'riskassessment',
        module: './routes'
      },
      formsExtraFields: [
        {
          scope: 'riskassessment',
          component: './selectVistors',
          type: 'riskAssessmentVisitors'
        }
      ],
      menus: [
        {
          text: 'Risk Assessments',
          to: '/settings/risk-indicators',
          image: '/images/icons/erxes-18.svg',
          location: 'settings',
          scope: 'riskassessment',
          action: 'riskAssessmentAll',
          permissions: ['showRiskAssessment', 'manageRiskAssessment']
        },
        {
          text: 'Operations',
          to: '/settings/operations',
          image: '/images/icons/erxes-18.svg',
          location: 'settings',
          scope: 'riskassessment',
          action: 'riskAssessmentAll',
          permissions: ['showRiskAssessment', 'manageRiskAssessment']
        },
        {
          text: 'Risk Assessments',
          url: '/risk-assessments',
          icon: 'icon-followers',
          location: 'mainNavigation',
          action: 'riskAssessmentAll',
          permissions: ['showRiskAssessment', 'manageRiskAssessment']
        }
      ],
      dealRightSidebarSection: [
        {
          text: 'riskAssessmentSection',
          component: './cardSideBarSection',
          scope: 'riskassessment',
          action: 'riskAssessmentAll',
          permissions: ['showRiskAssessment', 'manageRiskAssessment']
        }
      ],
      ticketRightSidebarSection: [
        {
          text: 'riskAssessmentSection',
          component: './cardSideBarSection',
          scope: 'riskassessment',
          action: 'riskAssessmentAll',
          permissions: ['showRiskAssessment', 'manageRiskAssessment']
        }
      ],
      taskRightSidebarSection: [
        {
          text: 'riskAssessmentSection',
          component: './cardSideBarSection',
          scope: 'riskassessment',
          action: 'riskAssessmentAll',
          permissions: ['showRiskAssessment', 'manageRiskAssessment']
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-riskassessment-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        riskAssessment: {
          name: 'riskAssessment',
          description: 'Risk Assessment',
          actions: [
            {
              name: 'riskAssessmentAll',
              description: 'All',
              use: ['showRiskAssessment', 'manageRiskAssessment']
            },
            {
              name: 'manageRiskAssessment',
              description: 'Manage Risk Assessment',
              use: ['showRiskAssessment']
            },
            { name: 'showRiskAssessment', description: 'Show Risk Assessment' }
          ]
        }
      }
    }
  },
  forum: {
    ui: {
      name: 'forum',
      scope: 'forum',
      exposes: {
        './routes': './src/routes.tsx',
        './settings': './src/Settings.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-forum-ui/remoteEntry.js',
        scope: 'forum',
        module: './routes'
      },
      menus: [
        {
          text: 'Forums',
          url: '/forums',
          icon: 'icon-idea',
          location: 'mainNavigation'
        },
        {
          text: 'Categories',
          to: '/forums/categories',
          image: '/images/icons/erxes-18.svg',
          location: 'settings',
          scope: 'forum',
          action: '',
          permissions: []
        },
        {
          text: 'Permission Groups',
          to: '/forums/permission-groups',
          image: '/images/icons/erxes-18.svg',
          location: 'settings',
          scope: 'forum',
          action: '',
          permissions: []
        },
        {
          text: 'Subscription Products',
          to: '/forums/subscription-products',
          image: '/images/icons/erxes-18.svg',
          location: 'settings',
          scope: 'forum',
          action: '',
          permissions: []
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-forum-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        categories: {
          name: 'forumCategories',
          description: 'Forum categories',
          actions: [
            {
              name: 'forumCategoriesAll',
              description: 'All forum category actions',
              use: [
                'forumCreateCategory',
                'forumPatchCategory',
                'forumDeleteCategory',
                'forumForceDeleteCategory'
              ]
            },
            {
              name: 'forumCreateCategory',
              description: 'Create forum categories'
            },
            {
              name: 'forumPatchCategory',
              description: 'Edit forum categories'
            },
            {
              name: 'forumDeleteCategory',
              description: 'Delete forum categories'
            },
            {
              name: 'forumForceDeleteCategory',
              description: 'Force delete forum categories'
            }
          ]
        },
        posts: {
          name: 'forumPosts',
          description: 'Forum posts',
          actions: [
            {
              name: 'forumPostsAll',
              description: 'All forum post actions',
              use: [
                'forumCreatePost',
                'forumPatchPost',
                'forumDeletePost',
                'forumPostDraft',
                'forumPostPublish',
                'forumPostSetFeatured'
              ]
            },
            { name: 'forumCreatePost', description: 'Create forum posts' },
            { name: 'forumPatchPost', description: 'Edit forum posts' },
            { name: 'forumDeletePost', description: 'Delete forum posts' },
            {
              name: 'forumPostDraft',
              description: 'Turn published forum posts into drafts'
            },
            { name: 'forumPostPublish', description: 'Publish forum posts' },
            {
              name: 'forumPostSetFeatured',
              description: 'Featured/unfeature forum posts'
            }
          ]
        },
        comments: {
          name: 'forumComments',
          description: 'Forum comments',
          actions: [
            {
              name: 'postsAll',
              description: 'All forum comment actions',
              use: [
                'forumCreatePost',
                'forumPatchPost',
                'forumDeletePost',
                'forumPostDraft',
                'forumPostPublish'
              ]
            },
            {
              name: 'forumCreateComment',
              description: 'Create forum comments'
            },
            { name: 'forumUpdateComment', description: 'Edit forum comments' },
            { name: 'forumDeleteComment', description: 'Delete forum comments' }
          ]
        }
      }
    }
  },
  documents: {
    ui: {
      name: 'documents',
      scope: 'documents',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-documents-ui/remoteEntry.js',
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
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-documents-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        documents: {
          name: 'documents',
          description: 'Documents',
          actions: [
            {
              name: 'documentsAll',
              description: 'All',
              use: ['manageDocuments', 'removeDocuments', 'showDocuments']
            },
            { name: 'manageDocuments', description: 'Manage documents' },
            { name: 'removeDocuments', description: 'Remove documents' },
            { name: 'showDocuments', description: 'Show documents' }
          ]
        }
      }
    }
  },
  pricing: {
    ui: {
      name: 'pricing',
      scope: 'pricing',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-pricing-ui/remoteEntry.js',
        scope: 'pricing',
        module: './routes'
      },
      menus: [
        {
          text: 'Pricing',
          to: '/pricing/plans',
          image: '/images/icons/erxes-06.svg',
          location: 'settings',
          scope: 'pricing',
          action: 'allPricing',
          permissions: ['showPricing', 'managePricing']
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-pricing-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        pricing: {
          name: 'pricing',
          description: 'Pricing',
          actions: [
            {
              name: 'allPricing',
              description: 'All Pricing',
              use: ['showPricing', 'managePricing']
            },
            {
              name: 'managePricing',
              description: 'Manage Pricing',
              use: ['showPricing']
            },
            { name: 'showPricing', description: 'Show Pricing' }
          ]
        }
      }
    }
  },
  timeclock: {
    ui: {
      name: 'timeclock',
      scope: 'timeclock',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-timeclock-ui/remoteEntry.js',
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
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-timeclock-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        timeclock: {
          name: 'timeclock',
          description: 'Timeclock',
          actions: [
            {
              name: 'timeclocksAll',
              description: 'All',
              use: ['showTimeclocks', 'manageTimeclocks']
            },
            { name: 'manageTimeclocks', description: 'Manage timeclocks' },
            { name: 'showTimeclocks', description: 'Show timeclocks' }
          ]
        }
      }
    }
  },
  zalo: {
    ui: {
      name: 'zalo',
      scope: 'zalo',
      exposes: {
        './routes': './src/routes.tsx',
        './inboxIntegrationSettings':
          './src/containers/IntergrationConfigs.tsx',
        './inboxConversationDetail': './src/components/ConversationDetail.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-zalo-ui/remoteEntry.js',
        scope: 'zalo',
        module: './routes'
      },
      inboxIntegrationSettings: './inboxIntegrationSettings',
      inboxConversationDetail: './inboxConversationDetail',
      inboxDirectMessage: {
        messagesQuery: {
          query:
            '\n        query zaloConversationMessages(\n          $conversationId: String!\n          $skip: Int\n          $limit: Int\n          $getFirst: Boolean\n        ) {\n          zaloConversationMessages(\n            conversationId: $conversationId,\n            skip: $skip,\n            limit: $limit,\n            getFirst: $getFirst\n          ) {\n            _id\n            content\n            conversationId\n            customerId\n            userId\n            createdAt\n            isCustomerRead\n            \n            attachments {\n              thumbnail\n              type\n              url\n              name\n              description\n              duration\n              coordinates\n            }\n\n            user {\n              _id\n              username\n              details {\n                avatar\n                fullName\n                position\n              }\n            }\n\n            customer {\n              _id\n              avatar\n              firstName\n              middleName\n              lastName\n              primaryEmail\n              primaryPhone\n              state\n\n              companies {\n                _id\n                primaryName\n                website\n              }\n\n              customFieldsData\n              tagIds\n            }\n          }\n        }\n      ',
          name: 'zaloConversationMessages',
          integrationKind: 'zalo'
        },
        countQuery: {
          query:
            '\n        query zaloConversationMessagesCount($conversationId: String!) {\n          zaloConversationMessagesCount(conversationId: $conversationId)\n        }\n      ',
          name: 'zaloConversationMessagesCount',
          integrationKind: 'zalo'
        }
      },
      inboxIntegrations: [
        {
          name: 'Zalo',
          description:
            'Please write integration description on plugin config file',
          isAvailable: true,
          kind: 'zalo',
          logo: '/images/integrations/zalo.png',
          createUrl: '/settings/integrations/createZalo',
          category:
            'All integrations, For support teams, Marketing automation, Email marketing'
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-zalo-ui/remoteEntry.js'
    }
  },
  facebook: {
    ui: {
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
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-facebook-ui/remoteEntry.js',
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
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-facebook-ui/remoteEntry.js'
    }
  },
  filemanager: {
    ui: {
      name: 'filemanager',
      scope: 'filemanager',
      exposes: {
        './routes': './src/routes.tsx',
        './fileChooserSection': './src/containers/file/CardFolderChooser.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-filemanager-ui/remoteEntry.js',
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
      dealRightSidebarSection: [
        {
          text: 'fileChooserSection',
          component: './fileChooserSection',
          scope: 'filemanager'
        }
      ],
      ticketRightSidebarSection: [
        {
          text: 'fileChooserSection',
          component: './fileChooserSection',
          scope: 'filemanager'
        }
      ],
      taskRightSidebarSection: [
        {
          text: 'fileChooserSection',
          component: './fileChooserSection',
          scope: 'filemanager'
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-filemanager-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        filemanager: {
          name: 'filemanager',
          description: 'File manager',
          actions: [
            { name: 'showFilemanager', description: 'Show file manager' },
            { name: 'filemanagerFolderSave', description: 'Create folder' },
            { name: 'filemanagerFileCreate', description: 'Create file' }
          ]
        }
      }
    }
  },
  khanbank: {
    ui: {
      name: 'khanbank',
      scope: 'khanbank',
      exposes: {
        './routes': './src/routes.tsx',
        './widget': './src/modules/corporateGateway/components/Widget.tsx'
      },
      widget: './widget',
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-khanbank-ui/remoteEntry.js',
        scope: 'khanbank',
        module: './routes'
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
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-khanbank-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        khanbankConfigs: {
          name: 'khanbankConfigs',
          description: 'Khanbank Configs',
          actions: [
            {
              name: 'khanbankConfigsAll',
              description: 'All',
              use: [
                'khanbankConfigsAdd',
                'khanbankConfigsEdit',
                'khanbankConfigsRemove',
                'khanbankConfigsShow'
              ]
            },
            { name: 'khanbankConfigsAdd', description: 'Add new config' },
            { name: 'khanbankConfigsEdit', description: 'Edit config' },
            { name: 'khanbankConfigsRemove', description: 'Remove config' },
            { name: 'khanbankConfigsShow', description: 'Show configs' }
          ]
        },
        khanbankAccounts: {
          name: 'khanbankAccounts',
          description: 'Khanbank Accounts',
          actions: [
            {
              name: 'khanbankAccountsAll',
              description: 'All',
              use: ['khanbankAccountDetail', 'khanbankAccounts']
            },
            {
              name: 'khanbankAccountDetail',
              description: 'Show Khanbank Account detail'
            },
            { name: 'khanbankAccounts', description: 'Show Khanbank accounts' }
          ]
        },
        khanbankTransactions: {
          name: 'khanbankTransactions',
          description: 'Khanbank Transactions',
          actions: [
            {
              name: 'khanbankTransactionsAll',
              description: 'All',
              use: ['khanbankTransactionsShow', 'khanbankTransfer']
            },
            {
              name: 'khanbankTransactionsShow',
              description: 'Show Khanbank transactions'
            },
            {
              name: 'khanbankTransfer',
              description: 'Create Khanbank transactions'
            }
          ]
        }
      }
    }
  },
  productplaces: {
    ui: {
      name: 'productplaces',
      exposes: {
        './routes': './src/routes.tsx',
        './response': './src/response.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-productplaces-ui/remoteEntry.js',
        scope: 'productplaces',
        module: './routes'
      },
      menus: [
        {
          text: 'Product Places',
          to: '/erxes-plugin-product-places/settings/stage',
          image: '/images/icons/erxes-04.svg',
          location: 'settings',
          scope: 'productplaces',
          action: 'productPlacesConfig',
          permission: 'productPlacesConfig'
        }
      ],
      layout: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-productplaces-ui/remoteEntry.js',
        scope: 'productplaces',
        module: './response'
      },
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-productplaces-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        productplaces: {
          name: 'productplaces',
          description: 'Product Places',
          actions: [
            {
              name: 'productPlacesConfig',
              description: 'Manage productplaces config'
            }
          ]
        }
      }
    }
  },
  ecommerce: {},
  grants: {
    ui: {
      name: 'grants',
      scope: 'grants',
      exposes: {
        './routes': './src/routes.tsx',
        './cardSideBarSection': './src/section/containers/Section.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-grants-ui/remoteEntry.js',
        scope: 'grants',
        module: './routes'
      },
      menus: [
        {
          text: 'Grants',
          url: '/grants/requests',
          icon: 'icon-followers',
          location: 'mainNavigation'
        },
        {
          text: 'Grants Configs',
          to: '/settings/grants-configs',
          image: '/images/icons/erxes-18.svg',
          location: 'settings',
          scope: 'grants'
        }
      ],
      dealRightSidebarSection: [
        {
          text: 'grantsSection',
          component: './cardSideBarSection',
          scope: 'grants',
          withDetail: true
        }
      ],
      ticketRightSidebarSection: [
        {
          text: 'grantsSection',
          component: './cardSideBarSection',
          scope: 'grants',
          withDetail: true
        }
      ],
      taskRightSidebarSection: [
        {
          text: 'grantsSection',
          component: './cardSideBarSection',
          scope: 'grants',
          withDetail: true
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-grants-ui/remoteEntry.js'
    }
  },
  loans: {
    ui: {
      name: 'loans',
      exposes: {
        './routes': './src/routes.tsx',
        './contractSection':
          './src/contracts/components/common/ContractSection.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loans-ui/remoteEntry.js',
        scope: 'loans',
        module: './routes'
      },
      menus: [
        {
          text: 'Loan Contract',
          url: '/erxes-plugin-loan/contract-list',
          icon: 'icon-medal',
          location: 'mainNavigation',
          permissions: ['showContracts'],
          permission: 'showContracts'
        },
        {
          text: 'Contract types',
          image: '/images/icons/erxes-01.svg',
          to: '/erxes-plugin-loan/contract-types/',
          action: 'loanConfig',
          scope: 'loans',
          location: 'settings',
          permissions: ['showContracts'],
          permission: 'showContracts'
        },
        {
          text: 'Insurance types',
          image: '/images/icons/erxes-13.svg',
          to: '/erxes-plugin-loan/insurance-types/',
          action: 'loanConfig',
          scope: 'loans',
          location: 'settings',
          permissions: ['manageInsuranceTypes'],
          permission: 'manageInsuranceTypes'
        },
        {
          text: 'Loan config',
          image: '/images/icons/erxes-16.svg',
          to: '/erxes-plugin-loan/holiday-settings/',
          action: 'loanConfig',
          scope: 'loans',
          location: 'settings',
          permissions: ['manageLoanConfigs'],
          permission: 'manageLoanConfigs'
        },
        {
          text: 'Transaction',
          image: '/images/icons/erxes-16.svg',
          to: '/erxes-plugin-loan/transaction-list',
          action: 'transaction',
          scope: 'loans',
          location: 'transaction-list',
          permissions: ['showTransactions']
        }
      ],
      customerRightSidebarSection: [
        {
          text: 'customerRightSidebarSection',
          component: './contractSection',
          scope: 'loans'
        }
      ],
      companyRightSidebarSection: [
        {
          text: 'companyRightSidebarSection',
          component: './contractSection',
          scope: 'loans'
        }
      ],
      dealRightSidebarSection: [
        {
          text: 'dealRightSidebarSection',
          component: './contractSection',
          scope: 'loans'
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loans-ui/remoteEntry.js'
    },
    api: {
      permissions: {
        loans: {
          name: 'loans',
          description: 'Loans',
          actions: [
            {
              name: 'loansAll',
              description: 'All Loan',
              use: [
                'contractsAdd',
                'contractsEdit',
                'contractsDealEdit',
                'contractsClose',
                'contractsRemove',
                'showContracts',
                'manageContracts',
                'manageSchedule',
                'showCollaterals',
                'manageLoanConfigs',
                'manageInsuranceTypes',
                'manageInvoices',
                'showLoanInvoices',
                'manageTransactions',
                'showTransactions',
                'transactionsEdit',
                'transactionsRemove',
                'showPeriodLocks',
                'managePeriodLocks'
              ]
            },
            {
              name: 'loansContractsAll',
              description: 'Manage All Loan Contracts',
              use: [
                'contractsAdd',
                'contractsEdit',
                'contractsDealEdit',
                'contractsClose',
                'contractsRemove',
                'showContracts',
                'manageSchedule',
                'showCollaterals'
              ]
            },
            {
              name: 'loansTransactionsAll',
              description: 'Manage All Loan Transaction',
              use: [
                'manageTransactions',
                'showTransactions',
                'transactionsEdit',
                'transactionsRemove'
              ]
            },
            {
              name: 'loansPeriodLocksAll',
              description: 'Manage All Period Locks',
              use: ['showPeriodLocks', 'managePeriodLocks']
            },
            { name: 'contractsAdd', description: 'Contract Add' },
            { name: 'contractsEdit', description: 'Contract Edit' },
            {
              name: 'contractsDealEdit',
              description: 'Contract Deal Relation'
            },
            { name: 'contractsClose', description: 'Close Contract' },
            { name: 'contractsRemove', description: 'Delete Contract' },
            { name: 'showContracts', description: 'Show Contracts' },
            { name: 'manageContracts', description: 'Manage Contracts' },
            { name: 'manageSchedule', description: 'Manage Schedule' },
            { name: 'showCollaterals', description: 'Show Collaterals' },
            { name: 'manageLoanConfigs', description: 'Manage Loan Configs' },
            {
              name: 'manageInsuranceTypes',
              description: 'Manage Insurance Config'
            },
            { name: 'manageInvoices', description: 'Manage Invoices' },
            { name: 'showLoanInvoices', description: 'Show Invoices' },
            { name: 'manageTransactions', description: 'Manage Transaction' },
            { name: 'showTransactions', description: 'Show Transactions' },
            { name: 'transactionsEdit', description: 'Edit Transactions' },
            { name: 'transactionsRemove', description: 'Remove Transactions' },
            { name: 'showPeriodLocks', description: 'Show Period Locks' },
            { name: 'managePeriodLocks', description: 'Manage Period Locks' }
          ]
        }
      }
    }
  },
  viber: {
    ui: {
      name: 'viber',
      scope: 'viber',
      exposes: {
        './routes': './src/routes.tsx',
        './inboxIntegrationForm': './src/components/IntegrationForm.tsx',
        './inboxConversationDetail': './src/components/ConversationDetail.tsx',
        './integrationDetailsForm': './src/components/IntegrationEditForm.tsx'
      },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-viber-ui/remoteEntry.js',
        scope: 'viber',
        module: './routes'
      },
      inboxDirectMessage: {
        messagesQuery: {
          query:
            '\n        query viberConversationMessages(\n          $conversationId: String!\n          $skip: Int\n          $limit: Int\n          $getFirst: Boolean\n        ) {\n          viberConversationMessages(\n            conversationId: $conversationId,\n            skip: $skip,\n            limit: $limit,\n            getFirst: $getFirst\n          ) {\n            _id\n            content\n            conversationId\n            customerId\n            userId\n            createdAt\n            isCustomerRead\n            internal\n\n            attachments {\n              url\n              name\n              type\n              size\n            }\n\n            user {\n              _id\n              username\n              details {\n                avatar\n                fullName\n                position\n              }\n            }\n\n            customer {\n              _id\n              avatar\n              firstName\n              middleName\n              lastName\n              primaryEmail\n              primaryPhone\n              state\n\n              companies {\n                _id\n                primaryName\n                website\n              }\n\n              customFieldsData\n              tagIds\n            }\n          }\n        }\n      ',
          name: 'viberConversationMessages',
          integrationKind: 'viber'
        },
        countQuery: {
          query:
            '\n        query viberConversationMessagesCount($conversationId: String!) {\n          viberConversationMessagesCount(conversationId: $conversationId)\n        }\n      ',
          name: 'viberConversationMessagesCount',
          integrationKind: 'viber'
        }
      },
      inboxIntegrationForm: './inboxIntegrationForm',
      invoiceDetailRightSection: './invoiceDetailRightSection',
      integrationDetailsForm: './integrationDetailsForm',
      inboxIntegrations: [
        {
          name: 'Viber',
          description: 'Configure Viber application',
          isAvailable: true,
          kind: 'viber',
          logo: '/images/integrations/viber.png',
          createModal: 'viber'
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-viber-ui/remoteEntry.js'
    }
  },
  meetings: {
    ui: {
      name: 'meetings',
      scope: 'meetings',
      exposes: { './routes': './src/routes.tsx' },
      routes: {
        url:
          'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-meetings-ui/remoteEntry.js',
        scope: 'meetings',
        module: './routes'
      },
      menus: [
        {
          text: 'Meetings',
          url: '/meetings/myCalendar',
          icon: 'icon-star',
          location: 'mainNavigation'
        }
      ],
      url:
        'https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-meetings-ui/remoteEntry.js'
    }
  }
};
