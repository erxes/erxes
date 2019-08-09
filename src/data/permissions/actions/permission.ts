export const moduleObjects = {
  brands: {
    name: 'brands',
    description: 'Brands',
    actions: [
      {
        name: 'brandsAll',
        description: 'All',
        use: ['showBrands', 'manageBrands'],
      },
      {
        name: 'manageBrands',
        description: 'Manage brands',
      },
      {
        name: 'showBrands',
        description: 'Show brands',
      },
    ],
  },
  channels: {
    name: 'channels',
    description: 'Channels',
    actions: [
      {
        name: 'channelsAll',
        description: 'All',
        use: ['showChannels', 'manageChannels'],
      },
      {
        name: 'manageChannels',
        description: 'Manage channels',
      },
      {
        name: 'showChannels',
        description: 'Show channel',
      },
    ],
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
          'companiesEditCustomers',
          'companiesRemove',
          'companiesMerge',
          'showCompanies',
          'showCompaniesMain',
          'exportCompanies',
        ],
      },
      {
        name: 'companiesAdd',
        description: 'Add companies',
      },
      {
        name: 'companiesEdit',
        description: 'Edit companies',
      },
      {
        name: 'companiesRemove',
        description: 'Remove companies',
      },
      {
        name: 'companiesEditCustomers',
        description: 'Edit companies customer',
      },
      {
        name: 'companiesMerge',
        description: 'Merge companies',
      },
      {
        name: 'showCompanies',
        description: 'Show companies',
      },
      {
        name: 'showCompaniesMain',
        description: 'Show companies main',
      },
      {
        name: 'exportCompanies',
        description: 'Export companies to xls file',
      },
    ],
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
          'customersEditCompanies',
          'customersMerge',
          'customersRemove',
          'exportCustomers',
        ],
      },
      {
        name: 'exportCustomers',
        description: 'Export customers',
      },
      {
        name: 'showCustomers',
        description: 'Show customers',
      },
      {
        name: 'customersAdd',
        description: 'Add customer',
      },
      {
        name: 'customersEdit',
        description: 'Edit customer',
      },
      {
        name: 'customersEditCompanies',
        description: 'Update customers companies',
      },
      {
        name: 'customersMerge',
        description: 'Merge customers',
      },
      {
        name: 'customersRemove',
        description: 'Remove customers',
      },
    ],
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
          'dealsUpdateOrder',
          'dealsWatch',
        ],
      },
      {
        name: 'showDeals',
        description: 'Show deals',
      },
      {
        name: 'dealBoardsAdd',
        description: 'Add deal board',
      },
      {
        name: 'dealBoardsRemove',
        description: 'Remove deal board',
      },
      {
        name: 'dealPipelinesAdd',
        description: 'Add deal pipeline',
      },
      {
        name: 'dealPipelinesEdit',
        description: 'Edit deal pipeline',
      },
      {
        name: 'dealPipelinesRemove',
        description: 'Remove deal pipeline',
      },
      {
        name: 'dealPipelinesUpdateOrder',
        description: 'Update pipeline order',
      },
      {
        name: 'dealPipelinesWatch',
        description: 'Deal pipeline watch',
      },
      {
        name: 'dealStagesAdd',
        description: 'Add deal stage',
      },
      {
        name: 'dealStagesEdit',
        description: 'Edit deal stage',
      },
      {
        name: 'dealStagesUpdateOrder',
        description: 'Update stage order',
      },
      {
        name: 'dealStagesRemove',
        description: 'Remove deal stage',
      },
      {
        name: 'dealsAdd',
        description: 'Add deal',
      },
      {
        name: 'dealsEdit',
        description: 'Edit deal',
      },
      {
        name: 'dealsUpdateOrder',
        description: 'Update deal order',
      },
      {
        name: 'dealsRemove',
        description: 'Remove deal',
      },
      {
        name: 'dealsWatch',
        description: 'Watch deal',
      },
    ],
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
          'ticketsUpdateOrder',
          'ticketsWatch',
        ],
      },
      {
        name: 'showTickets',
        description: 'Show tickets',
      },
      {
        name: 'ticketBoardsAdd',
        description: 'Add ticket board',
      },
      {
        name: 'ticketBoardsRemove',
        description: 'Remove ticket board',
      },
      {
        name: 'ticketPipelinesAdd',
        description: 'Add ticket pipeline',
      },
      {
        name: 'ticketPipelinesEdit',
        description: 'Edit ticket pipeline',
      },
      {
        name: 'ticketPipelinesRemove',
        description: 'Remove ticket pipeline',
      },
      {
        name: 'ticketPipelinesWatch',
        description: 'Ticket pipeline watch',
      },
      {
        name: 'ticketPipelinesUpdateOrder',
        description: 'Update pipeline order',
      },
      {
        name: 'ticketStagesAdd',
        description: 'Add ticket stage',
      },
      {
        name: 'ticketStagesEdit',
        description: 'Edit ticket stage',
      },
      {
        name: 'ticketStagesUpdateOrder',
        description: 'Update stage order',
      },
      {
        name: 'ticketStagesRemove',
        description: 'Remove ticket stage',
      },
      {
        name: 'ticketsAdd',
        description: 'Add ticket',
      },
      {
        name: 'ticketsEdit',
        description: 'Edit ticket',
      },
      {
        name: 'ticketsUpdateOrder',
        description: 'Update ticket order',
      },
      {
        name: 'ticketsRemove',
        description: 'Remove ticket',
      },
      {
        name: 'ticketsWatch',
        description: 'Watch ticket',
      },
    ],
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
          'tasksUpdateOrder',
          'tasksWatch',
        ],
      },
      {
        name: 'showTasks',
        description: 'Show tasks',
      },
      {
        name: 'taskBoardsAdd',
        description: 'Add task board',
      },
      {
        name: 'taskBoardsRemove',
        description: 'Remove task board',
      },
      {
        name: 'taskPipelinesAdd',
        description: 'Add task pipeline',
      },
      {
        name: 'taskPipelinesEdit',
        description: 'Edit task pipeline',
      },
      {
        name: 'taskPipelinesRemove',
        description: 'Remove task pipeline',
      },
      {
        name: 'taskPipelinesWatch',
        description: 'Task pipeline watch',
      },
      {
        name: 'taskPipelinesUpdateOrder',
        description: 'Update pipeline order',
      },
      {
        name: 'taskStagesAdd',
        description: 'Add task stage',
      },
      {
        name: 'taskStagesEdit',
        description: 'Edit task stage',
      },
      {
        name: 'taskStagesUpdateOrder',
        description: 'Update stage order',
      },
      {
        name: 'taskStagesRemove',
        description: 'Remove task stage',
      },
      {
        name: 'tasksAdd',
        description: 'Add task',
      },
      {
        name: 'tasksEdit',
        description: 'Edit task',
      },
      {
        name: 'tasksUpdateOrder',
        description: 'Update task order',
      },
      {
        name: 'tasksRemove',
        description: 'Remove task',
      },
      {
        name: 'tasksWatch',
        description: 'Watch task',
      },
    ],
  },
  engages: {
    name: 'engages',
    description: 'Engages',
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
          'engageMessageRemove',
        ],
      },
      {
        name: 'engageMessageSetLive',
        description: 'Set live engage message',
      },
      {
        name: 'engageMessageSetPause',
        description: 'Set pause engage message',
      },
      {
        name: 'engageMessageSetLiveManual',
        description: 'Set live engage message manual',
      },
      {
        name: 'engageMessageRemove',
        description: 'Remove engage message',
      },
      {
        name: 'engageMessageEdit',
        description: 'Edit engage message',
      },
      {
        name: 'engageMessageAdd',
        description: 'Add engage message',
      },
      {
        name: 'showEngagesMessages',
        description: 'Show engages messages list',
      },
    ],
  },
  insights: {
    name: 'insights',
    description: 'Insights',
    actions: [
      {
        name: 'insightsAll',
        description: 'All',
        use: ['manageExportInsights', 'showInsights'],
      },
      {
        name: 'manageExportInsights',
        description: 'Manage export insights',
      },
      {
        name: 'showInsights',
        description: 'Show insights',
      },
    ],
  },
  knowledgeBase: {
    name: 'knowledgeBase',
    description: 'KnowledgeBase',
    actions: [
      {
        name: 'knowledgeBaseAll',
        description: 'All',
        use: ['showKnowledgeBase', 'manageKnowledgeBase'],
      },
      {
        name: 'manageKnowledgeBase',
        description: 'Manage knowledge base',
      },
      {
        name: 'showKnowledgeBase',
        description: 'Show knowledge base',
      },
    ],
  },
  permissions: {
    name: 'permissions',
    description: 'Permissions config',
    actions: [
      {
        name: 'permissionsAll',
        description: 'All',
        use: ['managePermissions', 'showPermissions', 'showPermissionModules', 'showPermissionActions'],
      },
      {
        name: 'managePermissions',
        description: 'Manage permissions',
      },
      {
        name: 'showPermissions',
        description: 'Show permissions',
      },
      {
        name: 'showPermissionsModules',
        description: 'Show permissions modules',
      },
      {
        name: 'showPermissionsActions',
        description: 'Show permissions actions',
      },
    ],
  },
  usersGroups: {
    name: 'usersGroups',
    description: 'Users Groups',
    actions: [
      {
        name: 'usersGroupsAll',
        description: 'All',
        use: ['showUsersGroups', 'manageUsersGroups'],
      },
      {
        name: 'manageUsersGroups',
        description: 'Manage users groups',
      },
      {
        name: 'showUsersGroups',
        description: 'Show users groups',
      },
    ],
  },
  scripts: {
    name: 'scripts',
    description: 'Scripts',
    actions: [
      {
        name: 'scriptsAll',
        description: 'All',
        use: ['showScripts', 'manageScripts'],
      },
      {
        name: 'manageScripts',
        description: 'Manage scripts',
      },
      {
        name: 'showScripts',
        description: 'Show scripts',
      },
    ],
  },
  products: {
    name: 'products',
    description: 'Products',
    actions: [
      {
        name: 'productsAll',
        description: 'All',
        use: ['showProducts', 'manageProducts'],
      },
      {
        name: 'manageProducts',
        description: 'Manage products',
        use: ['showProducts'],
      },
      {
        name: 'showProducts',
        description: 'Show products',
      },
    ],
  },
  users: {
    name: 'users',
    description: 'Team members',
    actions: [
      {
        name: 'usersAll',
        description: 'All',
        use: ['showUsers', 'usersEdit', 'usersInvite', 'usersSetActiveStatus'],
      },
      {
        name: 'showUsers',
        description: 'Show team members',
      },
      {
        name: 'usersSetActiveStatus',
        description: 'Set active/deactive team member',
      },
      {
        name: 'usersEdit',
        description: 'Update team member',
      },
      {
        name: 'usersInvite',
        description: 'Invite team member',
      },
    ],
  },
  emailTemplates: {
    name: 'emailTemplates',
    description: 'Email template',
    actions: [
      {
        name: 'emailTemplateAll',
        description: 'All',
        use: ['showEmailTemplates', 'manageEmailTemplate'],
      },
      {
        name: 'manageEmailTemplate',
        description: 'Manage email template',
      },
      {
        name: 'showEmailTemplates',
        description: 'Show email templates',
      },
    ],
  },
  responseTemplates: {
    name: 'responseTemplates',
    description: 'Response templates',
    actions: [
      {
        name: 'responseTemplatesAll',
        description: 'All',
        use: ['manageResponseTemplate', 'showResponseTemplates'],
      },
      {
        name: 'manageResponseTemplate',
        description: 'Manage response template',
      },
      {
        name: 'showResponseTemplates',
        description: 'Show response templates',
      },
    ],
  },
  importHistories: {
    name: 'importHistories',
    description: 'Import histories',
    actions: [
      {
        name: 'importHistoriesAll',
        description: 'All',
        use: ['importHistories', 'removeImportHistories', 'importXlsFile'],
      },
      {
        name: 'importXlsFile',
        description: 'Import xls files',
      },
      {
        name: 'removeImportHistories',
        description: 'Remove import histories',
      },
      {
        name: 'importHistories',
        description: 'Show import histories',
      },
    ],
  },
  tags: {
    name: 'tags',
    description: 'Tags',
    actions: [
      {
        name: 'tagsAll',
        description: 'All',
        use: ['showTags', 'manageTags'],
      },
      {
        name: 'manageTags',
        description: 'Manage tags',
      },
      {
        name: 'showTags',
        description: 'Show tags',
      },
    ],
  },
  forms: {
    name: 'forms',
    description: 'Form',
    actions: [
      {
        name: 'formsAll',
        description: 'All',
        use: ['showForms', 'manageForms'],
      },
      {
        name: 'manageForms',
        description: 'Manage forms',
      },
      {
        name: 'showForms',
        description: 'Show forms',
      },
    ],
  },
  segments: {
    name: 'segments',
    description: 'Segments',
    actions: [
      {
        name: 'segmentsAll',
        description: 'All',
        use: ['showSegments', 'manageSegments'],
      },
      {
        name: 'manageSegments',
        description: 'Manage segments',
      },
      {
        name: 'showSegments',
        description: 'Show segments list',
      },
    ],
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
          'integrationsCreateFormIntegration',
          'integrationsEditFormIntegration',
          'integrationsRemove',
        ],
      },
      {
        name: 'showIntegrations',
        description: 'Show integrations',
      },
      {
        name: 'integrationsCreateMessengerIntegration',
        description: 'Create messenger integration',
      },
      {
        name: 'integrationsEditMessengerIntegration',
        description: 'Edit messenger integration',
      },
      {
        name: 'integrationsSaveMessengerAppearanceData',
        description: 'Save messenger appearance data',
      },
      {
        name: 'integrationsSaveMessengerConfigs',
        description: 'Save messenger config',
      },
      {
        name: 'integrationsCreateFormIntegration',
        description: 'Create form integration',
      },
      {
        name: 'integrationsEditFormIntegration',
        description: 'Edit form integration',
      },
      {
        name: 'integrationsRemove',
        description: 'Remove integration',
      },
    ],
  },
  inbox: {
    name: 'inbox',
    description: 'Inbox',
    actions: [
      {
        name: 'inboxAll',
        description: 'All',
        use: ['showConversations', 'changeConversationStatus', 'assignConversation', 'conversationMessageAdd'],
      },
      {
        name: 'showConversations',
        description: 'Show conversations',
      },
      {
        name: 'changeConversationStatus',
        description: 'Change conversation status',
      },
      {
        name: 'assignConversation',
        description: 'Assign conversation',
      },
      {
        name: 'conversationMessageAdd',
        description: 'Add conversation message',
      },
    ],
  },
  generalSettings: {
    name: 'generalSettings',
    description: 'General settings',
    actions: [
      {
        name: 'generalSettingsAll',
        description: 'All',
        use: ['manageGeneralSettings', 'showGeneralSettings'],
      },
      {
        name: 'showGeneralSettings',
        description: 'Show general settings',
      },
      {
        name: 'manageGeneralSettings',
        description: 'Manage general settings',
      },
    ],
  },
  emailAppearance: {
    name: 'emailAppearance',
    description: 'Email appearance',
    actions: [
      {
        name: 'emailAppearanceAll',
        description: 'All',
        use: ['manageEmailAppearance', 'showEmailappearance'],
      },
      {
        name: 'showEmailappearance',
        description: 'Show email appearance',
      },
      {
        name: 'manageEmailAppearance',
        description: 'Manage email appearance',
      },
    ],
  },
  logs: {
    name: 'logs',
    description: 'Logs',
    actions: [
      {
        name: 'viewLogs',
        description: 'View logs',
      },
    ],
  },
};
