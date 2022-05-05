module.exports = {
  ads: {},
  automations: {
    ui: {
      name: "automations",
      port: 3008,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-automations-ui/remoteEntry.js",
        scope: "automations",
        module: "./routes",
      },
      menus: [
        {
          text: "Automations",
          url: "/automations",
          location: "mainNavigation",
          icon: "icon-circular",
          permission: "showAutomations",
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-automations-ui/remoteEntry.js",
    },
  },
  calendar: {
    ui: {
      name: "calendar",
      port: 3006,
      exposes: {
        "./routes": "./src/routes.tsx",
        "./settings": "./src/Settings.tsx",
      },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-calendar-ui/remoteEntry.js",
        scope: "calendar",
        module: "./routes",
      },
      menus: [
        {
          text: "Calendar",
          url: "/calendar",
          icon: "icon-calendar-alt",
          location: "mainNavigation",
          permission: "showCalendars",
        },
        {
          text: "Calendar settings",
          to: "/settings/calendars",
          image: "/images/icons/erxes-21.svg",
          location: "settings",
          scope: "calendar",
          action: "calendarsAll",
          permissions: [
            "calendarsAdd",
            "calendarsEdit",
            "calendarsRemove",
            "showCalendars",
            "showCalendarGroups",
            "calendarGroupsAdd",
            "calendarGroupsEdit",
            "calendarGroupsRemove",
          ],
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-calendar-ui/remoteEntry.js",
    },
  },
  cards: {
    ui: {
      name: "cards",
      port: 3003,
      scope: "cards",
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cards-ui/remoteEntry.js",
      exposes: {
        "./routes": "./src/routes.tsx",
        "./settings": "./src/Settings.tsx",
        "./propertyGroupForm": "./src/propertyGroupForm.tsx",
        "./segmentForm": "./src/segmentForm.tsx",
      },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cards-ui/remoteEntry.js",
        scope: "cards",
        module: "./routes",
      },
      propertyGroupForm: "./propertyGroupForm",
      segmentForm: "./segmentForm",
      menus: [
        {
          text: "Sales Pipeline",
          url: "/deal",
          icon: "icon-piggy-bank",
          location: "mainNavigation",
          permission: "showDeals",
        },
        {
          text: "Task",
          url: "/task",
          icon: "icon-file-check-alt",
          location: "mainNavigation",
          permission: "showConversations",
        },
        {
          text: "Ticket",
          url: "/ticket/board",
          icon: "icon-ticket",
          location: "mainNavigation",
          permission: "showTickets",
        },
        {
          text: "Growth Hacking",
          url: "/growthHack",
          icon: "icon-idea",
          location: "mainNavigation",
          permission: "showGrowthHacks",
        },
        {
          text: "Sales Pipelines",
          to: "/settings/boards/deal",
          image: "/images/icons/erxes-25.png",
          location: "settings",
          scope: "cards",
          action: "dealsAll",
          permissions: [
            "dealBoardsAdd",
            "dealBoardsEdit",
            "dealBoardsRemove",
            "dealPipelinesAdd",
            "dealPipelinesEdit",
            "dealPipelinesUpdateOrder",
            "dealPipelinesRemove",
            "dealPipelinesArchive",
            "dealPipelinesArchive",
            "dealStagesAdd",
            "dealStagesEdit",
            "dealStagesUpdateOrder",
            "dealStagesRemove",
          ],
        },
        {
          text: "Task Pipelines",
          to: "/settings/boards/task",
          image: "/images/icons/erxes-13.svg",
          location: "settings",
          scope: "cards",
          action: "tasksAll",
          permissions: [
            "taskBoardsAdd",
            "taskBoardsEdit",
            "taskBoardsRemove",
            "taskPipelinesAdd",
            "taskPipelinesEdit",
            "taskPipelinesUpdateOrder",
            "taskPipelinesRemove",
            "taskPipelinesArchive",
            "taskPipelinesCopied",
            "taskStagesAdd",
            "taskStagesEdit",
            "taskStagesUpdateOrder",
            "taskStagesRemove",
            "tasksAll",
          ],
        },
        {
          text: "Ticket Pipelines",
          to: "/settings/boards/ticket",
          image: "/images/icons/erxes-19.svg",
          location: "settings",
          scope: "cards",
          action: "ticketsAll",
          permissions: [
            "ticketBoardsAdd",
            "ticketBoardsEdit",
            "ticketBoardsRemove",
            "ticketPipelinesAdd",
            "ticketPipelinesEdit",
            "ticketPipelinesUpdateOrder",
            "ticketPipelinesRemove",
            "ticketPipelinesArchive",
            "ticketPipelinesCopied",
            "ticketStagesAdd",
            "ticketStagesEdit",
            "ticketStagesUpdateOrder",
            "ticketStagesRemove",
          ],
        },
        {
          text: "Growth Hacking Templates",
          to: "/settings/boards/growthHackTemplate",
          image: "/images/icons/erxes-12.svg",
          location: "settings",
          scope: "cards",
          action: "growthHacksAll",
          permissions: [
            "growthHackTemplatesAdd",
            "growthHackTemplatesEdit",
            "growthHackTemplatesRemove",
            "growthHackTemplatesDuplicate",
            "showGrowthHackTemplates",
          ],
        },
      ],
    },
  },
  cars: {
    ui: {
      name: "cars",
      port: 3010,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cars-ui/remoteEntry.js",
        scope: "cars",
        module: "./routes",
      },
      menus: [
        {
          text: "Plugin Car",
          url: "/cars",
          location: "mainNavigation",
          icon: "icon-car",
          permission: "showCars",
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cars-ui/remoteEntry.js",
    },
  },
  chats: {
    ui: {
      name: "chats",
      port: 3110,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-chats-ui/remoteEntry.js",
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
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-chats-ui/remoteEntry.js",
    },
  },
  clientportal: {
    ui: {
      name: "clientportal",
      port: 3015,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-clientportal-ui/remoteEntry.js",
        scope: "clientportal",
        module: "./routes",
      },
      menus: [
        {
          text: "Client Portal",
          to: "/settings/client-portal",
          image: "/images/icons/erxes-32.png",
          location: "settings",
          scope: "clientportal",
          action: "",
          permissions: [],
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-clientportal-ui/remoteEntry.js",
    },
  },
  contacts: {
    ui: {
      name: "contacts",
      port: 3011,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-contacts-ui/remoteEntry.js",
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
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-contacts-ui/remoteEntry.js",
    },
    api: {
      permissions: {
        companies: {
          name: "companies",
          description: "Companies",
          actions: [
            {
              name: "companiesAll",
              description: "All",
              use: [
                "companiesAdd",
                "companiesEdit",
                "companiesRemove",
                "companiesMerge",
                "showCompanies",
                "showCompaniesMain",
                "exportCompanies",
              ],
            },
            { name: "companiesAdd", description: "Add companies" },
            { name: "companiesEdit", description: "Edit companies" },
            { name: "companiesRemove", description: "Remove companies" },
            { name: "companiesMerge", description: "Merge companies" },
            { name: "showCompanies", description: "Show companies" },
            { name: "showCompaniesMain", description: "Show companies main" },
            {
              name: "exportCompanies",
              description: "Export companies to xls file",
            },
          ],
        },
        customers: {
          name: "customers",
          description: "Customers",
          actions: [
            {
              name: "customersAll",
              description: "All",
              use: [
                "showCustomers",
                "customersAdd",
                "customersEdit",
                "customersMerge",
                "customersRemove",
                "exportCustomers",
                "customersChangeState",
              ],
            },
            { name: "exportCustomers", description: "Export customers" },
            { name: "showCustomers", description: "Show customers" },
            { name: "customersAdd", description: "Add customer" },
            { name: "customersEdit", description: "Edit customer" },
            { name: "customersMerge", description: "Merge customers" },
            { name: "customersRemove", description: "Remove customers" },
            {
              name: "customersChangeState",
              description: "Change customer state",
            },
          ],
        },
      },
      essyncer: [
        {
          name: "customers",
          schema:
            "{'createdAt': { 'type': 'date' }, 'organizationId': { 'type': 'keyword' }, 'state': { 'type': 'keyword' }, 'primaryEmail': { 'type': 'text', 'analyzer': 'uax_url_email_analyzer' }, 'primaryPhone': { 'type': 'text', 'fields': { 'raw': { 'type': 'keyword' } } }, 'code': { 'type': 'text', 'fields': { 'raw': { 'type': 'keyword' } } }, 'integrationId': { 'type': 'keyword' }, 'relatedIntegrationIds': { 'type': 'keyword' }, 'scopeBrandIds': { 'type': 'keyword' }, 'ownerId': { 'type': 'keyword' }, 'position': { 'type': 'keyword' }, 'leadStatus': { 'type': 'keyword' }, 'tagIds': { 'type': 'keyword' }, 'companyIds': { 'type': 'keyword' }, 'mergedIds': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'emailValidationStatus': { 'type': 'keyword' }, 'customFieldsData': <nested>, 'trackedData': <nested>}",
          script:
            "if (ns.indexOf('customers') > -1) { if (doc.urlVisits) { delete doc.urlVisits } if (doc.trackedDataBackup) { delete doc.trackedDataBackup } if (doc.customFieldsDataBackup) { delete doc.customFieldsDataBackup } if (doc.messengerData) { delete doc.messengerData }}",
        },
        {
          name: "companies",
          schema:
            "{ 'createdAt': { 'type': 'date' }, 'primaryEmail': { 'type': 'text', 'analyzer': 'uax_url_email_analyzer' }, 'primaryName': { 'type': 'text', 'fields': { 'raw': { 'type': 'keyword' } } }, 'scopeBrandIds': { 'type': 'keyword' }, 'plan': { 'type': 'keyword' }, 'industry': { 'type': 'keyword' }, 'parentCompanyId': { 'type': 'keyword' }, 'ownerId': { 'type': 'keyword' }, 'tagIds': { 'type': 'keyword' }, 'mergedIds': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'businessType': { 'type': 'keyword' }, 'customFieldsData' : <nested> }",
          script: "",
        },
      ],
    },
  },
  dashboard: {
    ui: {
      name: "dashboard",
      port: 3007,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-dashboard-ui/remoteEntry.js",
        scope: "dashboard",
        module: "./routes",
      },
      menus: [
        {
          text: "Reports",
          url: "/dashboard",
          icon: "icon-dashboard",
          location: "mainNavigation",
          permission: "showDashboards",
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-dashboard-ui/remoteEntry.js",
    },
  },
  ebarimt: {
    ui: {
      name: "ebarimt",
      port: 3018,
      exposes: {
        "./routes": "./src/routes.tsx",
        "./response": "./src/response.tsx",
      },
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-ebarimt-ui/remoteEntry.js",
      scope: "ebarimt",
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-ebarimt-ui/remoteEntry.js",
        scope: "ebarimt",
        module: "./routes",
      },
      menus: [
        {
          text: "Put Responses",
          url: "/put-responses",
          icon: "icon-lamp",
          location: "mainNavigation",
          permission: "managePutResponses",
        },
        {
          text: "Ebarimt config",
          to: "/erxes-plugin-ebarimt/settings/general",
          image: "/images/icons/erxes-04.svg",
          location: "settings",
          scope: "ebarimt",
          action: "syncEbarimtConfig",
          permission: "syncEbarimtConfig",
        },
      ],
      layout: {
        url: "http://localhost:3018/remoteEntry.js",
        scope: "ebarimt",
        module: "./response",
      },
    },
  },
  emailtemplates: {
    ui: {
      name: "emailtemplates",
      port: 3020,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-emailtemplates-ui/remoteEntry.js",
        scope: "emailtemplates",
        module: "./routes",
      },
      menus: [
        {
          text: "Email Templates",
          to: "/settings/email-templates",
          image: "/images/icons/erxes-09.svg",
          location: "settings",
          scope: "emailtemplates",
          action: "",
          permissions: [],
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-emailtemplates-ui/remoteEntry.js",
    },
  },
  engages: {
    ui: {
      name: "engages",
      port: 3001,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-engages-ui/remoteEntry.js",
        scope: "engages",
        module: "./routes",
      },
      menus: [
        {
          text: "Campaigns",
          url: "/campaigns",
          icon: "icon-megaphone",
          location: "mainNavigation",
          permission: "showEngagesMessages",
        },
        {
          text: "Campaign settings",
          to: "/settings/campaign-configs",
          image: "/images/icons/erxes-31.png",
          location: "settings",
          scope: "engages",
          action: "",
          permissions: [],
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-engages-ui/remoteEntry.js",
    },
  },
  exm: {
    ui: {
      name: "exm",
      port: 3105,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-exm-ui/remoteEntry.js",
        scope: "exm",
        module: "./routes",
      },
      menus: [
        {
          text: "Exm core",
          to: "/erxes-plugin-exm/home",
          image: "/images/icons/erxes-30.png",
          location: "settings",
          action: "",
          permissions: ["showExms"],
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-exm-ui/remoteEntry.js",
    },
  },
  exmfeed: {
    ui: {
      name: "exmfeed",
      port: 3111,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-exmfeed-ui/remoteEntry.js",
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
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-exmfeed-ui/remoteEntry.js",
    },
  },
  forms: {
    ui: {
      name: "forms",
      port: 3005,
      scope: "forms",
      exposes: {
        "./routes": "./src/routes.tsx",
        "./segmentForm": "./src/segmentForm.tsx",
      },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-forms-ui/remoteEntry.js",
        scope: "forms",
        module: "./routes",
      },
      segmentForm: "./segmentForm",
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
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-forms-ui/remoteEntry.js",
    },
  },
  inbox: {
    ui: {
      name: "inbox",
      port: 3009,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-inbox-ui/remoteEntry.js",
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
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-inbox-ui/remoteEntry.js",
    },
  },
  integrations: {},
  internalnotes: {},
  knowledgebase: {
    ui: {
      name: "knowledgebase",
      port: 3004,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-knowledgebase-ui/remoteEntry.js",
        scope: "knowledgebase",
        module: "./routes",
      },
      menus: [
        {
          text: "Knowledge Base",
          url: "/knowledgeBase",
          icon: "icon-book-open",
          location: "mainNavigation",
          permission: "showKnowledgeBase",
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-knowledgebase-ui/remoteEntry.js",
    },
  },
  loan: {
    ui: {
      name: "loan",
      port: 3119,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loan-ui/remoteEntry.js",
        scope: "loan",
        module: "./routes",
      },
      menus: [
        {
          text: "Loan",
          url: "/erxes-plugin-loan/home",
          icon: "icon-list-2",
          permission: "pluginLoansAll",
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loan-ui/remoteEntry.js",
    },
  },
  logs: {
    ui: {
      name: "logs",
      port: 3040,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-logs-ui/remoteEntry.js",
        scope: "logs",
        module: "./routes",
      },
      menus: [
        {
          text: "logs",
          to: "/settings/logs",
          image: "/images/icons/erxes-33.png",
          location: "settings",
          scope: "logs",
          component: "./settings",
          action: "",
          permissions: [],
        },
        {
          text: "Email Deliveries",
          to: "/settings/emailDelivery",
          image: "/images/icons/erxes-27.png",
          location: "settings",
          scope: "logs",
          component: "./settings",
          action: "",
          permissions: [],
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-logs-ui/remoteEntry.js",
    },
  },
  loyalties: {
    ui: {
      name: "loyalties",
      port: 3002,
      exposes: {
        "./routes": "./src/routes.tsx",
        "./customerSidebar": "./src/containers/CustomerSidebar.tsx",
        "./companySidebar": "./src/containers/CompanySidebar.tsx",
        "./userSidebar": "./src/containers/UserSidebar.tsx",
      },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loyalties-ui/remoteEntry.js",
        scope: "loyalties",
        module: "./routes",
      },
      menus: [
        {
          text: "Loyalties",
          url: "/vouchers",
          icon: "icon-piggybank",
          location: "mainNavigation",
          permission: "showLoyalties",
        },
        {
          text: "Loyalties config",
          to: "/erxes-plugin-loyalty/settings/general",
          image: "/images/icons/erxes-16.svg",
          location: "settings",
          scope: "loyalties",
          action: "loyaltyConfig",
          permissions: ["manageLoyalties", "showLoyalties"],
        },
      ],
      customerRightSidebarSection: [
        {
          text: "customerSection",
          component: "./customerSidebar",
          scope: "loyalties",
        },
      ],
      companyRightSidebarSection: [
        {
          text: "companySection",
          component: "./companySidebar",
          scope: "loyalties",
        },
      ],
      userRightSidebarSection: [
        { text: "userSection", component: "./userSidebar", scope: "loyalties" },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loyalties-ui/remoteEntry.js",
    },
  },
  neighbor: {
    ui: {
      name: "neighbor",
      port: 3021,
      exposes: {
        "./routes": "./src/routes.tsx",
        "./productCategoryCreateAction": "./src/containers/NeighborForm.tsx",
      },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-neighbor-ui/remoteEntry.js",
        scope: "neighbor",
        module: "./routes",
      },
      menus: [
        {
          text: "Neighbor",
          to: "/erxes-plugin-neighbor?type=kindergarden",
          image: "/images/icons/erxes-05.svg",
          location: "settings",
          scope: "neighbor",
          action: "",
          permissions: [],
        },
      ],
      productCategoryActions: [
        {
          text: "productCategoryCreateAction",
          component: "./productCategoryCreateAction",
          scope: "neighbor",
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-neighbor-ui/remoteEntry.js",
    },
  },
  notifications: {
    ui: {
      name: "notifications",
      port: 3014,
      exposes: {
        "./routes": "./src/routes.tsx",
        "./settings": "./src/containers/Widget.tsx",
      },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-notifications-ui/remoteEntry.js",
        scope: "notifications",
        module: "./routes",
      },
      menus: [
        {
          text: "notifications",
          url: "/notifications",
          icon: "icon-book-open",
          location: "topNavigation",
          scope: "notifications",
          component: "./settings",
        },
        {
          text: "Notification settings",
          to: "/settings/notifications",
          image: "/images/icons/erxes-11.svg",
          location: "settings",
          scope: "notifications",
          action: "notificationsAll",
          permissions: [],
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-notifications-ui/remoteEntry.js",
    },
  },
  webhooks: {
    ui: {
      name: "webhooks",
      port: 3024,
      scope: "webhooks",
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-webhooks-ui/remoteEntry.js",
        scope: "webhooks",
        module: "./routes",
      },
      menus: [
        {
          text: "Outgoing webhooks",
          to: "/settings/webhooks",
          image: "/images/icons/erxes-11.svg",
          location: "settings",
          scope: "webhooks",
          action: "",
          permissions: [],
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-webhooks-ui/remoteEntry.js",
    },
  },
  pos: {
    ui: {
      name: "pos",
      port: 3016,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-pos-ui/remoteEntry.js",
        scope: "pos",
        module: "./routes",
      },
      menus: [
        {
          text: "Pos Orders",
          url: "/pos-orders",
          icon: "icon-lamp",
          location: "mainNavigation",
          permission: "showPos",
        },
        {
          text: "POS",
          to: "/pos",
          image: "/images/icons/erxes-05.svg",
          location: "settings",
          scope: "pos",
          action: "posConfig",
          permissions: ["showPos"],
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-pos-ui/remoteEntry.js",
    },
  },
  products: {
    ui: {
      name: "products",
      port: 3022,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-products-ui/remoteEntry.js",
        scope: "products",
        module: "./routes",
      },
      menus: [
        {
          text: "Product and services",
          to: "/settings/product-service/",
          image: "/images/icons/erxes-31.png",
          location: "settings",
          scope: "products",
          action: "productsAll",
          permissions: ["showProducts", "manageProducts"],
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-products-ui/remoteEntry.js",
    },
  },
  qpay: {
    ui: {
      name: "qpay",
      port: 3019,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-qpay-ui/remoteEntry.js",
        scope: "qpay",
        module: "./routes",
      },
      menus: [
        {
          text: "Qpay config",
          to: "/erxes-plugin-qpay/settings/",
          image: "/images/icons/erxes-16.svg",
          location: "settings",
          scope: "qpay",
          action: "pluginQpayConfig",
          permissions: ["manageQr", "allQr"],
        },
        {
          text: "SocialPay config",
          to: "/erxes-plugin-qpay/settings_socialPay/",
          image: "/images/icons/erxes-16.svg",
          location: "settings",
          scope: "qpay",
          action: "pluginQpayConfig",
          permissions: ["manageQr", "allQr"],
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-qpay-ui/remoteEntry.js",
    },
  },
  reactions: {},
  rentpay: {
    ui: {
      name: "rentpay",
      port: 4011,
      scope: "rentpay",
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-rentpay-ui/remoteEntry.js",
      exposes: {
        "./routes": "./src/routes.tsx",
        "./buyerSection": "./src/BuyerSection.tsx",
        "./waiterSection": "./src/WaiterSection.tsx",
      },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-rentpay-ui/remoteEntry.js",
        scope: "rentpay",
        module: "./routes",
      },
      dealRightSidebarSection: [
        { text: "buyerSection", component: "./buyerSection", scope: "rentpay" },
        {
          text: "waiterSection",
          component: "./waiterSection",
          scope: "rentpay",
        },
      ],
      menus: [],
    },
  },
  segments: {
    ui: {
      name: "segments",
      port: 3013,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-segments-ui/remoteEntry.js",
        scope: "segments",
        module: "./routes",
      },
      menus: [
        {
          text: "Segments",
          url: "/segments",
          icon: "icon-chart-pie-alt",
          location: "mainNavigation",
          permission: "showSegments",
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-segments-ui/remoteEntry.js",
    },
  },
  syncerkhet: {
    ui: {
      name: "syncerkhet",
      port: 3017,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-syncerkhet-ui/remoteEntry.js",
        scope: "syncerkhet",
        module: "./routes",
      },
      menus: [
        {
          text: "Sync Erkhet",
          to: "/erxes-plugin-sync-erkhet/settings/general",
          image: "/images/icons/erxes-04.svg",
          location: "settings",
          scope: "syncerkhet",
          action: "syncErkhetConfig",
          permission: "syncErkhetConfig",
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-syncerkhet-ui/remoteEntry.js",
    },
  },
  tags: {
    ui: {
      name: "tags",
      port: 3012,
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tags-ui/remoteEntry.js",
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
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tags-ui/remoteEntry.js",
    },
  },
  tumentech: {
    ui: {
      name: "tumentech",
      port: 3023,
      scope: "tumentech",
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tumentech-ui/remoteEntry.js",
      exposes: {
        "./routes": "./src/routes.tsx",
        "./driverSection": "./src/DriverSection.tsx",
        "./participantSection": "./src/ParticipantSection.tsx",
        "./carSection": "./src/components/common/CarSection.tsx",
      },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tumentech-ui/remoteEntry.js",
        scope: "tumentech",
        module: "./routes",
      },
      menus: [
        {
          text: "Tumentech",
          url: "/erxes-plugin-tumentech/list",
          icon: "icon-car",
          location: "mainNavigation",
          permission: "showCars",
        },
      ],
      customerRightSidebarSection: [
        {
          text: "customerSection",
          component: "./carSection",
          scope: "tumentech",
        },
      ],
      companyRightSidebarSection: [
        {
          text: "companySection",
          component: "./carSection",
          scope: "tumentech",
        },
      ],
      dealRightSidebarSection: [
        { text: "carSection", component: "./carSection", scope: "tumentech" },
        {
          text: "driverSection",
          component: "./driverSection",
          scope: "tumentech",
        },
        {
          text: "participantSection",
          component: "./participantSection",
          scope: "tumentech",
        },
      ],
    },
  },
};
