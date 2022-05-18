module.exports = {
  inbox: {
    ui: {
      name: "inbox",
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
          text: "Add-ons",
          to: "/settings/add-ons",
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
          text: "Add-ons config",
          to: "/settings/add-ons-config",
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
    api: {
      permissions: {
        inbox: {
          name: "inbox",
          description: "Inbox",
          actions: [
            {
              name: "inboxAll",
              description: "All",
              use: [
                "showConversations",
                "changeConversationStatus",
                "assignConversation",
                "conversationMessageAdd",
                "conversationResolveAll",
              ],
            },
            { name: "showConversations", description: "Show conversations" },
            {
              name: "changeConversationStatus",
              description: "Change conversation status",
            },
            { name: "assignConversation", description: "Assign conversation" },
            {
              name: "conversationMessageAdd",
              description: "Add conversation message",
            },
            {
              name: "conversationResolveAll",
              description: "Resolve all converstaion",
            },
          ],
        },
        integrations: {
          name: "integrations",
          description: "Integrations",
          actions: [
            {
              name: "integrationsAll",
              description: "All",
              use: [
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
                "integrationsCreateBookingIntegration",
                "integrationsEditBookingIntegration",
              ],
            },
            { name: "showIntegrations", description: "Show integrations" },
            {
              name: "integrationsCreateMessengerIntegration",
              description: "Create messenger integration",
            },
            {
              name: "integrationsEditMessengerIntegration",
              description: "Edit messenger integration",
            },
            {
              name: "integrationsSaveMessengerAppearanceData",
              description: "Save messenger appearance data",
            },
            {
              name: "integrationsSaveMessengerConfigs",
              description: "Save messenger config",
            },
            {
              name: "integrationsCreateLeadIntegration",
              description: "Create lead integration",
            },
            {
              name: "integrationsEditLeadIntegration",
              description: "Edit lead integration",
            },
            { name: "integrationsRemove", description: "Remove integration" },
            {
              name: "integrationsArchive",
              description: "Archive an integration",
            },
            {
              name: "integrationsEdit",
              description: "Edit common integration fields",
            },
            {
              name: "integrationsCreateBookingIntegration",
              description: "Create booking integration",
            },
            {
              name: "integrationsEditBookingIntegration",
              description: "Edit booking integration",
            },
          ],
        },
        skillTypes: {
          name: "skillTypes",
          description: "Skill Types",
          actions: [
            {
              name: "skillTypesAll",
              description: "All",
              use: [
                "getSkillTypes",
                "createSkillType",
                "updateSkillType",
                "removeSkillType",
                "manageSkillTypes",
              ],
            },
            { name: "getSkillTypes", description: "Get skill types" },
            { name: "createSkillType", description: "Create skill type" },
            { name: "updateSkillType", description: "Update skill type" },
            { name: "removeSkillType", description: "Remove skill type" },
          ],
        },
        skills: {
          name: "skills",
          description: "Skills",
          actions: [
            {
              name: "skillsAll",
              description: "All",
              use: [
                "getSkill",
                "getSkills",
                "createSkill",
                "updateSkill",
                "removeSkill",
              ],
            },
            { name: "getSkill", description: "Get skill" },
            { name: "getSkills", description: "Get skills" },
            { name: "createSkill", description: "Create skill" },
            { name: "updateSkill", description: "Update skill" },
            { name: "removeSkill", description: "Remove skill" },
          ],
        },
        responseTemplates: {
          name: "responseTemplates",
          description: "Response templates",
          actions: [
            {
              name: "responseTemplatesAll",
              description: "All",
              use: ["manageResponseTemplate", "showResponseTemplates"],
            },
            {
              name: "manageResponseTemplate",
              description: "Manage response template",
            },
            {
              name: "showResponseTemplates",
              description: "Show response templates",
            },
          ],
        },
        channels: {
          name: "channels",
          description: "Channels",
          actions: [
            {
              name: "channelsAll",
              description: "All",
              use: ["showChannels", "manageChannels", "exportChannels"],
            },
            { name: "manageChannels", description: "Manage channels" },
            { name: "showChannels", description: "Show channel" },
            { name: "exportChannels", description: "Export channels" },
          ],
        },
      },
      essyncer: [
        {
          name: "conversations",
          schema: "{ 'customFieldsData' : <nested> }",
          script:
            "if(ns.indexOf('conversations') > -1) {var createdAt = JSON.stringify(doc.createdAt); var closedAt = JSON.stringify(doc.closedAt); var updatedAt = JSON.stringify(doc.updatedAt); var firstRespondedDate = JSON.stringify(doc.firstRespondedDate); if(createdAt){ doc.numberCreatedAt = Number(new Date(createdAt.replace(/\"/g,''))); } if(closedAt){ doc.numberClosedAt = Number(new Date(closedAt.replace(/\"/g,''))); } if(updatedAt){ doc.numberUpdatedAt= Number(new Date(updatedAt.replace(/\"/g,''))); } if(firstRespondedDate){ doc.numberFirstRespondedDate= Number(new Date(firstRespondedDate.replace(/\"/g,''))); }}",
        },
        { name: "conversation_messages", schema: "{}", script: "" },
        { name: "integrations", schema: "{}", script: "" },
        { name: "channels", schema: "{}", script: "" },
        { name: "channels", schema: "{}", script: "" },
      ],
    },
  },
  ads: {},
  automations: {
    ui: {
      name: "automations",
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
    api: {
      permissions: {
        automations: {
          name: "automations",
          description: "Automations",
          actions: [
            {
              name: "automationAll",
              description: "All",
              use: [
                "showAutomations",
                "automationsAdd",
                "automationsEdit",
                "automationsRemove",
              ],
            },
            { name: "showAutomations", description: "Show automations" },
            { name: "automationsAdd", description: "Add automations" },
            { name: "automationsEdit", description: "Edit automations" },
            { name: "automationsRemove", description: "Remove automations" },
          ],
        },
      },
    },
  },
  calendar: {
    ui: {
      name: "calendar",
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
    api: {
      permissions: {
        deals: {
          name: "deals",
          description: "Deals",
          actions: [
            {
              name: "dealsAll",
              description: "All",
              use: [
                "showDeals",
                "dealBoardsAdd",
                "dealBoardsEdit",
                "dealBoardsRemove",
                "dealPipelinesAdd",
                "dealPipelinesEdit",
                "dealPipelinesUpdateOrder",
                "dealPipelinesWatch",
                "dealPipelinesRemove",
                "dealPipelinesArchive",
                "dealPipelinesCopied",
                "dealStagesAdd",
                "dealStagesEdit",
                "dealStagesUpdateOrder",
                "dealStagesRemove",
                "dealsAdd",
                "dealsEdit",
                "dealsRemove",
                "dealsWatch",
                "dealsArchive",
                "dealsSort",
                "exportDeals",
                "dealUpdateTimeTracking",
              ],
            },
            { name: "showDeals", description: "Show deals" },
            { name: "dealBoardsAdd", description: "Add deal board" },
            { name: "dealBoardsRemove", description: "Remove deal board" },
            { name: "dealPipelinesAdd", description: "Add deal pipeline" },
            { name: "dealPipelinesEdit", description: "Edit deal pipeline" },
            {
              name: "dealPipelinesRemove",
              description: "Remove deal pipeline",
            },
            {
              name: "dealPipelinesArchive",
              description: "Archive deal pipeline",
            },
            {
              name: "dealPipelinesCopied",
              description: "Duplicate deal pipeline",
            },
            {
              name: "dealPipelinesUpdateOrder",
              description: "Update pipeline order",
            },
            { name: "dealPipelinesWatch", description: "Deal pipeline watch" },
            { name: "dealStagesAdd", description: "Add deal stage" },
            { name: "dealStagesEdit", description: "Edit deal stage" },
            {
              name: "dealStagesUpdateOrder",
              description: "Update stage order",
            },
            { name: "dealStagesRemove", description: "Remove deal stage" },
            { name: "dealsAdd", description: "Add deal" },
            { name: "dealsEdit", description: "Edit deal" },
            { name: "dealsRemove", description: "Remove deal" },
            { name: "dealsWatch", description: "Watch deal" },
            {
              name: "dealsArchive",
              description: "Archive all deals in a specific stage",
            },
            {
              name: "dealsSort",
              description: "Sort all deals in a specific stage",
            },
            { name: "exportDeals", description: "Export deals" },
            {
              name: "dealUpdateTimeTracking",
              description: "Update time tracking",
            },
          ],
        },
        tickets: {
          name: "tickets",
          description: "Tickets",
          actions: [
            {
              name: "ticketsAll",
              description: "All",
              use: [
                "showTickets",
                "ticketBoardsAdd",
                "ticketBoardsEdit",
                "ticketBoardsRemove",
                "ticketPipelinesAdd",
                "ticketPipelinesEdit",
                "ticketPipelinesUpdateOrder",
                "ticketPipelinesWatch",
                "ticketPipelinesRemove",
                "ticketPipelinesArchive",
                "ticketPipelinesCopied",
                "ticketStagesAdd",
                "ticketStagesEdit",
                "ticketStagesUpdateOrder",
                "ticketStagesRemove",
                "ticketsAdd",
                "ticketsEdit",
                "ticketsRemove",
                "ticketsWatch",
                "ticketsArchive",
                "ticketsSort",
                "exportTickets",
                "ticketUpdateTimeTracking",
              ],
            },
            { name: "showTickets", description: "Show tickets" },
            { name: "ticketBoardsAdd", description: "Add ticket board" },
            { name: "ticketBoardsEdit", description: "Edit ticket board" },
            { name: "ticketBoardsRemove", description: "Remove ticket board" },
            { name: "ticketPipelinesAdd", description: "Add ticket pipeline" },
            {
              name: "ticketPipelinesEdit",
              description: "Edit ticket pipeline",
            },
            {
              name: "ticketPipelinesRemove",
              description: "Remove ticket pipeline",
            },
            {
              name: "ticketPipelinesArchive",
              description: "Archive ticket pipeline",
            },
            {
              name: "ticketPipelinesCopied",
              description: "Duplicate ticket pipeline",
            },
            {
              name: "ticketPipelinesWatch",
              description: "Ticket pipeline watch",
            },
            {
              name: "ticketPipelinesUpdateOrder",
              description: "Update pipeline order",
            },
            { name: "ticketStagesAdd", description: "Add ticket stage" },
            { name: "ticketStagesEdit", description: "Edit ticket stage" },
            {
              name: "ticketStagesUpdateOrder",
              description: "Update stage order",
            },
            { name: "ticketStagesRemove", description: "Remove ticket stage" },
            { name: "ticketsAdd", description: "Add ticket" },
            { name: "ticketsEdit", description: "Edit ticket" },
            { name: "ticketsRemove", description: "Remove ticket" },
            { name: "ticketsWatch", description: "Watch ticket" },
            {
              name: "ticketsArchive",
              description: "Archive all tickets in a specific stage",
            },
            {
              name: "ticketsSort",
              description: "Sort all tickets in a specific stage",
            },
            { name: "exportTickets", description: "Export tickets" },
            {
              name: "ticketUpdateTimeTracking",
              description: "Update time tracking",
            },
          ],
        },
        growthHacks: {
          name: "growthHacks",
          description: "Growth hacking",
          actions: [
            {
              name: "growthHacksAll",
              description: "All",
              use: [
                "showGrowthHacks",
                "growthHackBoardsAdd",
                "growthHackBoardsEdit",
                "growthHackBoardsRemove",
                "growthHackPipelinesAdd",
                "growthHackPipelinesEdit",
                "growthHackPipelinesUpdateOrder",
                "growthHackPipelinesWatch",
                "growthHackPipelinesRemove",
                "growthHackPipelinesArchive",
                "growthHackPipelinesCopied",
                "growthHackStagesAdd",
                "growthHackStagesEdit",
                "growthHackStagesUpdateOrder",
                "growthHackStagesRemove",
                "growthHacksAdd",
                "growthHacksEdit",
                "growthHacksRemove",
                "growthHacksWatch",
                "growthHacksArchive",
                "growthHacksSort",
                "growthHackTemplatesAdd",
                "growthHackTemplatesEdit",
                "growthHackTemplatesRemove",
                "growthHackTemplatesDuplicate",
                "showGrowthHackTemplates",
              ],
            },
            { name: "showGrowthHacks", description: "Show growth hacks" },
            {
              name: "growthHackBoardsAdd",
              description: "Add growth hacking board",
            },
            {
              name: "growthHackBoardsRemove",
              description: "Remove growth hacking board",
            },
            {
              name: "growthHackPipelinesAdd",
              description: "Add growth hacking pipeline",
            },
            {
              name: "growthHackPipelinesEdit",
              description: "Edit growth hacking pipeline",
            },
            {
              name: "growthHackPipelinesRemove",
              description: "Remove growth hacking pipeline",
            },
            {
              name: "growthHackPipelinesArchive",
              description: "Archive growth hacking pipeline",
            },
            {
              name: "growthHackPipelinesCopied",
              description: "Copied growth hacking pipeline",
            },
            {
              name: "growthHackPipelinesWatch",
              description: "Growth hacking pipeline watch",
            },
            {
              name: "growthHackPipelinesUpdateOrder",
              description: "Update pipeline order",
            },
            {
              name: "growthHackStagesAdd",
              description: "Add growth hacking stage",
            },
            {
              name: "growthHackStagesEdit",
              description: "Edit growth hacking stage",
            },
            {
              name: "growthHackStagesUpdateOrder",
              description: "Update stage order",
            },
            {
              name: "growthHackStagesRemove",
              description: "Remove growth hacking stage",
            },
            { name: "growthHacksAdd", description: "Add growth hacking" },
            { name: "growthHacksEdit", description: "Edit growth hacking" },
            { name: "growthHacksRemove", description: "Remove growth hacking" },
            { name: "growthHacksWatch", description: "Watch growth hacking" },
            {
              name: "growthHacksArchive",
              description: "Archive all growth hacks in a specific stage",
            },
            {
              name: "growthHacksSort",
              description: "Sort all growth hacks in a specific stage",
            },
            {
              name: "growthHackTemplatesAdd",
              description: "Add growth hacking template",
            },
            {
              name: "growthHackTemplatesEdit",
              description: "Edit growth hacking template",
            },
            {
              name: "growthHackTemplatesRemove",
              description: "Remove growth hacking template",
            },
            {
              name: "growthHackTemplatesDuplicate",
              description: "Duplicate growth hacking template",
            },
            {
              name: "showGrowthHackTemplates",
              description: "Show growth hacking template",
            },
          ],
        },
        tasks: {
          name: "tasks",
          description: "Tasks",
          actions: [
            {
              name: "tasksAll",
              description: "All",
              use: [
                "showTasks",
                "taskBoardsAdd",
                "taskBoardsEdit",
                "taskBoardsRemove",
                "taskPipelinesAdd",
                "taskPipelinesEdit",
                "taskPipelinesUpdateOrder",
                "taskPipelinesWatch",
                "taskPipelinesRemove",
                "taskPipelinesArchive",
                "taskPipelinesCopied",
                "taskStagesAdd",
                "taskStagesEdit",
                "taskStagesUpdateOrder",
                "taskStagesRemove",
                "tasksAdd",
                "tasksEdit",
                "tasksRemove",
                "tasksWatch",
                "tasksArchive",
                "tasksSort",
                "taskUpdateTimeTracking",
                "exportTasks",
              ],
            },
            { name: "showTasks", description: "Show tasks" },
            { name: "taskBoardsAdd", description: "Add task board" },
            { name: "taskBoardsRemove", description: "Remove task board" },
            { name: "taskPipelinesAdd", description: "Add task pipeline" },
            { name: "taskPipelinesEdit", description: "Edit task pipeline" },
            {
              name: "taskPipelinesRemove",
              description: "Remove task pipeline",
            },
            {
              name: "taskPipelinesArchive",
              description: "Archive task pipeline",
            },
            {
              name: "taskPipelinesCopied",
              description: "Duplicate task pipeline",
            },
            { name: "taskPipelinesWatch", description: "Task pipeline watch" },
            {
              name: "taskPipelinesUpdateOrder",
              description: "Update pipeline order",
            },
            { name: "taskStagesAdd", description: "Add task stage" },
            { name: "taskStagesEdit", description: "Edit task stage" },
            {
              name: "taskStagesUpdateOrder",
              description: "Update stage order",
            },
            { name: "taskStagesRemove", description: "Remove task stage" },
            { name: "tasksAdd", description: "Add task" },
            { name: "tasksEdit", description: "Edit task" },
            { name: "tasksRemove", description: "Remove task" },
            { name: "tasksWatch", description: "Watch task" },
            {
              name: "tasksArchive",
              description: "Archive all tasks in a specific stage",
            },
            {
              name: "tasksSort",
              description: "Sort all tasks in a specific stage",
            },
            {
              name: "taskUpdateTimeTracking",
              description: "Update time tracking",
            },
            { name: "exportTasks", description: "Export tasks" },
          ],
        },
      },
      essyncer: [
        {
          name: "deals",
          schema:
            "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
          script:
            "if(ns.indexOf('deals') > -1) { if (doc.productsData) { var productsDataString = JSON.stringify(doc.productsData); var amount = 0; var productsData = JSON.parse(productsDataString); for (var i = 0; i < productsData.length; i++){ amount = amount + productsData[i].amount; } doc.amount = amount; } } ",
        },
        {
          name: "tickets",
          schema:
            "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
          script: "",
        },
        {
          name: "tasks",
          schema:
            "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
          script: "",
        },
        {
          name: "tasks",
          schema:
            "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
          script: "",
        },
        { name: "stages", schema: "{}", script: "" },
        { name: "pipelines", schema: "{}", script: "" },
      ],
    },
  },
  cars: {
    ui: {
      name: "cars",
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
    api: {
      permissions: {
        cars: {
          name: "cars",
          description: "Cars",
          actions: [
            {
              name: "all",
              description: "All",
              use: ["showCars", "manageCars"],
            },
            { name: "showCars", description: "Show cars" },
            { name: "manageCars", description: "Manage cars" },
          ],
        },
      },
    },
  },
  chats: {
    ui: {
      name: "chats",
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
    api: {
      permissions: {
        chats: {
          name: "chats",
          description: "Chats",
          actions: [
            {
              name: "chatsAll",
              description: "All",
              use: ["showChats", "manageChats"],
            },
            { name: "showChats", description: "Show chats" },
            { name: "manageChats", description: "Manage Chats" },
          ],
        },
      },
    },
  },
  clientportal: {
    ui: {
      name: "clientportal",
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
    api: {
      permissions: {
        clientPortal: {
          name: "clientPortal",
          description: "Client portal",
          actions: [
            { name: "manageClientPortal", description: "Manage client portal" },
          ],
        },
      },
    },
  },
  contacts: {
    ui: {
      name: "contacts",
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
    api: {
      permissions: {
        dashboards: {
          name: "dashboards",
          description: "Dashboards",
          actions: [
            {
              name: "dashboardsAll",
              description: "All",
              use: [
                "showDashboards",
                "dashboardAdd",
                "dashboardEdit",
                "dashboardRemove",
                "dashboardItemAdd",
                "dashboardItemEdit",
                "dashboardItemRemove",
              ],
            },
            { name: "dashboardAdd", description: "Add dashboard" },
            { name: "dashboardEdit", description: "Edit dashboard" },
            { name: "dashboardRemove", description: "Remove dashboard" },
            { name: "dashboardItemAdd", description: "Add dashboard item" },
            { name: "dashboardItemEdit", description: "Edit dashboard item" },
            {
              name: "dashboardItemRemove",
              description: "Remove dashboard item",
            },
            { name: "showDashboards", description: "Show dashboards" },
          ],
        },
      },
    },
  },
  ebarimt: {
    ui: {
      name: "ebarimt",
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
    api: {
      permissions: {
        ebarimt: {
          name: "ebarimt",
          description: "Ebarimt",
          actions: [
            {
              name: "ebarimtAll",
              description: "All",
              use: ["managePutResponses", "syncEbarimtConfig"],
            },
            { name: "managePutResponses", description: "Manage Put responses" },
            { name: "syncEbarimtConfig", description: "Manage ebarimt config" },
          ],
        },
      },
    },
  },
  emailtemplates: {
    ui: {
      name: "emailtemplates",
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
    api: {
      permissions: {
        emailTemplates: {
          name: "emailTemplates",
          description: "Email template",
          actions: [
            {
              name: "emailTemplateAll",
              description: "All",
              use: ["showEmailTemplates", "manageEmailTemplate"],
            },
            {
              name: "manageEmailTemplate",
              description: "Manage email template",
            },
            { name: "showEmailTemplates", description: "Show email templates" },
          ],
        },
      },
    },
  },
  engages: {
    ui: {
      name: "engages",
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
    api: {
      permissions: {
        engages: {
          name: "engages",
          description: "Campaigns",
          actions: [
            {
              name: "engagesAll",
              description: "All",
              use: [
                "engageMessageSetLiveManual",
                "engageMessageSetPause",
                "engageMessageSetLive",
                "showEngagesMessages",
                "engageMessageAdd",
                "engageMessageEdit",
                "engageMessageRemove",
              ],
            },
            {
              name: "engageMessageSetLive",
              description: "Set an auto campaign live",
            },
            { name: "engageMessageSetPause", description: "Pause a campaign" },
            {
              name: "engageMessageSetLiveManual",
              description: "Set a manual campaign live",
            },
            { name: "engageMessageRemove", description: "Remove a campaign" },
            { name: "engageMessageEdit", description: "Edit a campaign" },
            { name: "engageMessageAdd", description: "Add a campaign" },
            { name: "showEngagesMessages", description: "See campaign list" },
          ],
        },
      },
    },
  },
  exm: {
    ui: {
      name: "exm",
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
    api: {
      permissions: {
        exm: {
          name: "exm",
          description: "Exm core",
          actions: [
            { name: "showExms", description: "Show exm" },
            { name: "manageExms", description: "Manage exm" },
            {
              name: "exmsAll",
              description: "All",
              use: ["showExms", "manageExms"],
            },
          ],
        },
      },
    },
  },
  exmfeed: {
    ui: {
      name: "exmfeed",
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
    api: {
      permissions: {
        engages: {
          name: "exmfeed",
          description: "Exm feed",
          actions: [
            {
              name: "showExmActivityFeed",
              description: "Show exm activity feed",
            },
            {
              name: "manageExmActivityFeed",
              description: "Manage exm activity feed",
            },
            {
              name: "exmActivityFeedAll",
              description: "All",
              use: ["showExmActivityFeed", "manageExmActivityFeed"],
            },
          ],
        },
      },
    },
  },
  forms: {
    ui: {
      name: "forms",
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
    api: {
      permissions: {
        forms: {
          name: "forms",
          description: "Form",
          actions: [
            {
              name: "formsAll",
              description: "All",
              use: ["showForms", "manageForms"],
            },
            { name: "manageForms", description: "Manage forms" },
            { name: "showForms", description: "Show forms" },
          ],
        },
      },
      essyncer: [{ name: "form_submissions", schema: "{}", script: "" }],
    },
  },
  integrations: {},
  internalnotes: {},
  knowledgebase: {
    ui: {
      name: "knowledgebase",
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
    api: {
      permissions: {
        knowledgeBase: {
          name: "knowledgeBase",
          description: "KnowledgeBase",
          actions: [
            {
              name: "knowledgeBaseAll",
              description: "All",
              use: ["showKnowledgeBase", "manageKnowledgeBase"],
            },
            {
              name: "manageKnowledgeBase",
              description: "Manage knowledge base",
            },
            { name: "showKnowledgeBase", description: "Show knowledge base" },
          ],
        },
      },
    },
  },
  loan: {
    ui: {
      name: "loan",
      exposes: { "./routes": "./src/routes.tsx" },
      routes: {
        url:
          "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loan-ui/remoteEntry.js",
        scope: "loan",
        module: "./routes",
      },
      menus: [
        {
          text: "Contracts",
          url: "/contract-list",
          icon: "icon-medal",
          location: "mainNavigation",
          permission: "showContracts",
        },
        {
          text: "Contract types",
          image: "/images/icons/erxes-01.svg",
          to: "/settings/contract-types/",
          action: "loanConfig",
          scope: "loan",
          location: "settings",
          permissions: ["manageContracts"],
        },
        {
          text: "Insurance types",
          image: "/images/icons/erxes-13.svg",
          to: "/insurance-types/",
          action: "loanConfig",
          scope: "loan",
          location: "settings",
          permissions: ["manageContracts"],
        },
        {
          text: "Loan config",
          image: "/images/icons/erxes-16.svg",
          to: "/settings/holiday-settings/",
          action: "loanConfig",
          scope: "loan",
          location: "settings",
          permissions: ["manageContracts"],
        },
      ],
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loan-ui/remoteEntry.js",
    },
  },
  logs: {
    ui: {
      name: "logs",
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
    api: {
      permissions: {
        logs: {
          name: "logs",
          description: "Logs",
          actions: [{ name: "viewLogs", description: "View logs" }],
        },
      },
    },
  },
  loyalties: {
    ui: {
      name: "loyalties",
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
    api: {
      permissions: {
        loyalties: {
          name: "loyalties",
          description: "Loyalties",
          actions: [
            {
              name: "loyaltyAll",
              description: "All",
              use: ["showLoyalties", "manageLoyalties"],
            },
            { name: "showLoyalties", description: "Show loyalties" },
            { name: "manageLoyalties", description: "Manage loyalties" },
          ],
        },
      },
    },
  },
  neighbor: {
    ui: {
      name: "neighbor",
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
    api: {
      permissions: {
        webhooks: {
          name: "webhooks",
          description: "Webhooks",
          actions: [
            {
              name: "webhooksAll",
              description: "All",
              use: ["showWebhooks", "manageWebhooks"],
            },
            { name: "showWebhooks", description: "Show webhooks" },
            { name: "manageWebhooks", description: "Manage webhooks" },
          ],
        },
      },
    },
  },
  pos: {
    ui: {
      name: "pos",
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
    api: {
      permissions: {
        pos: {
          name: "pos",
          description: "POS",
          actions: [
            {
              name: "posAll",
              description: "All",
              use: ["managePos", "showPos"],
            },
            { name: "managePos", description: "Manage POS" },
            { name: "showPos", description: "Show" },
          ],
        },
      },
    },
  },
  products: {
    ui: {
      name: "products",
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
    api: {
      permissions: {
        products: {
          name: "products",
          description: "Products",
          actions: [
            {
              name: "productsAll",
              description: "All",
              use: ["showProducts", "manageProducts", "productsMerge"],
            },
            {
              name: "manageProducts",
              description: "Manage products",
              use: ["showProducts"],
            },
            { name: "showProducts", description: "Show products" },
            { name: "productsMerge", description: "Merge products" },
          ],
        },
      },
    },
  },
  qpay: {
    ui: {
      name: "qpay",
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
    api: {
      permissions: {
        qpay: {
          name: "qpay",
          description: "QPAY",
          actions: [
            { name: "qpayAll", description: "All", use: ["manageQr", "allQr"] },
            { name: "manageQr", description: "Manage QR" },
            { name: "allQr", description: "All QR" },
          ],
        },
      },
    },
  },
  reactions: {},
  rentpay: {
    ui: {
      name: "rentpay",
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
    api: {
      permissions: {
        segments: {
          name: "segments",
          description: "Segments",
          actions: [
            {
              name: "segmentsAll",
              description: "All",
              use: ["showSegments", "manageSegments"],
            },
            { name: "manageSegments", description: "Manage segments" },
            { name: "showSegments", description: "Show segments list" },
          ],
        },
      },
    },
  },
  syncerkhet: {
    ui: {
      name: "syncerkhet",
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
    api: {
      permissions: {
        syncerkhet: {
          name: "erkhet",
          description: "Erkhet",
          actions: [
            { name: "syncErkhetConfig", description: "Manage erkhet config" },
          ],
        },
      },
    },
  },
  tags: {
    ui: {
      name: "tags",
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
          to: "/tags",
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
      scope: "tumentech",
      url:
        "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tumentech-ui/remoteEntry.js",
      exposes: {
        "./routes": "./src/routes.tsx",
        "./participantsSection": "./src/Participants.tsx",
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
          text: "participantsSection",
          component: "./participantsSection",
          scope: "tumentech",
        },
      ],
    },
  },
};
