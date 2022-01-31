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
        name: 'showPermissionModules',
        description: 'Show permissions modules'
      },
      {
        name: 'showPermissionActions',
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
          'integrationsEdit',
          'integrationsCreateBookingIntegration',
          'integrationsEditBookingIntegration'
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
      {
        name: 'showAutomations',
        description: 'Show automations'
      },
      {
        name: 'automationsAdd',
        description: 'Add automations'
      },
      {
        name: 'automationsEdit',
        description: 'Edit automations'
      },
      {
        name: 'automationsRemove',
        description: 'Remove automations'
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
  },
  clientPortal: {
    name: 'clientPortal',
    description: 'Client portal',
    actions: [
      {
        name: 'manageClientPortal',
        description: 'Manage client portal'
      }
    ]
  },
  structures: {
    name: 'structures',
    description: 'Structure',
    actions: [
      {
        name: 'structuresAll',
        description: 'All',
        use: [
          'showStructure',
          'addStructure',
          'editStructure',
          'removeStructure'
        ]
      },
      {
        name: 'showStructure',
        description: 'Show a structure'
      },
      {
        name: 'addStructure',
        description: 'Create a structure'
      },
      {
        name: 'editStructure',
        description: 'Edit a structure'
      },
      {
        name: 'removeStructure',
        description: 'Remove a structure'
      }
    ]
  },
  departments: {
    name: 'departments',
    description: 'Department',
    actions: [
      {
        name: 'departmentsAll',
        description: 'All',
        use: [
          'addDepartment',
          'showDepartment',
          'editDepartment',
          'removeDepartment'
        ]
      },
      {
        name: 'showDepartment',
        description: 'Show a department'
      },
      {
        name: 'addDepartment',
        description: 'Create a department'
      },
      {
        name: 'editDepartment',
        description: 'Edit a department'
      },
      {
        name: 'removeDepartment',
        description: 'Remove a department'
      }
    ]
  },
  units: {
    name: 'units',
    description: 'Unit',
    actions: [
      {
        name: 'unitsAll',
        description: 'All',
        use: ['showUnit', 'addUnit', 'editUnit', 'removeUnit']
      },
      {
        name: 'showUnit',
        description: 'Show a unit'
      },
      {
        name: 'addUnit',
        description: 'Create a unit'
      },
      {
        name: 'editUnit',
        description: 'Edit a unit'
      },
      {
        name: 'removeUnit',
        description: 'Remove a unit'
      }
    ]
  },
  branches: {
    name: 'branches',
    description: 'Branch',
    actions: [
      {
        name: 'branchesAll',
        description: 'All',
        use: ['showBranch', 'addBranch', 'editBranch', 'removeBranch']
      },
      {
        name: 'showBranch',
        description: 'Show a branch'
      },
      {
        name: 'addBranch',
        description: 'Create a branch'
      },
      {
        name: 'editBranch',
        description: 'Edit a branch'
      },
      {
        name: 'removeBranch',
        description: 'Remove a branch'
      }
    ]
  }
};
