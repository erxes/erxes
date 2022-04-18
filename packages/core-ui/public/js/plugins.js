window.plugins = [
  {
    name: "contacts",
    port: 3011,
    exposes: {
      "./routes": "./src/routes.tsx",
    },
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
    name: "forms",
    port: 3005,
    exposes: {
      "./routes": "./src/routes.tsx",
    },
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
    name: "inbox",
    port: 3009,
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      url: "http://localhost:3009/remoteEntry.js",
      scope: "inbox",
      module: "./routes",
    },
    menus: [
      {
        text: "Team Inbox",
        url: "/inbox",
        icon: "icon-chat",
        location: "mainNavigation",
        permission: "showConversations",
      },
      {
        text: "Bookings",
        url: "/bookings",
        icon: "icon-paste",
        location: "mainNavigation",
        permission: "showIntegrations",
      },
      {
        text: "Forms",
        url: "/forms",
        icon: "icon-laptop",
        location: "mainNavigation",
        permission: "showForms",
      },
      {
        text: "Skills",
        to: "/settings/skills",
        image: "/images/icons/erxes-29.png",
        location: "settings",
        scope: "inbox",
        action: "skillTypesAll",
        permissions: [
          "getSkillTypes",
          "getSkill",
          "getSkills",
          "manageSkills",
          "manageSkillTypes",
        ],
      },
      {
        text: "Channels",
        to: "/settings/channels",
        image: "/images/icons/erxes-05.svg",
        location: "settings",
        scope: "inbox",
        action: "channelsAll",
        permissions: ["showChannels", "manageChannels"],
      },
      {
        text: "Integrations",
        to: "/settings/integrations",
        image: "/images/icons/erxes-04.svg",
        location: "settings",
        scope: "inbox",
        action: "integrationsAll",
        permissions: [
          "showIntegrations",
          "integrationsCreateMessengerIntegration",
          "integrationsEditMessengerIntegration",
          "integrationsSaveMessengerAppearanceData",
          "integrationsSaveMessengerConfigs",
          "integrationsCreateLeadIntegration",
          "integrationsEditLeadIntegration",
          "integrationsRemove",
          "integrationsArchive",
          "integrationsEdit",
        ],
      },
      {
        text: "Integrations config",
        to: "/settings/integrations-config",
        image: "/images/icons/erxes-24.svg",
        location: "settings",
        scope: "inbox",
        action: "generalSettingsAll",
        permissions: ["manageGeneralSettings", "showGeneralSettings"],
      },
      {
        text: "Responses",
        to: "/settings/response-templates",
        image: "/images/icons/erxes-10.svg",
        location: "settings",
        scope: "inbox",
        action: "responseTemplatesAll",
        permissions: ["manageResponseTemplate", "showResponseTemplates"],
      },
      {
        text: "Widget Script Manager",
        to: "/settings/scripts",
        image: "/images/icons/erxes-30.png",
        location: "settings",
        scope: "inbox",
        action: "scriptsAll",
        permissions: ["manageScripts", "showScripts"],
      },
    ],
  },
  {
    name: "tags",
    port: 3012,
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      url: "http://localhost:3012/remoteEntry.js",
      scope: "tags",
      module: "./routes",
    },
    menus: [
      {
        text: "Tags",
        to: "/tags/inbox:conversation",
        image: "/images/icons/erxes-18.svg",
        location: "settings",
        scope: "tags",
        action: "tagsAll",
        permissions: ["showTags", "manageTags"],
      },
    ],
  },
  {
    name: 'cards',
    port: 3003,
    scope: 'cards',
    url: 'http://localhost:3003/remoteEntry.js',
    exposes: {
      './routes': './src/routes.tsx',
      './settings': './src/Settings.tsx',
      './propertyGroupForm': './src/propertyGroupForm.tsx',
      './segmentForm': './src/segmentForm.tsx'
    },
    routes: {
      url: 'http://localhost:3003/remoteEntry.js',
      scope: 'cards',
      module: './routes'
    },
    propertyGroupForm: './propertyGroupForm',
    segmentForm: './segmentForm',
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
        permission: 'showConversations'
      },
      {
        text: 'Ticket',
        url: '/ticket/board',
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
        to: '/settings/boards/growthHack',
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
