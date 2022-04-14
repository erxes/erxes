module.exports = {
  inbox: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      // url: "http://localhost:3009/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-inbox-ui/remoteEntry.js",
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
    ],
  },
  cards: {
    scope: "cards",
    // url: "http://localhost:3003/remoteEntry.js",
    // url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cards-ui/remoteEntry.js",
    url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cards-ui/remoteEntry.js",
    exposes: {
      "./routes": "./src/routes.tsx",
      "./settings": "./src/Settings.tsx",
      "./propertyGroupForm": "./src/propertyGroupForm.tsx",
      "./segmentForm": "./src/segmentForm.tsx",
    },
    routes: {
      // url: "http://localhost:3003/remoteEntry.js",
      // url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cards-ui/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cards-ui/remoteEntry.js",
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
        to: "/settings/boards/growthHack",
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
  contacts: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      // url: "http://localhost:3011/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-contacts-ui/remoteEntry.js",
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
  automations: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      // url: "http://localhost:3008/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-automations-ui/remoteEntry.js",
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
  },
  knowledgebase: {
    exposes: { "./routes": "./src/routes.tsx" },
    routes: {
      // url: "http://localhost:3004/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-knowledgebase-ui/remoteEntry.js",
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
  },
  tags: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      // url: "http://localhost:3012/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tags-ui/remoteEntry.js",
      scope: "tags",
      module: "./routes",
    },
    menus: [
      {
        text: "Tags",
        url: "/tags",
        icon: "icon-tag-alt",
        location: "mainNavigation",
        permission: "showTags",
      },
    ],
  },
  products: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      // url: "http://localhost:3022/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-products-ui/remoteEntry.js",
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
        permissions: ["showProducts", "manageProducts"],
      },
    ],
  },
  notifications: {
    exposes: {
      "./routes": "./src/routes.tsx",
      "./settings": "./src/containers/Widget.tsx",
    },
    routes: {
      // url: "http://localhost:3014/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-notifications-ui/remoteEntry.js",
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
  },
  logs: {
    exposes: { "./routes": "./src/routes.tsx" },
    routes: {
      // url: "http://localhost:3040/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-logs-ui/remoteEntry.js",
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
    ],
  },
  segments: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      // url: "http://localhost:3013/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-segments-ui/remoteEntry.js",
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
  },

  forms: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      // url: "http://localhost:3005/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-forms-ui/remoteEntry.js",
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
  dashboard: {
    exposes: { "./routes": "./src/routes.tsx" },
    routes: {
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-reports-ui/remoteEntry.js",
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
  },
  clientPortal: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      /// url: "http://localhost:3015/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-clientportal-ui/remoteEntry.js",
      scope: "clientPortal",
      module: "./routes",
    },
    menus: [
      {
        text: "Client Portal",
        to: "/settings/client-portal",
        image: "/images/icons/erxes-32.png",
        location: "settings",
        scope: "clientPortal",
        action: "",
        permissions: [],
      },
    ],
  },
  exm: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      // url: "http://localhost:3105/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-exm-ui/remoteEntry.js",
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
  },
  exmfeed: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      // url: "http://localhost:3111/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-exmfeed-ui/remoteEntry.js",
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
  loyalties: {
    exposes: {
      "./routes": "./src/routes.tsx",
      // "./settings": "./src/containers/Widget.tsx",
    },
    routes: {
      // url: "http://localhost:3002/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loyalties-ui/remoteEntry.js",
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
        permissions: ["loyaltyConfig"],
      },
    ],
  },
  cars: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      // url: "http://localhost:3010/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cars-ui/remoteEntry.js",
      scope: "car",
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
  },
  ebarimt: {
    exposes: {
      "./routes": "./src/routes.tsx",
      "./response": "./src/response.tsx",
    },
    routes: {
      // url: "http://localhost:3018/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-ebarimt-ui/remoteEntry.js",
      scope: "ebarimt",
      module: "./routes",
    },
    menus: [
      {
        text: "Put Responses",
        url: "/put-responses",
        icon: "icon-lamp",
        location: "mainNavigation",
        permission: "syncEbarimtConfig",
      },
      {
        text: "Ebarimt config",
        to: "/erxes-plugin-ebarimt/settings/general",
        image: "/images/icons/erxes-04.svg",
        location: "settings",
        scope: "ebarimt",
        action: "syncEbarimtConfig",
        permissions: [],
      },
    ],
    layout: {
      // url: "http://localhost:3018/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-ebarimt-ui/remoteEntry.js",
      scope: "ebarimt",
      module: "./response",
    },
  },
  syncerkhet: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      // url: "http://localhost:3017/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-syncerkhet-ui/remoteEntry.js",
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
        permissions: [],
      },
    ],
  },
  pos: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      // url: "http://localhost:3016/remoteEntry.js",
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-pos-ui/remoteEntry.js",
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
  },
  engages: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-engages-ui/remoteEntry.js",
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
        text: "Campaigns settings",
        to: "#",
        image: "/images/icons/erxes-31.png",
        location: "settings",
        scope: "engages",
        action: "",
        permissions: [],
      },
    ],
  },

  neighbor: {
    exposes: {
      "./routes": "./src/routes.tsx",
    },
    routes: {
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-neighbor-ui/remoteEntry.js",
      scope: "neighbor",
      module: "./routes",
    },
    menus: [
      {
        text: "Neighbor",
        to: "/erxes-plugin-neighbor?type=kindergarden",
        image: "/images/icons/erxes-05.svg",
        location: "settings",
        scope: "Neighbor",
        action: "",
        permissions: [],
      },
    ],
  },
  qpay: {
    exposes: {
      "./routes": "./src/routes.tsx"
    },
    routes: {
      url: "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-qpay-ui/remoteEntry.js",
      scope: "qpay",
      module: "./routes"
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
        permissions: ["manageQr", "allQr"]

      }
    ]
  }
};