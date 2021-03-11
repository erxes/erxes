export const moduleObjects = {
  brands: {
    name: 'brands',
    description: 'Brands',
    actions: [
      {
        name: 'brandsAll',
        description: 'All',
        use: ['showBrands', 'manageBrands', 'exportBrands']
      },
      {
        name: 'manageBrands',
        description: 'Manage brands'
      },
      {
        name: 'showBrands',
        description: 'Show brands'
      },
      {
        name: 'exportBrands',
        description: 'Export brands'
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
        use: ['showChannels', 'manageChannels', 'exportChannels']
      },
      {
        name: 'manageChannels',
        description: 'Manage channels'
      },
      {
        name: 'showChannels',
        description: 'Show channel'
      },
      {
        name: 'exportChannels',
        description: 'Export channels'
      }
    ]
  },
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
      {
        name: 'companiesAdd',
        description: 'Add companies'
      },
      {
        name: 'companiesEdit',
        description: 'Edit companies'
      },
      {
        name: 'companiesRemove',
        description: 'Remove companies'
      },
      {
        name: 'companiesMerge',
        description: 'Merge companies'
      },
      {
        name: 'showCompanies',
        description: 'Show companies'
      },
      {
        name: 'showCompaniesMain',
        description: 'Show companies main'
      },
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
      {
        name: 'exportCustomers',
        description: 'Export customers'
      },
      {
        name: 'showCustomers',
        description: 'Show customers'
      },
      {
        name: 'customersAdd',
        description: 'Add customer'
      },
      {
        name: 'customersEdit',
        description: 'Edit customer'
      },
      {
        name: 'customersMerge',
        description: 'Merge customers'
      },
      {
        name: 'customersRemove',
        description: 'Remove customers'
      },
      {
        name: 'customersChangeState',
        description: 'Change customer state'
      }
    ]
  },
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
      {
        name: 'dashboardAdd',
        description: 'Add dashboard'
      },
      {
        name: 'dashboardEdit',
        description: 'Edit dashboard'
      },
      {
        name: 'dashboardRemove',
        description: 'Remove dashboard'
      },
      {
        name: 'dashboardItemAdd',
        description: 'Add dashboard item'
      },
      {
        name: 'dashboardItemEdit',
        description: 'Edit dashboard item'
      },
      {
        name: 'dashboardItemRemove',
        description: 'Remove dashboard item'
      },
      {
        name: 'showDashboards',
        description: 'Show dashboards'
      }
    ]
  },
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
          'dealStagesAdd',
          'dealStagesEdit',
          'dealStagesUpdateOrder',
          'dealStagesRemove',
          'dealsAdd',
          'dealsEdit',
          'dealsRemove',
          'dealsWatch',
          'dealsArchive',
          'exportDeals'
        ]
      },
      {
        name: 'showDeals',
        description: 'Show deals'
      },
      {
        name: 'dealBoardsAdd',
        description: 'Add deal board'
      },
      {
        name: 'dealBoardsRemove',
        description: 'Remove deal board'
      },
      {
        name: 'dealPipelinesAdd',
        description: 'Add deal pipeline'
      },
      {
        name: 'dealPipelinesEdit',
        description: 'Edit deal pipeline'
      },
      {
        name: 'dealPipelinesRemove',
        description: 'Remove deal pipeline'
      },
      {
        name: 'dealPipelinesUpdateOrder',
        description: 'Update pipeline order'
      },
      {
        name: 'dealPipelinesWatch',
        description: 'Deal pipeline watch'
      },
      {
        name: 'dealStagesAdd',
        description: 'Add deal stage'
      },
      {
        name: 'dealStagesEdit',
        description: 'Edit deal stage'
      },
      {
        name: 'dealStagesUpdateOrder',
        description: 'Update stage order'
      },
      {
        name: 'dealStagesRemove',
        description: 'Remove deal stage'
      },
      {
        name: 'dealsAdd',
        description: 'Add deal'
      },
      {
        name: 'dealsEdit',
        description: 'Edit deal'
      },
      {
        name: 'dealsRemove',
        description: 'Remove deal'
      },
      {
        name: 'dealsWatch',
        description: 'Watch deal'
      },
      {
        name: 'dealsArchive',
        description: 'Archive all deals in a specific stage'
      },
      {
        name: 'exportDeals',
        description: 'Export deals'
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
          'ticketStagesAdd',
          'ticketStagesEdit',
          'ticketStagesUpdateOrder',
          'ticketStagesRemove',
          'ticketsAdd',
          'ticketsEdit',
          'ticketsRemove',
          'ticketsWatch',
          'ticketsArchive',
          'exportTickets'
        ]
      },
      {
        name: 'showTickets',
        description: 'Show tickets'
      },
      {
        name: 'ticketBoardsAdd',
        description: 'Add ticket board'
      },
      {
        name: 'ticketBoardsEdit',
        description: 'Edit ticket board'
      },
      {
        name: 'ticketBoardsRemove',
        description: 'Remove ticket board'
      },
      {
        name: 'ticketPipelinesAdd',
        description: 'Add ticket pipeline'
      },
      {
        name: 'ticketPipelinesEdit',
        description: 'Edit ticket pipeline'
      },
      {
        name: 'ticketPipelinesRemove',
        description: 'Remove ticket pipeline'
      },
      {
        name: 'ticketPipelinesWatch',
        description: 'Ticket pipeline watch'
      },
      {
        name: 'ticketPipelinesUpdateOrder',
        description: 'Update pipeline order'
      },
      {
        name: 'ticketStagesAdd',
        description: 'Add ticket stage'
      },
      {
        name: 'ticketStagesEdit',
        description: 'Edit ticket stage'
      },
      {
        name: 'ticketStagesUpdateOrder',
        description: 'Update stage order'
      },
      {
        name: 'ticketStagesRemove',
        description: 'Remove ticket stage'
      },
      {
        name: 'ticketsAdd',
        description: 'Add ticket'
      },
      {
        name: 'ticketsEdit',
        description: 'Edit ticket'
      },
      {
        name: 'ticketsRemove',
        description: 'Remove ticket'
      },
      {
        name: 'ticketsWatch',
        description: 'Watch ticket'
      },
      {
        name: 'ticketsArchive',
        description: 'Archive all tickets in a specific stage'
      },
      {
        name: 'exportTickets',
        description: 'Export tickets'
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
          'growthHackStagesAdd',
          'growthHackStagesEdit',
          'growthHackStagesUpdateOrder',
          'growthHackStagesRemove',
          'growthHacksAdd',
          'growthHacksEdit',
          'growthHacksRemove',
          'growthHacksWatch',
          'growthHacksArchive',
          'growthHackTemplatesAdd',
          'growthHackTemplatesEdit',
          'growthHackTemplatesRemove',
          'growthHackTemplatesDuplicate',
          'showGrowthHackTemplates'
        ]
      },
      {
        name: 'showGrowthHacks',
        description: 'Show growth hacks'
      },
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
      {
        name: 'growthHacksAdd',
        description: 'Add growth hacking'
      },
      {
        name: 'growthHacksEdit',
        description: 'Edit growth hacking'
      },
      {
        name: 'growthHacksRemove',
        description: 'Remove growth hacking'
      },
      {
        name: 'growthHacksWatch',
        description: 'Watch growth hacking'
      },
      {
        name: 'growthHacksArchive',
        description: 'Archive all growth hacks in a specific stage'
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
          'taskStagesAdd',
          'taskStagesEdit',
          'taskStagesUpdateOrder',
          'taskStagesRemove',
          'tasksAdd',
          'tasksEdit',
          'tasksRemove',
          'tasksWatch',
          'tasksArchive',
          'taskUpdateTimeTracking',
          'exportTasks'
        ]
      },
      {
        name: 'showTasks',
        description: 'Show tasks'
      },
      {
        name: 'taskBoardsAdd',
        description: 'Add task board'
      },
      {
        name: 'taskBoardsRemove',
        description: 'Remove task board'
      },
      {
        name: 'taskPipelinesAdd',
        description: 'Add task pipeline'
      },
      {
        name: 'taskPipelinesEdit',
        description: 'Edit task pipeline'
      },
      {
        name: 'taskPipelinesRemove',
        description: 'Remove task pipeline'
      },
      {
        name: 'taskPipelinesWatch',
        description: 'Task pipeline watch'
      },
      {
        name: 'taskPipelinesUpdateOrder',
        description: 'Update pipeline order'
      },
      {
        name: 'taskStagesAdd',
        description: 'Add task stage'
      },
      {
        name: 'taskStagesEdit',
        description: 'Edit task stage'
      },
      {
        name: 'taskStagesUpdateOrder',
        description: 'Update stage order'
      },
      {
        name: 'taskStagesRemove',
        description: 'Remove task stage'
      },
      {
        name: 'tasksAdd',
        description: 'Add task'
      },
      {
        name: 'tasksEdit',
        description: 'Edit task'
      },
      {
        name: 'tasksRemove',
        description: 'Remove task'
      },
      {
        name: 'tasksWatch',
        description: 'Watch task'
      },
      {
        name: 'tasksArchive',
        description: 'Archive all tasks in a specific stage'
      },
      {
        name: 'taskUpdateTimeTracking',
        description: 'Update time tracking for a task'
      },
      {
        name: 'exportTasks',
        description: 'Export tasks'
      }
    ]
  },
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
      {
        name: 'engageMessageSetPause',
        description: 'Pause a campaign'
      },
      {
        name: 'engageMessageSetLiveManual',
        description: 'Set a manual campaign live'
      },
      {
        name: 'engageMessageRemove',
        description: 'Remove a campaign'
      },
      {
        name: 'engageMessageEdit',
        description: 'Edit a campaign'
      },
      {
        name: 'engageMessageAdd',
        description: 'Add a campaign'
      },
      {
        name: 'showEngagesMessages',
        description: 'See campaign list'
      }
    ]
  },
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
      {
        name: 'showKnowledgeBase',
        description: 'Show knowledge base'
      }
    ]
  },
  permissions: {
    name: 'permissions',
    description: 'Permissions config',
    actions: [
      {
        name: 'permissionsAll',
        description: 'All',
        use: [
          'managePermissions',
          'showPermissions',
          'showPermissionModules',
          'showPermissionActions',
          'exportPermissions'
        ]
      },
      {
        name: 'managePermissions',
        description: 'Manage permissions'
      },
      {
        name: 'showPermissions',
        description: 'Show permissions'
      },
      {
        name: 'showPermissionsModules',
        description: 'Show permissions modules'
      },
      {
        name: 'showPermissionsActions',
        description: 'Show permissions actions'
      },
      {
        name: 'exportPermissions',
        description: 'Export permissions'
      }
    ]
  },
  usersGroups: {
    name: 'usersGroups',
    description: 'Users Groups',
    actions: [
      {
        name: 'usersGroupsAll',
        description: 'All',
        use: ['showUsersGroups', 'manageUsersGroups']
      },
      {
        name: 'manageUsersGroups',
        description: 'Manage users groups'
      },
      {
        name: 'showUsersGroups',
        description: 'Show users groups'
      }
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
      {
        name: 'manageScripts',
        description: 'Manage scripts'
      },
      {
        name: 'showScripts',
        description: 'Show scripts'
      }
    ]
  },
  products: {
    name: 'products',
    description: 'Products',
    actions: [
      {
        name: 'productsAll',
        description: 'All',
        use: ['showProducts', 'manageProducts', 'productsMerge']
      },
      {
        name: 'manageProducts',
        description: 'Manage products',
        use: ['showProducts']
      },
      {
        name: 'showProducts',
        description: 'Show products'
      },
      {
        name: 'productsMerge',
        description: 'Merge products'
      }
    ]
  },
  users: {
    name: 'users',
    description: 'Team members',
    actions: [
      {
        name: 'usersAll',
        description: 'All',
        use: [
          'showUsers',
          'usersEdit',
          'usersInvite',
          'usersSetActiveStatus',
          'exportUsers'
        ]
      },
      {
        name: 'showUsers',
        description: 'Show team members'
      },
      {
        name: 'usersSetActiveStatus',
        description: 'Set active/deactive team member'
      },
      {
        name: 'usersEdit',
        description: 'Update team member'
      },
      {
        name: 'usersInvite',
        description: 'Invite team member'
      },
      {
        name: 'exportUsers',
        description: 'Export team members'
      }
    ]
  },
  emailTemplates: {
    name: 'emailTemplates',
    description: 'Email template',
    actions: [
      {
        name: 'emailTemplateAll',
        description: 'All',
        use: ['showEmailTemplates', 'manageEmailTemplate']
      },
      {
        name: 'manageEmailTemplate',
        description: 'Manage email template'
      },
      {
        name: 'showEmailTemplates',
        description: 'Show email templates'
      }
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
  importHistories: {
    name: 'importHistories',
    description: 'Import histories',
    actions: [
      {
        name: 'importHistoriesAll',
        description: 'All',
        use: ['importHistories', 'removeImportHistories', 'importXlsFile']
      },
      {
        name: 'importXlsFile',
        description: 'Import xls files'
      },
      {
        name: 'removeImportHistories',
        description: 'Remove import histories'
      },
      {
        name: 'importHistories',
        description: 'Show import histories'
      }
    ]
  },
  tags: {
    name: 'tags',
    description: 'Tags',
    actions: [
      {
        name: 'tagsAll',
        description: 'All',
        use: ['showTags', 'manageTags']
      },
      {
        name: 'manageTags',
        description: 'Manage tags'
      },
      {
        name: 'showTags',
        description: 'Show tags'
      }
    ]
  },
  forms: {
    name: 'forms',
    description: 'Form',
    actions: [
      {
        name: 'formsAll',
        description: 'All',
        use: ['showForms', 'manageForms']
      },
      {
        name: 'manageForms',
        description: 'Manage forms'
      },
      {
        name: 'showForms',
        description: 'Show forms'
      }
    ]
  },
  segments: {
    name: 'segments',
    description: 'Segments',
    actions: [
      {
        name: 'segmentsAll',
        description: 'All',
        use: ['showSegments', 'manageSegments']
      },
      {
        name: 'manageSegments',
        description: 'Manage segments'
      },
      {
        name: 'showSegments',
        description: 'Show segments list'
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
          'integrationsEdit'
        ]
      },
      {
        name: 'showIntegrations',
        description: 'Show integrations'
      },
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
      {
        name: 'integrationsRemove',
        description: 'Remove integration'
      },
      {
        name: 'integrationsArchive',
        description: 'Archive an integration'
      },
      {
        name: 'integrationsEdit',
        description: 'Edit common integration fields'
      }
    ]
  },
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
      {
        name: 'showConversations',
        description: 'Show conversations'
      },
      {
        name: 'changeConversationStatus',
        description: 'Change conversation status'
      },
      {
        name: 'assignConversation',
        description: 'Assign conversation'
      },
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
  generalSettings: {
    name: 'generalSettings',
    description: 'General settings',
    actions: [
      {
        name: 'generalSettingsAll',
        description: 'All',
        use: ['manageGeneralSettings', 'showGeneralSettings']
      },
      {
        name: 'showGeneralSettings',
        description: 'Show general settings'
      },
      {
        name: 'manageGeneralSettings',
        description: 'Manage general settings'
      }
    ]
  },
  logs: {
    name: 'logs',
    description: 'Logs',
    actions: [
      {
        name: 'viewLogs',
        description: 'View logs'
      }
    ]
  },
  webhooks: {
    name: 'webhooks',
    description: 'Webhooks',
    actions: [
      {
        name: 'webhooksAll',
        description: 'All',
        use: ['showWebhooks', 'manageWebhooks']
      },
      {
        name: 'showWebhooks',
        description: 'Show webhooks'
      },
      {
        name: 'manageWebhooks',
        description: 'Manage webhooks'
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
      {
        name: 'getSkillTypes',
        description: 'Get skill types'
      },
      {
        name: 'createSkillType',
        description: 'Create skill type'
      },
      {
        name: 'updateSkillType',
        description: 'Update skill type'
      },
      {
        name: 'removeSkillType',
        description: 'Remove skill type'
      }
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
      {
        name: 'getSkill',
        description: 'Get skill'
      },
      {
        name: 'getSkills',
        description: 'Get skills'
      },
      {
        name: 'createSkill',
        description: 'Create skill'
      },
      {
        name: 'updateSkill',
        description: 'Update skill'
      },
      {
        name: 'removeSkill',
        description: 'Remove skill'
      }
    ]
  },
  calendars: {
    name: 'calendars',
    description: 'Calendars',
    actions: [
      {
        name: 'calendarsAll',
        description: 'All',
        use: [
          'showCalendars',
          'calendarsAdd',
          'calendarsEdit',
          'calendarsRemove',
          'showCalendarGroups',
          'calendarGroupsAdd',
          'calendarGroupsEdit',
          'calendarGroupsRemove'
        ]
      },
      {
        name: 'showCalendars',
        description: 'Show calendars'
      },
      {
        name: 'calendarsAdd',
        description: 'Add calendars'
      },
      {
        name: 'calendarsEdit',
        description: 'Edit calendars'
      },
      {
        name: 'calendarsRemove',
        description: 'Remove calendars'
      },
      {
        name: 'showCalendarGroups',
        description: 'Show calendar groups'
      },
      {
        name: 'calendarGroupsAdd',
        description: 'Add calendar groups'
      },
      {
        name: 'calendarGroupsEdit',
        description: 'Edit calendar groups'
      },
      {
        name: 'calendarGroupsRemove',
        description: 'Remove calendar groups'
      }
    ]
  }
};
