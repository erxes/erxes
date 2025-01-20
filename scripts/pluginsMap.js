module.exports = {
  "inbox": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-inbox-ui/src",
      "name": "inbox",
      "scope": "inbox",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./activityLog": "./src/activityLogs/activityLog.tsx",
        "./automation": "./src/automations/automation.tsx",
        "./unreadCount": "./src/inbox/containers/UnreadCount.tsx",
        "./actionForms": "./src/settings/integrations/containers/ActionForms",
        "./emailWidget": "./src/inbox/containers/EmailWidget.tsx",
        "./integrationDetailsForm": "./src/forms/components/CallproEditForm.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-inbox-ui/remoteEntry.js",
        "scope": "inbox",
        "module": "./routes"
      },
      "activityLog": "./activityLog",
      "automation": "./automation",
      "actionForms": "./actionForms",
      "menus": [
        {
          "text": "Team Inbox",
          "url": "/inbox",
          "icon": "icon-chat",
          "location": "mainNavigation",
          "permission": "showConversations"
        },
        {
          "text": "Skills",
          "to": "/settings/skills",
          "image": "/images/icons/erxes-29.png",
          "location": "settings",
          "scope": "inbox",
          "action": "skillTypesAll",
          "permissions": [
            "getSkillTypes",
            "getSkill",
            "getSkills",
            "manageSkills",
            "manageSkillTypes"
          ]
        },
        {
          "text": "Channels",
          "to": "/settings/channels",
          "image": "/images/icons/erxes-05.svg",
          "location": "settings",
          "scope": "inbox",
          "action": "channelsAll",
          "permissions": [
            "showChannels",
            "manageChannels"
          ]
        },
        {
          "text": "Integrations",
          "to": "/settings/integrations",
          "image": "/images/icons/erxes-04.svg",
          "location": "settings",
          "scope": "inbox",
          "action": "integrationsAll",
          "permissions": [
            "showIntegrations",
            "integrationsCreateMessengerIntegration",
            "integrationsEditMessengerIntegration",
            "integrationsSaveMessengerAppearanceData",
            "integrationsSaveMessengerConfigs",
            "integrationsCreateLeadIntegration",
            "integrationsEditLeadIntegration",
            "integrationsRemove",
            "integrationsArchive",
            "integrationsEdit"
          ]
        },
        {
          "text": "Integrations config",
          "to": "/settings/integrations-config",
          "image": "/images/icons/erxes-24.svg",
          "location": "settings",
          "scope": "inbox",
          "action": "generalSettingsAll",
          "permissions": [
            "manageGeneralSettings",
            "showGeneralSettings"
          ]
        },
        {
          "text": "Responses",
          "to": "/settings/response-templates",
          "image": "/images/icons/erxes-10.svg",
          "location": "settings",
          "scope": "inbox",
          "action": "responseTemplatesAll",
          "permissions": [
            "manageResponseTemplate",
            "showResponseTemplates"
          ]
        },
        {
          "text": "Widget Script Manager",
          "to": "/settings/scripts",
          "image": "/images/icons/erxes-34.png",
          "location": "settings",
          "scope": "inbox",
          "action": "scriptsAll",
          "permissions": [
            "manageScripts",
            "showScripts"
          ]
        },
        {
          "text": "Send an Email",
          "url": "/emailWidget",
          "icon": "icon-envelope",
          "location": "topNavigation",
          "scope": "inbox",
          "component": "./emailWidget"
        }
      ],
      "customNavigationLabel": [
        {
          "text": "unreadCount",
          "component": "./unreadCount",
          "scope": "inbox"
        }
      ],
      "integrationDetailsForm": "./integrationDetailsForm",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-inbox-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "inbox": {
          "name": "inbox",
          "description": "Inbox",
          "actions": [
            {
              "name": "inboxAll",
              "description": "All",
              "use": [
                "showConversations",
                "changeConversationStatus",
                "assignConversation",
                "conversationMessageAdd",
                "conversationResolveAll"
              ]
            },
            {
              "name": "showConversations",
              "description": "Show conversations"
            },
            {
              "name": "changeConversationStatus",
              "description": "Change conversation status"
            },
            {
              "name": "assignConversation",
              "description": "Assign conversation"
            },
            {
              "name": "conversationMessageAdd",
              "description": "Add conversation message"
            },
            {
              "name": "conversationResolveAll",
              "description": "Resolve all converstaion"
            }
          ]
        },
        "integrations": {
          "name": "integrations",
          "description": "Integrations",
          "actions": [
            {
              "name": "integrationsAll",
              "description": "All",
              "use": [
                "showIntegrations",
                "integrationsCreateMessengerIntegration",
                "integrationsEditMessengerIntegration",
                "integrationsSaveMessengerAppearanceData",
                "integrationsSaveMessengerConfigs",
                "integrationsCreateLeadIntegration",
                "integrationsEditLeadIntegration",
                "integrationsRemove",
                "integrationsArchive",
                "integrationsEdit"
              ]
            },
            {
              "name": "showIntegrations",
              "description": "Show integrations"
            },
            {
              "name": "integrationsCreateMessengerIntegration",
              "description": "Create messenger integration"
            },
            {
              "name": "integrationsEditMessengerIntegration",
              "description": "Edit messenger integration"
            },
            {
              "name": "integrationsSaveMessengerAppearanceData",
              "description": "Save messenger appearance data"
            },
            {
              "name": "integrationsSaveMessengerConfigs",
              "description": "Save messenger config"
            },
            {
              "name": "integrationsCreateLeadIntegration",
              "description": "Create lead integration"
            },
            {
              "name": "integrationsEditLeadIntegration",
              "description": "Edit lead integration"
            },
            {
              "name": "integrationsRemove",
              "description": "Remove integration"
            },
            {
              "name": "integrationsArchive",
              "description": "Archive an integration"
            },
            {
              "name": "integrationsEdit",
              "description": "Edit common integration fields"
            }
          ]
        },
        "skillTypes": {
          "name": "skillTypes",
          "description": "Skill Types",
          "actions": [
            {
              "name": "skillTypesAll",
              "description": "All",
              "use": [
                "getSkillTypes",
                "createSkillType",
                "updateSkillType",
                "removeSkillType",
                "manageSkillTypes"
              ]
            },
            {
              "name": "getSkillTypes",
              "description": "Get skill types"
            },
            {
              "name": "createSkillType",
              "description": "Create skill type"
            },
            {
              "name": "updateSkillType",
              "description": "Update skill type"
            },
            {
              "name": "removeSkillType",
              "description": "Remove skill type"
            }
          ]
        },
        "skills": {
          "name": "skills",
          "description": "Skills",
          "actions": [
            {
              "name": "skillsAll",
              "description": "All",
              "use": [
                "getSkill",
                "getSkills",
                "createSkill",
                "updateSkill",
                "removeSkill"
              ]
            },
            {
              "name": "getSkill",
              "description": "Get skill"
            },
            {
              "name": "getSkills",
              "description": "Get skills"
            },
            {
              "name": "createSkill",
              "description": "Create skill"
            },
            {
              "name": "updateSkill",
              "description": "Update skill"
            },
            {
              "name": "removeSkill",
              "description": "Remove skill"
            }
          ]
        },
        "responseTemplates": {
          "name": "responseTemplates",
          "description": "Response templates",
          "actions": [
            {
              "name": "responseTemplatesAll",
              "description": "All",
              "use": [
                "manageResponseTemplate",
                "showResponseTemplates"
              ]
            },
            {
              "name": "manageResponseTemplate",
              "description": "Manage response template"
            },
            {
              "name": "showResponseTemplates",
              "description": "Show response templates"
            }
          ]
        },
        "channels": {
          "name": "channels",
          "description": "Channels",
          "actions": [
            {
              "name": "channelsAll",
              "description": "All",
              "use": [
                "showChannels",
                "manageChannels",
                "exportChannels",
                "removeChannels"
              ]
            },
            {
              "name": "manageChannels",
              "description": "Manage channels"
            },
            {
              "name": "removeChannels",
              "description": "Remove channels"
            },
            {
              "name": "showChannels",
              "description": "Show channel"
            },
            {
              "name": "exportChannels",
              "description": "Export channels"
            }
          ]
        },
        "scripts": {
          "name": "scripts",
          "description": "Scripts",
          "actions": [
            {
              "name": "scriptsAll",
              "description": "All",
              "use": [
                "showScripts",
                "manageScripts"
              ]
            },
            {
              "name": "manageScripts",
              "description": "Manage scripts"
            },
            {
              "name": "showScripts",
              "description": "Show scripts"
            }
          ]
        }
      },
      "essyncer": [
        {
          "name": "conversations",
          "schema": "{ 'customFieldsData' : <nested> }",
          "script": "if(ns.indexOf('conversations') > -1) {var createdAt = JSON.stringify(doc.createdAt); var closedAt = JSON.stringify(doc.closedAt); var updatedAt = JSON.stringify(doc.updatedAt); var firstRespondedDate = JSON.stringify(doc.firstRespondedDate); if(createdAt){ doc.numberCreatedAt = Number(new Date(createdAt.replace(/\"/g,''))); } if(closedAt){ doc.numberClosedAt = Number(new Date(closedAt.replace(/\"/g,''))); } if(updatedAt){ doc.numberUpdatedAt= Number(new Date(updatedAt.replace(/\"/g,''))); } if(firstRespondedDate){ doc.numberFirstRespondedDate= Number(new Date(firstRespondedDate.replace(/\"/g,''))); }}"
        },
        {
          "name": "conversation_messages",
          "schema": "{}",
          "script": ""
        },
        {
          "name": "integrations",
          "schema": "{}",
          "script": ""
        },
        {
          "name": "channels",
          "schema": "{}",
          "script": ""
        }
      ]
    }
  },
  "automations": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-automations-ui/src",
      "name": "automations",
      "scope": "automations",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./activityLog": "./src/activityLogs/index.tsx",
        "./template": "./src/templates/template.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-automations-ui/remoteEntry.js",
        "scope": "automations",
        "module": "./routes"
      },
      "activityLog": "./activityLog",
      "template": "./template",
      "menus": [
        {
          "text": "Automations",
          "url": "/automations",
          "location": "mainNavigation",
          "icon": "icon-circular",
          "permission": "showAutomations"
        },
        {
          "text": "Automations config",
          "to": "/settings/automations/general",
          "image": "/images/icons/erxes-14.svg",
          "location": "settings",
          "scope": "automations"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-automations-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "automations": {
          "name": "automations",
          "description": "Automations",
          "actions": [
            {
              "name": "automationAll",
              "description": "All",
              "use": [
                "showAutomations",
                "automationsAdd",
                "automationsEdit",
                "automationsRemove"
              ]
            },
            {
              "name": "showAutomations",
              "description": "Show automations"
            },
            {
              "name": "automationsAdd",
              "description": "Add automations"
            },
            {
              "name": "automationsEdit",
              "description": "Edit automations"
            },
            {
              "name": "automationsRemove",
              "description": "Remove automations"
            }
          ]
        }
      }
    }
  },
  "calendar": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-calendar-ui/src",
      "name": "calendar",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./settings": "./src/Settings.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-calendar-ui/remoteEntry.js",
        "scope": "calendar",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Calendar",
          "url": "/calendar",
          "icon": "icon-calendar-alt",
          "location": "mainNavigation",
          "permission": "showCalendars"
        },
        {
          "text": "Calendar settings",
          "to": "/settings/calendars",
          "image": "/images/icons/erxes-21.svg",
          "location": "settings",
          "scope": "calendar",
          "action": "calendarsAll",
          "permissions": [
            "calendarsAdd",
            "calendarsEdit",
            "calendarsRemove",
            "showCalendars",
            "showCalendarGroups",
            "calendarGroupsAdd",
            "calendarGroupsEdit",
            "calendarGroupsRemove"
          ]
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-calendar-ui/remoteEntry.js"
    }
  },
  "calls": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-calls-ui/src",
      "name": "calls",
      "scope": "calls",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./call": "./src/containers/SipProvider.tsx",
        "./inboxIntegrationForm": "./src/components/IntegrationForm.tsx",
        "./integrationDetailsForm": "./src/components/IntegrationEditForm.tsx",
        "./integrationCustomActions": "./src/components/TokenButton.tsx",
        "./inboxIntegrationSettings": "./src/containers/UpdateConfigsContainer.tsx",
        "./activityLog": "./src/components/ActivityLogs.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-calls-ui/remoteEntry.js",
        "scope": "calls",
        "module": "./routes"
      },
      "layout": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-calls-ui/remoteEntry.js",
        "scope": "calls",
        "module": "./call"
      },
      "menus": [
        {
          "text": "Call Center",
          "url": "/calls/switchboard",
          "icon": "icon-phone-call",
          "location": "mainNavigation",
          "permission": "showCallDashboard"
        }
      ],
      "inboxIntegrationForm": "./inboxIntegrationForm",
      "invoiceDetailRightSection": "./invoiceDetailRightSection",
      "integrationDetailsForm": "./integrationDetailsForm",
      "integrationCustomActions": "./integrationCustomActions",
      "inboxIntegrationSettings": "./inboxIntegrationSettings",
      "inboxIntegrations": [
        {
          "name": "Grand stream",
          "description": "Configure Grand stream device",
          "isAvailable": true,
          "kind": "calls",
          "logo": "/images/integrations/grandstream.png",
          "createModal": "grandstream"
        }
      ],
      "activityLog": "./activityLog",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-calls-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "engages": {
          "name": "calls",
          "description": "Calls",
          "actions": [
            {
              "name": "callsAll",
              "description": "All",
              "use": [
                "showCallRecord",
                "showCallDashboard"
              ]
            },
            {
              "name": "showCallRecord",
              "description": "Show call record"
            },
            {
              "name": "showCallDashboard",
              "description": "Show call dashboard"
            }
          ]
        }
      }
    }
  },
  "cars": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-cars-ui/src",
      "name": "cars",
      "scope": "cars",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./customerSidebar": "./src/sidebars/CustomerSidebar.tsx",
        "./companySidebar": "./src/sidebars/CompanySidebar.tsx",
        "./dealSidebar": "./src/sidebars/DealSidebar.tsx",
        "./selectRelation": "./src/containers/SelectRelation.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cars-ui/remoteEntry.js",
        "scope": "cars",
        "module": "./routes"
      },
      "selectRelation": "./selectRelation",
      "menus": [
        {
          "text": "Plugin Car",
          "url": "/cars",
          "location": "mainNavigation",
          "icon": "icon-car",
          "permission": "showCars"
        }
      ],
      "customerRightSidebarSection": "./customerSidebar",
      "companyRightSidebarSection": "./companySidebar",
      "dealRightSidebarSection": "./dealSidebar",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cars-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "cars": {
          "name": "cars",
          "description": "Cars",
          "actions": [
            {
              "name": "all",
              "description": "All",
              "use": [
                "showCars",
                "manageCars"
              ]
            },
            {
              "name": "showCars",
              "description": "Show cars"
            },
            {
              "name": "manageCars",
              "description": "Manage cars"
            }
          ]
        }
      },
      "essyncer": [
        {
          "name": "cars",
          "schema": "{}",
          "script": ""
        }
      ]
    }
  },
  "sales": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-sales-ui/src",
      "name": "sales",
      "scope": "sales",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-sales-ui/remoteEntry.js",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./settings": "./src/Settings.tsx",
        "./propertyGroupForm": "./src/propertyGroupForm.tsx",
        "./segmentForm": "./src/segmentForm.tsx",
        "./activityLog": "./src/activityLogs/activityLog.tsx",
        "./automation": "./src/automations/automation.tsx",
        "./contactDetailRightSidebar": "./src/RightSidebar.tsx",
        "./selectRelation": "./src/common/SelectRelation.tsx",
        "./invoiceDetailRightSection": "./src/common/Item.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-sales-ui/remoteEntry.js",
        "scope": "sales",
        "module": "./routes"
      },
      "propertyGroupForm": "./propertyGroupForm",
      "segmentForm": "./segmentForm",
      "activityLog": "./activityLog",
      "automation": "./automation",
      "contactDetailRightSidebar": "./contactDetailRightSidebar",
      "invoiceDetailRightSection": "./invoiceDetailRightSection",
      "selectRelation": "./selectRelation",
      "menus": [
        {
          "text": "Sales Pipeline",
          "url": "/deal",
          "icon": "icon-piggy-bank",
          "location": "mainNavigation",
          "permission": "showDeals"
        },
        {
          "text": "Sales Pipelines",
          "to": "/settings/boards/deal",
          "image": "/images/icons/erxes-25.png",
          "location": "settings",
          "scope": "sales",
          "action": "dealsAll",
          "permissions": [
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
            "dealStagesRemove"
          ]
        }
      ]
    },
    "api": {
      "permissions": {
        "deals": {
          "name": "deals",
          "description": "Deals",
          "actions": [
            {
              "name": "dealsAll",
              "description": "All",
              "use": [
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
                "dealUpdateTimeTracking"
              ]
            },
            {
              "name": "showDeals",
              "description": "Show deals"
            },
            {
              "name": "dealBoardsAdd",
              "description": "Add deal board"
            },
            {
              "name": "dealBoardsRemove",
              "description": "Remove deal board"
            },
            {
              "name": "dealPipelinesAdd",
              "description": "Add deal pipeline"
            },
            {
              "name": "dealPipelinesEdit",
              "description": "Edit deal pipeline"
            },
            {
              "name": "dealPipelinesRemove",
              "description": "Remove deal pipeline"
            },
            {
              "name": "dealPipelinesArchive",
              "description": "Archive deal pipeline"
            },
            {
              "name": "dealPipelinesCopied",
              "description": "Duplicate deal pipeline"
            },
            {
              "name": "dealPipelinesUpdateOrder",
              "description": "Update pipeline order"
            },
            {
              "name": "dealPipelinesWatch",
              "description": "Deal pipeline watch"
            },
            {
              "name": "dealStagesAdd",
              "description": "Add deal stage"
            },
            {
              "name": "dealStagesEdit",
              "description": "Edit deal stage"
            },
            {
              "name": "dealStagesUpdateOrder",
              "description": "Update stage order"
            },
            {
              "name": "dealStagesRemove",
              "description": "Remove deal stage"
            },
            {
              "name": "dealsAdd",
              "description": "Add deal"
            },
            {
              "name": "dealsEdit",
              "description": "Edit deal"
            },
            {
              "name": "dealsRemove",
              "description": "Remove deal"
            },
            {
              "name": "dealsWatch",
              "description": "Watch deal"
            },
            {
              "name": "dealsArchive",
              "description": "Archive all deals in a specific stage"
            },
            {
              "name": "dealsSort",
              "description": "Sort all deals in a specific stage"
            },
            {
              "name": "exportDeals",
              "description": "Export deals"
            },
            {
              "name": "dealUpdateTimeTracking",
              "description": "Update time tracking"
            }
          ]
        }
      },
      "essyncer": [
        {
          "name": "deals",
          "schema": "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
          "script": "if(ns.indexOf('deals') > -1) { if (doc.productsData) { var productsDataString = JSON.stringify(doc.productsData); var amount = 0; var productsData = JSON.parse(productsDataString); for (var i = 0; i < productsData.length; i++){ amount = amount + productsData[i].amount; } doc.amount = amount; } } "
        },
        {
          "name": "sales_stages",
          "schema": "{}",
          "script": ""
        },
        {
          "name": "sales_pipelines",
          "schema": "{}",
          "script": ""
        }
      ]
    }
  },
  "tasks": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-tasks-ui/src",
      "name": "tasks",
      "scope": "tasks",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tasks-ui/remoteEntry.js",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./settings": "./src/Settings.tsx",
        "./propertyGroupForm": "./src/propertyGroupForm.tsx",
        "./segmentForm": "./src/segmentForm.tsx",
        "./activityLog": "./src/activityLogs/activityLog.tsx",
        "./automation": "./src/automations/automation.tsx",
        "./contactDetailRightSidebar": "./src/RightSidebar.tsx",
        "./selectRelation": "./src/common/SelectRelation.tsx",
        "./invoiceDetailRightSection": "./src/common/Item.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tasks-ui/remoteEntry.js",
        "scope": "tasks",
        "module": "./routes"
      },
      "propertyGroupForm": "./propertyGroupForm",
      "segmentForm": "./segmentForm",
      "activityLog": "./activityLog",
      "automation": "./automation",
      "contactDetailRightSidebar": "./contactDetailRightSidebar",
      "invoiceDetailRightSection": "./invoiceDetailRightSection",
      "selectRelation": "./selectRelation",
      "menus": [
        {
          "text": "Tasks Pipeline",
          "url": "/task",
          "icon": "icon-bag-alt",
          "location": "mainNavigation",
          "permission": "showTasks"
        },
        {
          "text": "Tasks Pipelines",
          "to": "/settings/boards/task",
          "image": "/images/icons/erxes-25.png",
          "location": "settings",
          "scope": "tasks",
          "action": "tasksAll",
          "permissions": [
            "taskBoardsAdd",
            "taskBoardsEdit",
            "taskBoardsRemove",
            "taskPipelinesAdd",
            "taskPipelinesEdit",
            "taskPipelinesUpdateOrder",
            "taskPipelinesRemove",
            "taskPipelinesArchive",
            "taskPipelinesArchive",
            "taskStagesAdd",
            "taskStagesEdit",
            "taskStagesUpdateOrder",
            "taskStagesRemove"
          ]
        }
      ]
    },
    "api": {
      "permissions": {
        "tasks": {
          "name": "tasks",
          "description": "Tasks",
          "actions": [
            {
              "name": "tasksAll",
              "description": "All",
              "use": [
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
                "exportTasks"
              ]
            },
            {
              "name": "showTasks",
              "description": "Show tasks"
            },
            {
              "name": "taskBoardsAdd",
              "description": "Add task board"
            },
            {
              "name": "taskBoardsRemove",
              "description": "Remove task board"
            },
            {
              "name": "taskPipelinesAdd",
              "description": "Add task pipeline"
            },
            {
              "name": "taskPipelinesEdit",
              "description": "Edit task pipeline"
            },
            {
              "name": "taskPipelinesRemove",
              "description": "Remove task pipeline"
            },
            {
              "name": "taskPipelinesArchive",
              "description": "Archive task pipeline"
            },
            {
              "name": "taskPipelinesCopied",
              "description": "Duplicate task pipeline"
            },
            {
              "name": "taskPipelinesWatch",
              "description": "Task pipeline watch"
            },
            {
              "name": "taskPipelinesUpdateOrder",
              "description": "Update pipeline order"
            },
            {
              "name": "taskStagesAdd",
              "description": "Add task stage"
            },
            {
              "name": "taskStagesEdit",
              "description": "Edit task stage"
            },
            {
              "name": "taskStagesUpdateOrder",
              "description": "Update stage order"
            },
            {
              "name": "taskStagesRemove",
              "description": "Remove task stage"
            },
            {
              "name": "tasksAdd",
              "description": "Add task"
            },
            {
              "name": "tasksEdit",
              "description": "Edit task"
            },
            {
              "name": "tasksRemove",
              "description": "Remove task"
            },
            {
              "name": "tasksWatch",
              "description": "Watch task"
            },
            {
              "name": "tasksArchive",
              "description": "Archive all tasks in a specific stage"
            },
            {
              "name": "tasksSort",
              "description": "Sort all tasks in a specific stage"
            },
            {
              "name": "taskUpdateTimeTracking",
              "description": "Update time tracking"
            },
            {
              "name": "exportTasks",
              "description": "Export tasks"
            }
          ]
        }
      },
      "essyncer": [
        {
          "name": "tasks",
          "schema": "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
          "script": ""
        },
        {
          "name": "tasks_stages",
          "schema": "{}",
          "script": ""
        },
        {
          "name": "tasks_pipelines",
          "schema": "{}",
          "script": ""
        }
      ]
    }
  },
  "purchases": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-purchases-ui/src",
      "name": "purchases",
      "scope": "purchases",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-purchases-ui/remoteEntry.js",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./settings": "./src/Settings.tsx",
        "./propertyGroupForm": "./src/propertyGroupForm.tsx",
        "./segmentForm": "./src/segmentForm.tsx",
        "./activityLog": "./src/activityLogs/activityLog.tsx",
        "./automation": "./src/automations/automation.tsx",
        "./contactDetailRightSidebar": "./src/RightSidebar.tsx",
        "./selectRelation": "./src/common/SelectRelation.tsx",
        "./invoiceDetailRightSection": "./src/common/Item.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-purchases-ui/remoteEntry.js",
        "scope": "purchases",
        "module": "./routes"
      },
      "propertyGroupForm": "./propertyGroupForm",
      "segmentForm": "./segmentForm",
      "activityLog": "./activityLog",
      "automation": "./automation",
      "contactDetailRightSidebar": "./contactDetailRightSidebar",
      "invoiceDetailRightSection": "./invoiceDetailRightSection",
      "selectRelation": "./selectRelation",
      "menus": [
        {
          "text": "Purchases Pipeline",
          "url": "/purchase",
          "icon": "icon-bag-alt",
          "location": "mainNavigation",
          "permission": "showPurchases"
        },
        {
          "text": "Purchases Pipelines",
          "to": "/settings/boards/purchase",
          "image": "/images/icons/erxes-25.png",
          "location": "settings",
          "scope": "purchases",
          "action": "purchasesAll",
          "permissions": [
            "purchaseBoardsAdd",
            "purchaseBoardsEdit",
            "purchaseBoardsRemove",
            "purchasePipelinesAdd",
            "purchasePipelinesEdit",
            "purchasePipelinesUpdateOrder",
            "purchasePipelinesRemove",
            "purchasePipelinesArchive",
            "purchasePipelinesArchive",
            "purchaseStagesAdd",
            "purchaseStagesEdit",
            "purchaseStagesUpdateOrder",
            "purchaseStagesRemove"
          ]
        }
      ]
    },
    "api": {
      "permissions": {
        "purchases": {
          "name": "purchases",
          "description": "Purchases",
          "actions": [
            {
              "name": "purchasesAll",
              "description": "All",
              "use": [
                "showPurchases",
                "purchaseBoardsAdd",
                "purchaseBoardsEdit",
                "purchaseBoardsRemove",
                "purchasePipelinesAdd",
                "purchasePipelinesEdit",
                "purchasePipelinesUpdateOrder",
                "purchasePipelinesWatch",
                "purchasePipelinesRemove",
                "purchasePipelinesArchive",
                "purchasePipelinesCopied",
                "purchaseStagesAdd",
                "purchaseStagesEdit",
                "purchaseStagesUpdateOrder",
                "purchaseStagesRemove",
                "purchasesAdd",
                "purchasesEdit",
                "purchasesRemove",
                "purchasesWatch",
                "purchasesArchive",
                "purchasesSort",
                "exportPurchases",
                "purchaseUpdateTimeTracking"
              ]
            },
            {
              "name": "showPurchases",
              "description": "Show purchases"
            },
            {
              "name": "purchaseBoardsAdd",
              "description": "Add purchase board"
            },
            {
              "name": "purchaseBoardsRemove",
              "description": "Remove purchase board"
            },
            {
              "name": "purchasePipelinesAdd",
              "description": "Add purchase pipeline"
            },
            {
              "name": "purchasePipelinesEdit",
              "description": "Edit purchase pipeline"
            },
            {
              "name": "purchasePipelinesRemove",
              "description": "Remove purchase pipeline"
            },
            {
              "name": "purchasePipelinesArchive",
              "description": "Archive purchase pipeline"
            },
            {
              "name": "purchasePipelinesCopied",
              "description": "Duplicate purchase pipeline"
            },
            {
              "name": "purchasePipelinesUpdateOrder",
              "description": "Update pipeline order"
            },
            {
              "name": "purchasePipelinesWatch",
              "description": "purchase pipeline watch"
            },
            {
              "name": "purchaseStagesAdd",
              "description": "Add purchase stage"
            },
            {
              "name": "purchaseStagesEdit",
              "description": "Edit purchase stage"
            },
            {
              "name": "purchaseStagesUpdateOrder",
              "description": "Update stage order"
            },
            {
              "name": "purchaseStagesRemove",
              "description": "Remove purchase stage"
            },
            {
              "name": "purchasesAdd",
              "description": "Add purchase"
            },
            {
              "name": "purchasesEdit",
              "description": "Edit purchase"
            },
            {
              "name": "purchasesRemove",
              "description": "Remove purchase"
            },
            {
              "name": "purchasesWatch",
              "description": "Watch purchase"
            },
            {
              "name": "purchasesArchive",
              "description": "Archive all purchases in a specific stage"
            },
            {
              "name": "purchasesSort",
              "description": "Sort all purchases in a specific stage"
            },
            {
              "name": "exportpurchases",
              "description": "Export purchases"
            },
            {
              "name": "purchaseUpdateTimeTracking",
              "description": "Update time tracking"
            }
          ]
        }
      },
      "essyncer": [
        {
          "name": "purchases",
          "schema": "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
          "script": "if(ns.indexOf('purchases') > -1) { if (doc.productsData) { var productsDataString = JSON.stringify(doc.productsData); var amount = 0; var productsData = JSON.parse(productsDataString); for (var i = 0; i < productsData.length; i++){ amount = amount + productsData[i].amount; } doc.amount = amount; } } "
        },
        {
          "name": "purchases_tages",
          "schema": "{}",
          "script": ""
        },
        {
          "name": "purchases_pipelines",
          "schema": "{}",
          "script": ""
        }
      ]
    }
  },
  "notifications": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-notifications-ui/src",
      "name": "notifications",
      "scope": "notifications",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./settings": "./src/containers/Widget.tsx",
        "./automation": "./src/automations/index.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-notifications-ui/remoteEntry.js",
        "scope": "notifications",
        "module": "./routes"
      },
      "automation": "./automation",
      "menus": [
        {
          "text": "notifications",
          "url": "/notifications",
          "icon": "icon-book-open",
          "location": "topNavigation",
          "scope": "notifications",
          "component": "./settings"
        },
        {
          "text": "Notification Config",
          "to": "/settings/notifications",
          "image": "/images/icons/erxes-11.svg",
          "location": "settings",
          "scope": "notifications"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-notifications-ui/remoteEntry.js"
    }
  },
  "tickets": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-tickets-ui/src",
      "name": "tickets",
      "scope": "tickets",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tickets-ui/remoteEntry.js",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./settings": "./src/Settings.tsx",
        "./propertyGroupForm": "./src/propertyGroupForm.tsx",
        "./segmentForm": "./src/segmentForm.tsx",
        "./activityLog": "./src/activityLogs/activityLog.tsx",
        "./automation": "./src/automations/automation.tsx",
        "./contactDetailRightSidebar": "./src/RightSidebar.tsx",
        "./selectRelation": "./src/common/SelectRelation.tsx",
        "./invoiceDetailRightSection": "./src/common/Item.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tickets-ui/remoteEntry.js",
        "scope": "tickets",
        "module": "./routes"
      },
      "propertyGroupForm": "./propertyGroupForm",
      "segmentForm": "./segmentForm",
      "activityLog": "./activityLog",
      "automation": "./automation",
      "contactDetailRightSidebar": "./contactDetailRightSidebar",
      "invoiceDetailRightSection": "./invoiceDetailRightSection",
      "selectRelation": "./selectRelation",
      "menus": [
        {
          "text": "Tickets Pipeline",
          "url": "/ticket",
          "icon": "icon-bag-alt",
          "location": "mainNavigation",
          "permission": "showTickets"
        },
        {
          "text": "Tickets Pipelines",
          "to": "/settings/boards/ticket",
          "image": "/images/icons/erxes-25.png",
          "location": "settings",
          "scope": "tickets",
          "action": "ticketsAll",
          "permissions": [
            "ticketBoardsAdd",
            "ticketBoardsEdit",
            "ticketBoardsRemove",
            "ticketPipelinesAdd",
            "ticketPipelinesEdit",
            "ticketPipelinesUpdateOrder",
            "ticketPipelinesRemove",
            "ticketPipelinesArchive",
            "ticketPipelinesArchive",
            "ticketStagesAdd",
            "ticketStagesEdit",
            "ticketStagesUpdateOrder",
            "ticketStagesRemove"
          ]
        }
      ]
    },
    "api": {
      "permissions": {
        "tickets": {
          "name": "tickets",
          "description": "Tickets",
          "actions": [
            {
              "name": "ticketsAll",
              "description": "All",
              "use": [
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
                "ticketUpdateTimeTracking"
              ]
            },
            {
              "name": "showTickets",
              "description": "Show tickets"
            },
            {
              "name": "ticketBoardsAdd",
              "description": "Add ticket board"
            },
            {
              "name": "ticketBoardsRemove",
              "description": "Remove ticket board"
            },
            {
              "name": "ticketPipelinesAdd",
              "description": "Add ticket pipeline"
            },
            {
              "name": "ticketPipelinesEdit",
              "description": "Edit ticket pipeline"
            },
            {
              "name": "ticketPipelinesRemove",
              "description": "Remove ticket pipeline"
            },
            {
              "name": "ticketPipelinesArchive",
              "description": "Archive ticket pipeline"
            },
            {
              "name": "ticketPipelinesCopied",
              "description": "Duplicate ticket pipeline"
            },
            {
              "name": "ticketPipelinesUpdateOrder",
              "description": "Update pipeline order"
            },
            {
              "name": "ticketPipelinesWatch",
              "description": "ticket pipeline watch"
            },
            {
              "name": "ticketStagesAdd",
              "description": "Add ticket stage"
            },
            {
              "name": "ticketStagesEdit",
              "description": "Edit ticket stage"
            },
            {
              "name": "ticketStagesUpdateOrder",
              "description": "Update stage order"
            },
            {
              "name": "ticketStagesRemove",
              "description": "Remove ticket stage"
            },
            {
              "name": "ticketsAdd",
              "description": "Add ticket"
            },
            {
              "name": "ticketsEdit",
              "description": "Edit ticket"
            },
            {
              "name": "ticketsRemove",
              "description": "Remove ticket"
            },
            {
              "name": "ticketsWatch",
              "description": "Watch ticket"
            },
            {
              "name": "ticketsArchive",
              "description": "Archive all tickets in a specific stage"
            },
            {
              "name": "ticketsSort",
              "description": "Sort all tickets in a specific stage"
            },
            {
              "name": "exporttickets",
              "description": "Export tickets"
            },
            {
              "name": "ticketUpdateTimeTracking",
              "description": "Update time tracking"
            }
          ]
        }
      },
      "essyncer": [
        {
          "name": "tickets",
          "schema": "{ 'userId': { 'type': 'keyword' }, 'stageId': { 'type': 'keyword' }, 'modifiedBy': { 'type': 'keyword' }, 'status': { 'type': 'keyword' }, 'assignedUserIds': { 'type': 'keyword' }, 'watchedUserIds': { 'type': 'keyword' }, 'labelIds': { 'type': 'keyword' }, 'customFieldsData': <nested> }",
          "script": ""
        },
        {
          "name": "tickets_stages",
          "schema": "{}",
          "script": ""
        },
        {
          "name": "tickets_pipelines",
          "schema": "{}",
          "script": ""
        }
      ]
    }
  },
  "chats": {
    "api": {
      "permissions": {
        "chats": {
          "name": "chats",
          "description": "Chats",
          "actions": [
            {
              "name": "chatsAll",
              "description": "All",
              "use": [
                "showChats",
                "manageChats"
              ]
            },
            {
              "name": "showChats",
              "description": "Show chats"
            },
            {
              "name": "manageChats",
              "description": "Manage Chats"
            }
          ]
        }
      }
    }
  },
  "clientportal": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-clientportal-ui/src",
      "name": "clientportal",
      "scope": "clientportal",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./cardDetailAction": "./src/containers/comments/CardDetailAction.tsx",
        "./fieldConfig": "./src/containers/FieldConfigForm.tsx",
        "./Section": "./src/containers/cardsRightSidebarSection/Section.tsx",
        "./automation": "./src/automations/index.tsx"
      },
      "cardDetailAction": "./cardDetailAction",
      "fieldConfig": "./fieldConfig",
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-clientportal-ui/remoteEntry.js",
        "scope": "clientportal",
        "module": "./routes"
      },
      "automation": "./automation",
      "menus": [
        {
          "text": "Business Portal",
          "to": "/settings/business-portal",
          "image": "/images/icons/erxes-32.png",
          "location": "settings",
          "scope": "businessportal",
          "action": "",
          "permissions": []
        }
      ],
      "taskRightSidebarSection": "./Section",
      "ticketRightSidebarSection": "./Section",
      "dealRightSidebarSection": "./Section",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-clientportal-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "clientPortal": {
          "name": "clientPortal",
          "description": "Business portal",
          "actions": [
            {
              "name": "clientPortalAll",
              "description": "All",
              "use": [
                "manageClientPortal",
                "removeClientPortal",
                "updateUser"
              ]
            },
            {
              "name": "manageClientPortal",
              "description": "Manage client portal"
            },
            {
              "name": "removeClientPortal",
              "description": "Remove client portal"
            },
            {
              "name": "updateUser",
              "description": "Update user"
            }
          ]
        }
      }
    }
  },
  "ebarimt": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-ebarimt-ui/src",
      "name": "ebarimt",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./response": "./src/response.tsx"
      },
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-ebarimt-ui/remoteEntry.js",
      "scope": "ebarimt",
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-ebarimt-ui/remoteEntry.js",
        "scope": "ebarimt",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Put Responses",
          "url": "/put-responses",
          "icon": "icon-lamp",
          "location": "mainNavigation",
          "permission": "managePutResponses"
        },
        {
          "text": "Ebarimt config",
          "to": "/erxes-plugin-ebarimt/settings/general",
          "image": "/images/icons/erxes-04.svg",
          "location": "settings",
          "scope": "ebarimt",
          "action": "syncEbarimtConfig",
          "permission": "syncEbarimtConfig"
        }
      ],
      "layout": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-ebarimt-ui/remoteEntry.js",
        "scope": "ebarimt",
        "module": "./response"
      }
    },
    "api": {
      "permissions": {
        "ebarimt": {
          "name": "ebarimt",
          "description": "Ebarimt",
          "actions": [
            {
              "name": "ebarimtAll",
              "description": "All",
              "use": [
                "managePutResponses",
                "syncEbarimtConfig",
                "specialReturnBill",
                "reReturnBill"
              ]
            },
            {
              "name": "managePutResponses",
              "description": "Manage Put responses"
            },
            {
              "name": "syncEbarimtConfig",
              "description": "Manage ebarimt config"
            },
            {
              "name": "specialReturnBill",
              "description": "Return bill only"
            },
            {
              "name": "reReturnBill",
              "description": "Re Return bill"
            }
          ]
        }
      }
    }
  },
  "engages": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-engages-ui/src",
      "name": "engages",
      "scope": "engages",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./automation": "./src/automation.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-engages-ui/remoteEntry.js",
        "scope": "engages",
        "module": "./routes"
      },
      "automation": "./automation",
      "menus": [
        {
          "text": "Broadcast",
          "url": "/campaigns",
          "icon": "icon-megaphone",
          "location": "mainNavigation",
          "permission": "showEngagesMessages"
        },
        {
          "text": "Broadcast settings",
          "to": "/settings/campaign-configs",
          "image": "/images/icons/erxes-08.svg",
          "location": "settings",
          "scope": "engages",
          "action": "engagesAll",
          "permissions": [
            "showEngagesMessages"
          ]
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-engages-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "engages": {
          "name": "engages",
          "description": "Broadcast",
          "actions": [
            {
              "name": "engagesAll",
              "description": "All",
              "use": [
                "engageMessageSetLiveManual",
                "engageMessageSetPause",
                "engageMessageSetLive",
                "showEngagesMessages",
                "engageMessageAdd",
                "engageMessageEdit",
                "engageMessageRemove"
              ]
            },
            {
              "name": "engageMessageSetLive",
              "description": "Set an auto broadcast live"
            },
            {
              "name": "engageMessageSetPause",
              "description": "Pause a broadcast"
            },
            {
              "name": "engageMessageSetLiveManual",
              "description": "Set a broadcast live"
            },
            {
              "name": "engageMessageRemove",
              "description": "Remove a broadcast"
            },
            {
              "name": "engageMessageEdit",
              "description": "Edit a broadcast"
            },
            {
              "name": "engageMessageAdd",
              "description": "Add a broadcast"
            },
            {
              "name": "showEngagesMessages",
              "description": "See broadcast list"
            }
          ]
        }
      },
      "essyncer": [
        {
          "name": "engage_messages",
          "schema": "{}",
          "script": ""
        }
      ]
    }
  },
  "exm": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-exm-ui/src",
      "name": "exm",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-exm-ui/remoteEntry.js",
        "scope": "exm",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Exm core",
          "to": "/erxes-plugin-exm/home",
          "image": "/images/icons/erxes-30.png",
          "location": "settings",
          "action": "",
          "permissions": [
            "showExms"
          ]
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-exm-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "exm": {
          "name": "exm",
          "description": "Exm core",
          "actions": [
            {
              "name": "showExms",
              "description": "Show exm"
            },
            {
              "name": "manageExms",
              "description": "Manage exm"
            },
            {
              "name": "exmsAll",
              "description": "All",
              "use": [
                "showExms",
                "manageExms"
              ]
            }
          ]
        }
      }
    }
  },
  "exmfeed": {
    "api": {
      "permissions": {
        "exmfeed": {
          "name": "exmfeed",
          "description": "Exm feed",
          "actions": [
            {
              "name": "showExmActivityFeed",
              "description": "Show exm activity feed"
            },
            {
              "name": "manageExmActivityFeed",
              "description": "Manage exm activity feed"
            },
            {
              "name": "exmActivityFeedAll",
              "description": "All",
              "use": [
                "showExmActivityFeed",
                "manageExmActivityFeed"
              ]
            }
          ]
        }
      },
      "essyncer": [
        {
          "name": "exm_feeds",
          "schema": "{}",
          "script": ""
        },
        {
          "name": "exm_thanks",
          "schema": "{}",
          "script": ""
        }
      ]
    }
  },
  "integrations": {},
  "knowledgebase": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-knowledgebase-ui/src",
      "name": "knowledgebase",
      "scope": "knowledgebase",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./automation": "./src/automation.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-knowledgebase-ui/remoteEntry.js",
        "scope": "knowledgebase",
        "module": "./routes"
      },
      "automation": "./automation",
      "menus": [
        {
          "text": "Knowledge Base",
          "url": "/knowledgeBase",
          "icon": "icon-book-open",
          "location": "mainNavigation",
          "permission": "showKnowledgeBase"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-knowledgebase-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "knowledgeBase": {
          "name": "knowledgeBase",
          "description": "KnowledgeBase",
          "actions": [
            {
              "name": "knowledgeBaseAll",
              "description": "All",
              "use": [
                "showKnowledgeBase",
                "manageKnowledgeBase"
              ]
            },
            {
              "name": "manageKnowledgeBase",
              "description": "Manage knowledge base"
            },
            {
              "name": "showKnowledgeBase",
              "description": "Show knowledge base"
            }
          ]
        }
      }
    }
  },
  "loyalties": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-loyalties-ui/src",
      "name": "loyalties",
      "scope": "loyalties",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./customerSidebar": "./src/containers/CustomerSidebar.tsx",
        "./companySidebar": "./src/containers/CompanySidebar.tsx",
        "./userSidebar": "./src/containers/UserSidebar.tsx",
        "./automation": "./src/automations/automation.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loyalties-ui/remoteEntry.js",
        "scope": "loyalties",
        "module": "./routes"
      },
      "automation": "./automation",
      "menus": [
        {
          "text": "Loyalties",
          "url": "/vouchers",
          "icon": "icon-piggybank",
          "location": "mainNavigation",
          "permission": "showLoyalties"
        },
        {
          "text": "Loyalties config",
          "to": "/erxes-plugin-loyalty/settings/general",
          "image": "/images/icons/erxes-16.svg",
          "location": "settings",
          "scope": "loyalties",
          "action": "loyaltyConfig",
          "permissions": [
            "manageLoyalties",
            "showLoyalties"
          ]
        }
      ],
      "customerRightSidebarSection": "./customerSidebar",
      "companyRightSidebarSection": "./companySidebar",
      "userRightSidebarSection": [
        {
          "text": "userSection",
          "component": "./userSidebar",
          "scope": "loyalties"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loyalties-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "loyalties": {
          "name": "loyalties",
          "description": "Loyalties",
          "actions": [
            {
              "name": "loyaltyAll",
              "description": "All",
              "use": [
                "showLoyalties",
                "manageLoyalties"
              ]
            },
            {
              "name": "showLoyalties",
              "description": "Show loyalties"
            },
            {
              "name": "manageLoyalties",
              "description": "Manage loyalties"
            }
          ]
        }
      }
    }
  },
  "webhooks": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-webhooks-ui/src",
      "name": "webhooks",
      "scope": "webhooks",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./automation": "./src/automations/automations.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-webhooks-ui/remoteEntry.js",
        "scope": "webhooks",
        "module": "./routes"
      },
      "automation": "./automation",
      "menus": [
        {
          "text": "Outgoing webhooks",
          "to": "/settings/webhooks",
          "image": "/images/icons/erxes-11.svg",
          "location": "settings",
          "scope": "webhooks",
          "action": "webhooksAll",
          "permissions": [
            "showWebhooks"
          ]
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-webhooks-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "webhooks": {
          "name": "webhooks",
          "description": "Webhooks",
          "actions": [
            {
              "name": "webhooksAll",
              "description": "All",
              "use": [
                "showWebhooks",
                "manageWebhooks"
              ]
            },
            {
              "name": "showWebhooks",
              "description": "Show webhooks"
            },
            {
              "name": "manageWebhooks",
              "description": "Manage webhooks"
            }
          ]
        }
      }
    }
  },
  "pos": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-pos-ui/src",
      "name": "pos",
      "scope": "pos",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./invoiceDetailRightSection": "./src/orders/containers/InvoiceDetail.tsx",
        "./customerSidebar": "./src/orders/containers/CustomerSidebar.tsx",
        "./automation": "./src/automations.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-pos-ui/remoteEntry.js",
        "scope": "pos",
        "module": "./routes"
      },
      "invoiceDetailRightSection": "./invoiceDetailRightSection",
      "automation": "./automation",
      "menus": [
        {
          "text": "Pos Orders",
          "url": "/pos-orders",
          "icon": "icon-lamp",
          "location": "mainNavigation",
          "permission": "showPos"
        },
        {
          "text": "POS",
          "to": "/pos",
          "image": "/images/icons/erxes-05.svg",
          "location": "settings",
          "scope": "pos",
          "action": "posConfig",
          "permissions": [
            "showPos"
          ]
        }
      ],
      "customerRightSidebarSection": "./customerSidebar",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-pos-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "pos": {
          "name": "pos",
          "description": "POS",
          "actions": [
            {
              "name": "posAll",
              "description": "All",
              "use": [
                "managePos",
                "showPos",
                "manageOrders",
                "manageCovers",
                "showOrders",
                "showCovers"
              ]
            },
            {
              "name": "managePos",
              "description": "Manage POS"
            },
            {
              "name": "showPos",
              "description": "Show"
            },
            {
              "name": "manageOrders",
              "description": "Manage Orders"
            },
            {
              "name": "manageCovers",
              "description": "Manage Covers"
            },
            {
              "name": "showOrders",
              "description": "Show Orders"
            },
            {
              "name": "showCovers",
              "description": "Show Covers"
            }
          ]
        }
      },
      "essyncer": [
        {
          "name": "pos_orders",
          "schema": "{'customerId': { 'type': 'keyword' }, 'customerType': { 'type': 'keyword' }, 'ownerId': { 'type': 'keyword' }}",
          "script": ""
        }
      ]
    }
  },
  "reactions": {
    "api": {
      "essyncer": [
        {
          "name": "emojis",
          "schema": "{}",
          "script": ""
        },
        {
          "name": "comments",
          "schema": "{}",
          "script": ""
        }
      ]
    }
  },
  "syncerkhet": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-syncerkhet-ui/src",
      "name": "syncerkhet",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-syncerkhet-ui/remoteEntry.js",
        "scope": "syncerkhet",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Sync Erkhet",
          "to": "/erxes-plugin-sync-erkhet/settings/general",
          "image": "/images/icons/erxes-04.svg",
          "location": "settings",
          "scope": "syncerkhet",
          "action": "syncErkhetConfig",
          "permission": "syncErkhetConfig"
        },
        {
          "text": "Erkhet Sync",
          "url": "/sync-erkhet-history",
          "icon": "icon-file-check-alt",
          "location": "mainNavigation",
          "scope": "syncerkhet",
          "permission": "syncErkhetConfig"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-syncerkhet-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "syncerkhet": {
          "name": "erkhet",
          "description": "Erkhet",
          "actions": [
            {
              "name": "syncErkhetConfig",
              "description": "Manage erkhet config"
            }
          ]
        }
      }
    }
  },
  "multierkhet": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-multierkhet-ui/src",
      "name": "multierkhet",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./response": "./src/response.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-multierkhet-ui/remoteEntry.js",
        "scope": "multierkhet",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Sync Multi Erkhet",
          "to": "/erxes-plugin-multi-erkhet/settings/general",
          "image": "/images/icons/erxes-04.svg",
          "location": "settings",
          "scope": "multierkhet",
          "action": "multiErkhetConfig",
          "permission": "multiErkhetConfig"
        },
        {
          "text": "Multi Erkhet Sync",
          "url": "/multi-erkhet-history",
          "icon": "book-alt",
          "location": "mainNavigation",
          "scope": "multierkhet",
          "permission": "multiErkhetConfig"
        }
      ],
      "layout": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-multierkhet-ui/remoteEntry.js",
        "scope": "multierkhet",
        "module": "./response"
      },
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-multierkhet-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "multierkhet": {
          "name": "multierkhet",
          "description": "Multi Erkhet",
          "actions": [
            {
              "name": "multiErkhetConfig",
              "description": "Manage Multi Erkhet config"
            }
          ]
        }
      }
    }
  },
  "salesplans": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-salesplans-ui/src",
      "name": "salesplans",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-salesplans-ui/remoteEntry.js",
        "scope": "salesplans",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Sales Plans",
          "to": "/salesplans/labels",
          "image": "/images/icons/erxes-31.png",
          "location": "settings",
          "scope": "salesplans",
          "action": ""
        },
        {
          "text": "Sales Plans",
          "url": "/sales-plans/day-labels",
          "icon": "icon-file-check-alt",
          "location": "mainNavigation",
          "scope": "salesplans",
          "permission": "showSalesPlans"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-salesplans-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "salesplans": {
          "name": "salesplans",
          "description": "Sales Plans",
          "actions": [
            {
              "name": "salesplansAll",
              "description": "All",
              "use": [
                "showSalesPlans",
                "manageSalesPlans"
              ]
            },
            {
              "name": "manageSalesPlans",
              "description": "Manage Sales Plans",
              "use": [
                "showSalesPlans"
              ]
            },
            {
              "name": "showSalesPlans",
              "description": "Show Sales Plans"
            }
          ]
        }
      }
    }
  },
  "processes": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-processes-ui/src",
      "name": "processes",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-processes-ui/remoteEntry.js",
        "scope": "processes",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Processes",
          "to": "/processes/jobs",
          "image": "/images/icons/erxes-31.png",
          "location": "settings",
          "scope": "processes",
          "action": "",
          "permissions": [
            "showJobs",
            "manageJobs"
          ]
        },
        {
          "text": "Processes",
          "url": "/processes/overallWorks",
          "icon": "icon-file-check-alt",
          "location": "mainNavigation",
          "scope": "processes",
          "permission": "showWorks"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-processes-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "processes": {
          "name": "processes",
          "description": "Processes",
          "actions": [
            {
              "name": "processesAll",
              "description": "All",
              "use": [
                "showJobs",
                "manageJobs",
                "showWorks",
                "manageWorks"
              ]
            },
            {
              "name": "showJobs",
              "description": "Show Jobs"
            },
            {
              "name": "manageJobs",
              "description": "Manage Jobs"
            },
            {
              "name": "showWorks",
              "description": "Show Works"
            },
            {
              "name": "manageWorks",
              "description": "Manage Works"
            }
          ]
        }
      }
    }
  },
  "inventories": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-inventories-ui/src",
      "name": "inventories",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-inventories-ui/remoteEntry.js",
        "scope": "inventories",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Remainders",
          "url": "/inventories/remainders",
          "icon": "icon-box",
          "location": "mainNavigation",
          "scope": "inventories",
          "action": "inventoriesAll",
          "permissions": [
            "showProducts",
            "manageProducts"
          ]
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-inventories-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "inventories": {
          "name": "inventories",
          "description": "Inventories",
          "actions": [
            {
              "name": "inventoriesAll",
              "description": "All",
              "use": [
                "manageRemainders"
              ]
            },
            {
              "name": "manageRemainders",
              "description": "Manage remainders"
            }
          ]
        }
      }
    }
  },
  "posclient": {},
  "webbuilder": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-webbuilder-ui/src",
      "name": "webbuilder",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-webbuilder-ui/remoteEntry.js",
        "scope": "webbuilder",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "X Builder",
          "url": "/xbuilder",
          "icon": "icon-window-grid",
          "location": "mainNavigation",
          "permission": "showWebbuilder"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-webbuilder-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "webbuilder": {
          "name": "webbuilder",
          "description": "Webbuilder",
          "actions": [
            {
              "name": "webbuilderAll",
              "description": "All",
              "use": [
                "showWebbuilder",
                "manageWebbuilder"
              ]
            },
            {
              "name": "showWebbuilder",
              "description": "Show webbuilder"
            },
            {
              "name": "manageWebbuilder",
              "description": "Manage webbuilder"
            }
          ]
        }
      }
    }
  },
  "payment": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-payment-ui/src",
      "name": "payment",
      "scope": "payment",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./SelectPayments": "./src/containers/SelectPayments.tsx",
        "./invoiceSection": "./src/containers/invoice/InvoiceSection.tsx",
        "./paymentConfig": "./src/containers/paymentConfig/Form.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-payment-ui/remoteEntry.js",
        "scope": "payment",
        "module": "./routes"
      },
      "selectPayments": "./SelectPayments",
      "paymentConfig": "./paymentConfig",
      "conversationDetailSidebar": "./invoiceSection",
      "menus": [
        {
          "text": "Invoices",
          "url": "/payment/invoices",
          "icon": "icon-list",
          "location": "mainNavigation",
          "permission": "showInvoices"
        },
        {
          "text": "Payments",
          "to": "/settings/payments",
          "image": "/images/icons/erxes-18.svg",
          "location": "settings",
          "scope": "payment",
          "action": "paymentsAll",
          "permissions": [
            "showPayments"
          ]
        }
      ],
      "dealRightSidebarSection": "./invoiceSection",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-payment-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "payments": {
          "name": "payments",
          "description": "Payments",
          "actions": [
            {
              "name": "paymentsAll",
              "description": "All",
              "use": [
                "paymentAdd",
                "paymentEdit",
                "paymentRemove",
                "showPayments"
              ]
            },
            {
              "name": "paymentAdd",
              "description": "Add payments"
            },
            {
              "name": "paymentEdit",
              "description": "Edit payments"
            },
            {
              "name": "paymentRemove",
              "description": "Remove payments"
            },
            {
              "name": "showPayments",
              "description": "Show payments"
            }
          ]
        },
        "invoices": {
          "name": "invoices",
          "description": "Invoices",
          "actions": [
            {
              "name": "invoicesAll",
              "description": "All",
              "use": [
                "showInvoices",
                "createInvoice"
              ]
            },
            {
              "name": "showInvoices",
              "description": "Show invoices"
            },
            {
              "name": "createInvoice",
              "description": "Create invoice"
            }
          ]
        }
      }
    }
  },
  "imap": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-imap-ui/src",
      "name": "imap",
      "scope": "imap",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./inboxIntegrationSettings": "./src/components/IntegrationSettings.tsx",
        "./inboxIntegrationForm": "./src/components/IntegrationForm.tsx",
        "./inboxConversationDetail": "./src/components/ConversationDetail.tsx",
        "./activityLog": "./src/components/ActivityLog.tsx",
        "./integrationDetailsForm": "./src/components/IntegrationEditForm.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-imap-ui/remoteEntry.js",
        "scope": "imap",
        "module": "./routes"
      },
      "inboxIntegrationSettings": "./inboxIntegrationSettings",
      "inboxIntegrationForm": "./inboxIntegrationForm",
      "inboxConversationDetail": "./inboxConversationDetail",
      "inboxIntegrations": [
        {
          "name": "IMAP",
          "description": "Connect a company email address such as sales@mycompany.com or info@mycompany.com",
          "inMessenger": false,
          "isAvailable": true,
          "kind": "imap",
          "logo": "/images/integrations/email.png",
          "createModal": "imap",
          "category": "All integrations, For support teams, Marketing automation, Email marketing",
          "components": [
            "inboxConversationDetail"
          ]
        }
      ],
      "integrationDetailsForm": "./integrationDetailsForm",
      "activityLog": "./activityLog",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-imap-ui/remoteEntry.js"
    }
  },
  "block": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-block-ui/src",
      "name": "block",
      "scope": "block",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./customerSidebar": "./src/containers/CustomerSideBar.tsx",
        "./activityLog": "./src/activityLogs/activityLog.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-block-ui/remoteEntry.js",
        "scope": "block",
        "module": "./routes"
      },
      "activityLog": "./activityLog",
      "menus": [
        {
          "text": "Blocks",
          "to": "/block/list",
          "image": "/images/icons/erxes-18.svg",
          "location": "settings"
        }
      ],
      "customerRightSidebarSection": "./customerSidebar",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-block-ui/remoteEntry.js"
    }
  },
  "assets": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-assets-ui/src",
      "name": "assets",
      "scope": "assets",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./selectWithAsset": "./src/common/SelectWithAssets.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-assets-ui/remoteEntry.js",
        "scope": "assets",
        "module": "./routes"
      },
      "formsExtraFields": [
        {
          "scope": "assets",
          "component": "./selectWithAsset",
          "type": "asset"
        }
      ],
      "menus": [
        {
          "text": "Assets",
          "to": "/settings/assets/",
          "image": "/images/icons/erxes-18.svg",
          "location": "settings",
          "scope": "assets",
          "action": "assetsAll",
          "permissions": [
            "showAssets",
            "manageAssets"
          ]
        },
        {
          "text": "Asset & Movements",
          "url": "/asset-movements",
          "icon": "icon-piggybank",
          "location": "mainNavigation",
          "action": "assetsAll",
          "permissions": [
            "showAssets",
            "manageAssets"
          ]
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-assets-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "products": {
          "name": "assets",
          "description": "Assets",
          "actions": [
            {
              "name": "assetsAll",
              "description": "All",
              "use": [
                "showAssets",
                "manageAssets",
                "assetsMerge"
              ]
            },
            {
              "name": "manageAssets",
              "description": "Manage assets",
              "use": [
                "showAssets"
              ]
            },
            {
              "name": "showAssets",
              "description": "Show assets"
            },
            {
              "name": "assetsMerge",
              "description": "Merge assets"
            },
            {
              "name": "assetsAssignKbArticles",
              "description": "Assign knowledgebase articles"
            }
          ]
        }
      }
    }
  },
  "riskassessment": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-riskassessment-ui/src",
      "name": "riskassessment",
      "scope": "riskassessment",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./cardSideBarSection": "./src/assessments/section/containers/Section.tsx",
        "./selectVistors": "./src/Visitors.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-riskassessment-ui/remoteEntry.js",
        "scope": "riskassessment",
        "module": "./routes"
      },
      "formsExtraFields": [
        {
          "scope": "riskassessment",
          "component": "./selectVistors",
          "type": "riskAssessmentVisitors"
        }
      ],
      "menus": [
        {
          "text": "Risk Assessments",
          "to": "/settings/risk-indicators",
          "image": "/images/icons/erxes-18.svg",
          "location": "settings",
          "scope": "riskassessment",
          "action": "riskAssessmentAll",
          "permissions": [
            "showRiskAssessment",
            "manageRiskAssessment"
          ]
        },
        {
          "text": "Operations",
          "to": "/settings/operations",
          "image": "/images/icons/erxes-18.svg",
          "location": "settings",
          "scope": "riskassessment",
          "action": "riskAssessmentAll",
          "permissions": [
            "showRiskAssessment",
            "manageRiskAssessment"
          ]
        },
        {
          "text": "Risk Assessments",
          "url": "/risk-assessments",
          "icon": "icon-followers",
          "location": "mainNavigation",
          "action": "riskAssessmentAll",
          "permissions": [
            "showRiskAssessment",
            "manageRiskAssessment"
          ]
        }
      ],
      "dealRightSidebarSection": "./cardSideBarSection",
      "ticketRightSidebarSection": "./cardSideBarSection",
      "taskRightSidebarSection": "./cardSideBarSection",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-riskassessment-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "riskAssessment": {
          "name": "riskAssessment",
          "description": "Risk Assessment",
          "actions": [
            {
              "name": "riskAssessmentAll",
              "description": "All",
              "use": [
                "showRiskAssessment",
                "manageRiskAssessment"
              ]
            },
            {
              "name": "manageRiskAssessment",
              "description": "Manage Risk Assessment",
              "use": [
                "showRiskAssessment"
              ]
            },
            {
              "name": "showRiskAssessment",
              "description": "Show Risk Assessment"
            }
          ]
        }
      }
    }
  },
  "forum": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-forum-ui/src",
      "name": "forum",
      "scope": "forum",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./settings": "./src/Settings.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-forum-ui/remoteEntry.js",
        "scope": "forum",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Forums",
          "url": "/forums",
          "icon": "icon-idea",
          "location": "mainNavigation"
        },
        {
          "text": "Categories",
          "to": "/forums/categories",
          "image": "/images/icons/erxes-18.svg",
          "location": "settings",
          "scope": "forum",
          "action": "",
          "permissions": []
        },
        {
          "text": "Permission Groups",
          "to": "/forums/permission-groups",
          "image": "/images/icons/erxes-18.svg",
          "location": "settings",
          "scope": "forum",
          "action": "",
          "permissions": []
        },
        {
          "text": "Subscription Products",
          "to": "/forums/subscription-products",
          "image": "/images/icons/erxes-18.svg",
          "location": "settings",
          "scope": "forum",
          "action": "",
          "permissions": []
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-forum-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "categories": {
          "name": "forumCategories",
          "description": "Forum categories",
          "actions": [
            {
              "name": "forumCategoriesAll",
              "description": "All forum category actions",
              "use": [
                "forumCreateCategory",
                "forumPatchCategory",
                "forumDeleteCategory",
                "forumForceDeleteCategory"
              ]
            },
            {
              "name": "forumCreateCategory",
              "description": "Create forum categories"
            },
            {
              "name": "forumPatchCategory",
              "description": "Edit forum categories"
            },
            {
              "name": "forumDeleteCategory",
              "description": "Delete forum categories"
            },
            {
              "name": "forumForceDeleteCategory",
              "description": "Force delete forum categories"
            }
          ]
        },
        "posts": {
          "name": "forumPosts",
          "description": "Forum posts",
          "actions": [
            {
              "name": "forumPostsAll",
              "description": "All forum post actions",
              "use": [
                "forumCreatePost",
                "forumPatchPost",
                "forumDeletePost",
                "forumPostDraft",
                "forumPostPublish",
                "forumPostSetFeatured"
              ]
            },
            {
              "name": "forumCreatePost",
              "description": "Create forum posts"
            },
            {
              "name": "forumPatchPost",
              "description": "Edit forum posts"
            },
            {
              "name": "forumDeletePost",
              "description": "Delete forum posts"
            },
            {
              "name": "forumPostDraft",
              "description": "Turn published forum posts into drafts"
            },
            {
              "name": "forumPostPublish",
              "description": "Publish forum posts"
            },
            {
              "name": "forumPostSetFeatured",
              "description": "Featured/unfeature forum posts"
            }
          ]
        },
        "comments": {
          "name": "forumComments",
          "description": "Forum comments",
          "actions": [
            {
              "name": "postsAll",
              "description": "All forum comment actions",
              "use": [
                "forumCreatePost",
                "forumPatchPost",
                "forumDeletePost",
                "forumPostDraft",
                "forumPostPublish"
              ]
            },
            {
              "name": "forumCreateComment",
              "description": "Create forum comments"
            },
            {
              "name": "forumUpdateComment",
              "description": "Edit forum comments"
            },
            {
              "name": "forumDeleteComment",
              "description": "Delete forum comments"
            }
          ]
        }
      }
    }
  },
  "documents": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-documents-ui/src",
      "name": "documents",
      "scope": "documents",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./printButton": "./src/containers/PrintButton.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-documents-ui/remoteEntry.js",
        "scope": "documents",
        "module": "./routes"
      },
      "cardDetailAction": "./printButton",
      "menus": [
        {
          "text": "Documents",
          "to": "/settings/documents",
          "image": "/images/icons/erxes-09.svg",
          "location": "settings",
          "scope": "documents",
          "action": "documentsAll",
          "permissions": [
            "manageDocuments"
          ]
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-documents-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "documents": {
          "name": "documents",
          "description": "Documents",
          "actions": [
            {
              "name": "documentsAll",
              "description": "All",
              "use": [
                "manageDocuments",
                "removeDocuments",
                "showDocuments"
              ]
            },
            {
              "name": "manageDocuments",
              "description": "Manage documents"
            },
            {
              "name": "removeDocuments",
              "description": "Remove documents"
            },
            {
              "name": "showDocuments",
              "description": "Show documents"
            }
          ]
        }
      }
    }
  },
  "pricing": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-pricing-ui/src",
      "name": "pricing",
      "scope": "pricing",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-pricing-ui/remoteEntry.js",
        "scope": "pricing",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Pricing",
          "to": "/pricing/plans",
          "image": "/images/icons/erxes-06.svg",
          "location": "settings",
          "scope": "pricing",
          "action": "allPricing",
          "permissions": [
            "showPricing",
            "managePricing"
          ]
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-pricing-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "pricing": {
          "name": "pricing",
          "description": "Pricing",
          "actions": [
            {
              "name": "allPricing",
              "description": "All Pricing",
              "use": [
                "showPricing",
                "managePricing"
              ]
            },
            {
              "name": "managePricing",
              "description": "Manage Pricing",
              "use": [
                "showPricing"
              ]
            },
            {
              "name": "showPricing",
              "description": "Show Pricing"
            }
          ]
        }
      }
    }
  },
  "timeclock": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-timeclock-ui/src",
      "name": "timeclock",
      "scope": "timeclock",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-timeclock-ui/remoteEntry.js",
        "scope": "timeclock",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Timeclocks",
          "url": "/timeclocks",
          "icon": "icon-star",
          "location": "mainNavigation"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-timeclock-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "timeclock": {
          "name": "timeclock",
          "description": "Timeclock",
          "actions": [
            {
              "name": "timeclocksAll",
              "description": "All",
              "use": [
                "showTimeclocks",
                "manageTimeclocks"
              ]
            },
            {
              "name": "manageTimeclocks",
              "description": "Manage timeclocks"
            },
            {
              "name": "showTimeclocks",
              "description": "Show timeclocks"
            }
          ]
        }
      }
    }
  },
  "zalo": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-zalo-ui/src",
      "name": "zalo",
      "scope": "zalo",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./inboxIntegrationSettings": "./src/containers/IntergrationConfigs.tsx",
        "./inboxConversationDetail": "./src/components/ConversationDetail.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-zalo-ui/remoteEntry.js",
        "scope": "zalo",
        "module": "./routes"
      },
      "inboxIntegrationSettings": "./inboxIntegrationSettings",
      "inboxConversationDetail": "./inboxConversationDetail",
      "inboxDirectMessage": {
        "messagesQuery": {
          "query": "\n        query zaloConversationMessages(\n          $conversationId: String!\n          $skip: Int\n          $limit: Int\n          $getFirst: Boolean\n        ) {\n          zaloConversationMessages(\n            conversationId: $conversationId,\n            skip: $skip,\n            limit: $limit,\n            getFirst: $getFirst\n          ) {\n            _id\n            content\n            conversationId\n            customerId\n            userId\n            createdAt\n            isCustomerRead\n            \n            attachments {\n              thumbnail\n              type\n              url\n              name\n              description\n              duration\n              coordinates\n            }\n\n            user {\n              _id\n              username\n              details {\n                avatar\n                fullName\n                position\n              }\n            }\n\n            customer {\n              _id\n              avatar\n              firstName\n              middleName\n              lastName\n              primaryEmail\n              primaryPhone\n              state\n\n              companies {\n                _id\n                primaryName\n                website\n              }\n\n              customFieldsData\n              tagIds\n            }\n          }\n        }\n      ",
          "name": "zaloConversationMessages",
          "integrationKind": "zalo"
        },
        "countQuery": {
          "query": "\n        query zaloConversationMessagesCount($conversationId: String!) {\n          zaloConversationMessagesCount(conversationId: $conversationId)\n        }\n      ",
          "name": "zaloConversationMessagesCount",
          "integrationKind": "zalo"
        }
      },
      "inboxIntegrations": [
        {
          "name": "Zalo",
          "description": "Please write integration description on plugin config file",
          "isAvailable": true,
          "kind": "zalo",
          "logo": "/images/integrations/zalo.png",
          "createUrl": "/settings/integrations/createZalo",
          "category": "All integrations, For support teams, Marketing automation, Email marketing"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-zalo-ui/remoteEntry.js"
    }
  },
  "facebook": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-facebook-ui/src",
      "name": "facebook",
      "scope": "facebook",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./inboxIntegrationSettings": "./src/containers/UpdateConfigsContainer.tsx",
        "./activityLog": "./src/containers/ActivityLogsContainer.tsx",
        "./inboxConversationDetailRespondBoxMask": "./src/containers/TagMessageContainer.tsx",
        "./inboxConversationDetail": "./src/containers/post/FbCommentsContainer.tsx",
        "./automation": "./src/automations/index.tsx",
        "./messenger-bots": "./src/automations/bots/containers/List.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-facebook-ui/remoteEntry.js",
        "scope": "facebook",
        "module": "./routes"
      },
      "automation": "./automation",
      "automationBots": [
        {
          "name": "facebook-messenger-bots",
          "label": "Facebook Messenger",
          "description": "Generate Facebook Messenger Bots",
          "logo": "/images/integrations/fb-messenger.png",
          "list": "./messenger-bots",
          "createUrl": "/settings/facebook-messenger-bot/create",
          "totalCountQuery": "query FacebootMessengerBotsTotalCount { facebootMessengerBotsTotalCount }"
        }
      ],
      "inboxIntegrationSettings": "./inboxIntegrationSettings",
      "inboxDirectMessage": {
        "messagesQuery": {
          "query": "\n          query facebookConversationMessages(\n            $conversationId: String!\n            $skip: Int\n            $limit: Int\n            $getFirst: Boolean\n          ) {\n            facebookConversationMessages(\n              conversationId: $conversationId,\n              skip: $skip,\n              limit: $limit,\n              getFirst: $getFirst\n            ) {\n              _id\n              content\n              conversationId\n              customerId\n              userId\n              createdAt\n              isCustomerRead\n              internal\n\n              botData\n\n              attachments {\n                url\n                name\n                type\n                size\n              }\n\n              user {\n                _id\n                username\n                details {\n                  avatar\n                  fullName\n                  position\n                }\n              }\n\n              customer {\n                _id\n                avatar\n                firstName\n                middleName\n                lastName\n                primaryEmail\n                primaryPhone\n                state\n\n                companies {\n                  _id\n                  primaryName\n                  website\n                }\n\n                customFieldsData\n                tagIds\n              }\n            }\n          }\n        ",
          "name": "facebookConversationMessages",
          "integrationKind": "facebook-messenger"
        },
        "countQuery": {
          "query": "\n          query facebookConversationMessagesCount($conversationId: String!) {\n            facebookConversationMessagesCount(conversationId: $conversationId)\n          }\n        ",
          "name": "facebookConversationMessagesCount",
          "integrationKind": "facebook-messenger"
        }
      },
      "inboxIntegrations": [
        {
          "name": "Facebook Post",
          "description": "Connect to Facebook posts right from your Team Inbox",
          "inMessenger": false,
          "isAvailable": true,
          "kind": "facebook-post",
          "logo": "/images/integrations/facebook.png",
          "createModal": "facebook-post",
          "createUrl": "/settings/integrations/createFacebook",
          "category": "All integrations, For support teams, Marketing automation, Social media",
          "components": [
            "inboxConversationDetailRespondBoxMask"
          ]
        },
        {
          "name": "Facebook Messenger",
          "description": "Connect and manage Facebook Messages right from your Team Inbox",
          "inMessenger": false,
          "isAvailable": true,
          "kind": "facebook-messenger",
          "logo": "/images/integrations/fb-messenger.png",
          "createModal": "facebook-messenger",
          "createUrl": "/settings/integrations/createFacebook",
          "category": "All integrations, For support teams, Messaging, Social media, Conversation",
          "components": [
            "inboxConversationDetailRespondBoxMask"
          ]
        }
      ],
      "activityLog": "./activityLog",
      "inboxConversationDetailRespondBoxMask": "./inboxConversationDetailRespondBoxMask",
      "inboxConversationDetail": "./inboxConversationDetail",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-facebook-ui/remoteEntry.js"
    },
    "api": {
      "essyncer": [
        {
          "name": "conversation_messages_facebooks",
          "schema": "{}",
          "script": ""
        }
      ]
    }
  },
  "filemanager": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-filemanager-ui/src",
      "name": "filemanager",
      "scope": "filemanager",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./fileChooserSection": "./src/containers/file/CardFolderChooser.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-filemanager-ui/remoteEntry.js",
        "scope": "filemanager",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "File Manager",
          "url": "/filemanager",
          "icon": "icon-folder-1",
          "location": "mainNavigation",
          "permissions": [
            "showFileManager"
          ]
        }
      ],
      "dealRightSidebarSection": "./fileChooserSection",
      "ticketRightSidebarSection": "./fileChooserSection",
      "taskRightSidebarSection": "./fileChooserSection",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-filemanager-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "filemanager": {
          "name": "filemanager",
          "description": "File manager",
          "actions": [
            {
              "name": "showFilemanager",
              "description": "Show file manager"
            },
            {
              "name": "filemanagerFolderSave",
              "description": "Create folder"
            },
            {
              "name": "filemanagerFileCreate",
              "description": "Create file"
            }
          ]
        }
      }
    }
  },
  "khanbank": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-khanbank-ui/src",
      "name": "khanbank",
      "scope": "khanbank",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./widget": "./src/modules/corporateGateway/components/Widget.tsx"
      },
      "widget": "./widget",
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-khanbank-ui/remoteEntry.js",
        "scope": "khanbank",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Khanbank",
          "to": "/settings/khanbank",
          "image": "/images/icons/erxes-25.png",
          "location": "settings",
          "scope": "khanbank",
          "action": "khanbankConfigsAll",
          "permissions": [
            "khanbankConfigsShow"
          ]
        },
        {
          "text": "Khanbank",
          "url": "/khanbank-corporate-gateway",
          "icon": "icon-university",
          "location": "mainNavigation",
          "scope": "khanbank",
          "action": "khanbankConfigsAll",
          "permissions": [
            "khanbankConfigsShow"
          ]
        },
        {
          "text": "Currency Rates Widget",
          "url": "/khanbank-corporate-gateway/widget",
          "icon": "icon-dollar-sign",
          "location": "topNavigation",
          "scope": "khanbank",
          "component": "./widget"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-khanbank-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "khanbankConfigs": {
          "name": "khanbankConfigs",
          "description": "Khanbank Configs",
          "actions": [
            {
              "name": "khanbankConfigsAll",
              "description": "All",
              "use": [
                "khanbankConfigsAdd",
                "khanbankConfigsEdit",
                "khanbankConfigsRemove",
                "khanbankConfigsShow"
              ]
            },
            {
              "name": "khanbankConfigsAdd",
              "description": "Add new config"
            },
            {
              "name": "khanbankConfigsEdit",
              "description": "Edit config"
            },
            {
              "name": "khanbankConfigsRemove",
              "description": "Remove config"
            },
            {
              "name": "khanbankConfigsShow",
              "description": "Show configs"
            }
          ]
        },
        "khanbankAccounts": {
          "name": "khanbankAccounts",
          "description": "Khanbank Accounts",
          "actions": [
            {
              "name": "khanbankAccountsAll",
              "description": "All",
              "use": [
                "khanbankAccountDetail",
                "khanbankAccounts"
              ]
            },
            {
              "name": "khanbankAccountDetail",
              "description": "Show Khanbank Account detail"
            },
            {
              "name": "khanbankAccounts",
              "description": "Show Khanbank accounts"
            }
          ]
        },
        "khanbankTransactions": {
          "name": "khanbankTransactions",
          "description": "Khanbank Transactions",
          "actions": [
            {
              "name": "khanbankTransactionsAll",
              "description": "All",
              "use": [
                "khanbankTransactionsShow",
                "khanbankTransfer"
              ]
            },
            {
              "name": "khanbankTransactionsShow",
              "description": "Show Khanbank transactions"
            },
            {
              "name": "khanbankTransfer",
              "description": "Create Khanbank transactions"
            }
          ]
        }
      }
    }
  },
  "productplaces": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-productplaces-ui/src",
      "name": "productplaces",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./response": "./src/response.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-productplaces-ui/remoteEntry.js",
        "scope": "productplaces",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Product Places",
          "to": "/erxes-plugin-product-places/settings/stage",
          "image": "/images/icons/erxes-04.svg",
          "location": "settings",
          "scope": "productplaces",
          "action": "productPlacesConfig",
          "permission": "productPlacesConfig"
        }
      ],
      "layout": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-productplaces-ui/remoteEntry.js",
        "scope": "productplaces",
        "module": "./response"
      },
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-productplaces-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "productplaces": {
          "name": "productplaces",
          "description": "Product Places",
          "actions": [
            {
              "name": "productPlacesConfig",
              "description": "Manage productplaces config"
            }
          ]
        }
      }
    }
  },
  "ecommerce": {},
  "grants": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-grants-ui/src",
      "name": "grants",
      "scope": "grants",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./cardSideBarSection": "./src/section/containers/Section.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-grants-ui/remoteEntry.js",
        "scope": "grants",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Grants",
          "url": "/grants/requests",
          "icon": "icon-followers",
          "location": "mainNavigation"
        },
        {
          "text": "Grants Configs",
          "to": "/settings/grants-configs",
          "image": "/images/icons/erxes-18.svg",
          "location": "settings",
          "scope": "grants"
        }
      ],
      "dealRightSidebarSection": "./cardSideBarSection",
      "ticketRightSidebarSection": "./cardSideBarSection",
      "taskRightSidebarSection": "./cardSideBarSection",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-grants-ui/remoteEntry.js"
    }
  },
  "loans": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-loans-ui/src",
      "name": "loans",
      "scope": "loans",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./contractSection": "./src/contracts/components/common/ContractSection.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loans-ui/remoteEntry.js",
        "scope": "loans",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Loan Contract",
          "url": "/erxes-plugin-loan/contract-list",
          "icon": "icon-medal",
          "location": "mainNavigation",
          "permissions": [
            "showContracts"
          ],
          "permission": "showContracts"
        },
        {
          "text": "Contract types",
          "image": "/images/icons/erxes-01.svg",
          "to": "/erxes-plugin-loan/contract-types/",
          "action": "loanConfig",
          "scope": "loans",
          "location": "settings",
          "permissions": [
            "showContracts"
          ],
          "permission": "showContracts"
        },
        {
          "text": "Insurance types",
          "image": "/images/icons/erxes-13.svg",
          "to": "/erxes-plugin-loan/insurance-types/",
          "action": "loanConfig",
          "scope": "loans",
          "location": "settings",
          "permissions": [
            "manageInsuranceTypes"
          ],
          "permission": "manageInsuranceTypes"
        },
        {
          "text": "Loan config",
          "image": "/images/icons/erxes-16.svg",
          "to": "/erxes-plugin-loan/holiday-settings/",
          "action": "loanConfig",
          "scope": "loans",
          "location": "settings",
          "permissions": [
            "manageLoanConfigs"
          ],
          "permission": "manageLoanConfigs"
        },
        {
          "text": "Transaction",
          "image": "/images/icons/erxes-16.svg",
          "to": "/erxes-plugin-loan/transaction-list",
          "action": "transaction",
          "scope": "loans",
          "location": "transaction-list",
          "permissions": [
            "showTransactions"
          ]
        },
        {
          "text": "nonBalanceTransaction",
          "image": "/images/icons/erxes-16.svg",
          "to": "/erxes-plugin-loan/non-balance-transactions",
          "action": "nonBalanceTransaction",
          "scope": "loans",
          "location": "non-balance-transactions",
          "permissions": [
            "showNonBalanceTransactions"
          ]
        }
      ],
      "customerRightSidebarSection": "./contractSection",
      "companyRightSidebarSection": "./contractSection",
      "dealRightSidebarSection": "./contractSection",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loans-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "loans": {
          "name": "loans",
          "description": "Loans",
          "actions": [
            {
              "name": "loansAll",
              "description": "All Loan",
              "use": [
                "contractsAdd",
                "contractsEdit",
                "contractsDealEdit",
                "contractsClose",
                "contractsRemove",
                "showContracts",
                "manageContracts",
                "manageSchedule",
                "showCollaterals",
                "manageLoanConfigs",
                "manageInsuranceTypes",
                "manageInvoices",
                "showLoanInvoices",
                "manageTransactions",
                "showTransactions",
                "showNonBalanceTransactions",
                "transactionsEdit",
                "transactionsRemove",
                "nonBalanceTransactionsRemove",
                "showPeriodLocks",
                "managePeriodLocks"
              ]
            },
            {
              "name": "loansContractsAll",
              "description": "Manage All Loan Contracts",
              "use": [
                "contractsAdd",
                "contractsEdit",
                "contractsDealEdit",
                "contractsClose",
                "contractsRemove",
                "showContracts",
                "manageSchedule",
                "showCollaterals"
              ]
            },
            {
              "name": "loansTransactionsAll",
              "description": "Manage All Loan Transaction",
              "use": [
                "manageTransactions",
                "showTransactions",
                "transactionsEdit",
                "transactionsRemove"
              ]
            },
            {
              "name": "loansPeriodLocksAll",
              "description": "Manage All Period Locks",
              "use": [
                "showPeriodLocks",
                "managePeriodLocks"
              ]
            },
            {
              "name": "contractsAdd",
              "description": "Contract Add"
            },
            {
              "name": "contractsEdit",
              "description": "Contract Edit"
            },
            {
              "name": "contractsDealEdit",
              "description": "Contract Deal Relation"
            },
            {
              "name": "contractsClose",
              "description": "Close Contract"
            },
            {
              "name": "contractsRemove",
              "description": "Delete Contract"
            },
            {
              "name": "showContracts",
              "description": "Show Contracts"
            },
            {
              "name": "manageContracts",
              "description": "Manage Contracts"
            },
            {
              "name": "manageSchedule",
              "description": "Manage Schedule"
            },
            {
              "name": "showCollaterals",
              "description": "Show Collaterals"
            },
            {
              "name": "manageLoanConfigs",
              "description": "Manage Loan Configs"
            },
            {
              "name": "manageInsuranceTypes",
              "description": "Manage Insurance Config"
            },
            {
              "name": "manageInvoices",
              "description": "Manage Invoices"
            },
            {
              "name": "showLoanInvoices",
              "description": "Show Invoices"
            },
            {
              "name": "manageTransactions",
              "description": "Manage Transaction"
            },
            {
              "name": "showTransactions",
              "description": "Show Transactions"
            },
            {
              "name": "transactionsEdit",
              "description": "Edit Transactions"
            },
            {
              "name": "transactionsRemove",
              "description": "Remove Transactions"
            },
            {
              "name": "showNonBalanceTransactions",
              "description": "Show Non Balance Transactions"
            },
            {
              "name": "nonBalanceTransactionsRemove",
              "description": "Remove Non Balance Transactions"
            },
            {
              "name": "showPeriodLocks",
              "description": "Show Period Locks"
            },
            {
              "name": "managePeriodLocks",
              "description": "Manage Period Locks"
            }
          ]
        }
      }
    }
  },
  "viber": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-viber-ui/src",
      "name": "viber",
      "scope": "viber",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./inboxIntegrationForm": "./src/components/IntegrationForm.tsx",
        "./inboxConversationDetail": "./src/components/ConversationDetail.tsx",
        "./integrationDetailsForm": "./src/components/IntegrationEditForm.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-viber-ui/remoteEntry.js",
        "scope": "viber",
        "module": "./routes"
      },
      "inboxDirectMessage": {
        "messagesQuery": {
          "query": "\n        query viberConversationMessages(\n          $conversationId: String!\n          $skip: Int\n          $limit: Int\n          $getFirst: Boolean\n        ) {\n          viberConversationMessages(\n            conversationId: $conversationId,\n            skip: $skip,\n            limit: $limit,\n            getFirst: $getFirst\n          ) {\n            _id\n            content\n            conversationId\n            customerId\n            userId\n            createdAt\n            isCustomerRead\n            internal\n\n            attachments {\n              url\n              name\n              type\n              size\n            }\n\n            user {\n              _id\n              username\n              details {\n                avatar\n                fullName\n                position\n              }\n            }\n\n            customer {\n              _id\n              avatar\n              firstName\n              middleName\n              lastName\n              primaryEmail\n              primaryPhone\n              state\n\n              companies {\n                _id\n                primaryName\n                website\n              }\n\n              customFieldsData\n              tagIds\n            }\n          }\n        }\n      ",
          "name": "viberConversationMessages",
          "integrationKind": "viber"
        },
        "countQuery": {
          "query": "\n        query viberConversationMessagesCount($conversationId: String!) {\n          viberConversationMessagesCount(conversationId: $conversationId)\n        }\n      ",
          "name": "viberConversationMessagesCount",
          "integrationKind": "viber"
        }
      },
      "inboxIntegrationForm": "./inboxIntegrationForm",
      "invoiceDetailRightSection": "./invoiceDetailRightSection",
      "integrationDetailsForm": "./integrationDetailsForm",
      "inboxIntegrations": [
        {
          "name": "Viber",
          "description": "Configure Viber application",
          "isAvailable": true,
          "kind": "viber",
          "logo": "/images/integrations/viber.png",
          "createModal": "viber"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-viber-ui/remoteEntry.js"
    }
  },
  "meetings": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-meetings-ui/src",
      "name": "meetings",
      "scope": "meetings",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./meetingSideBarSection": "./src/DealRoute.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-meetings-ui/remoteEntry.js",
        "scope": "meetings",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Meetings",
          "url": "/meetings/myCalendar",
          "icon": "icon-calender",
          "location": "mainNavigation"
        }
      ],
      "dealRightSidebarSection": "./meetingSideBarSection",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-meetings-ui/remoteEntry.js"
    }
  },
  "xyp": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-xyp-ui/src",
      "name": "xyp",
      "scope": "xyp",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./xypConfigs": "./src/modules//settings/components/XypConfigs.tsx",
        "./customerSidebar": "./src/modules/contacts/containers/CustomerSidebar.tsx"
      },
      "extendSystemConfig": "./xypConfigs",
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-xyp-ui/remoteEntry.js",
        "scope": "xyp",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "XYP Sync Rules",
          "to": "/xyp-sync-rules",
          "image": "/images/icons/erxes-05.svg",
          "location": "settings",
          "scope": "xyp",
          "action": "xyp sync rule",
          "permissions": []
        }
      ],
      "customerRightSidebarSection": "./customerSidebar",
      "carRightSidebarSection": "./customerSidebar",
      "dealRightSidebarSection": "./customerSidebar",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-xyp-ui/remoteEntry.js"
    },
    "api": {
      "essyncer": [
        {
          "name": "xyp_datas",
          "schema": "{}",
          "script": ""
        }
      ]
    }
  },
  "savings": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-savings-ui/src",
      "name": "savings",
      "scope": "savings",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./contractSection": "./src/contracts/components/common/ContractSection.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-savings-ui/remoteEntry.js",
        "scope": "savings",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Saving Contract",
          "url": "/erxes-plugin-saving/contract-list",
          "icon": "icon-piggybank",
          "location": "mainNavigation",
          "permissions": [
            "showContracts"
          ],
          "permission": "showContracts"
        },
        {
          "text": "Saving Contract types",
          "image": "/images/icons/erxes-01.svg",
          "to": "/erxes-plugin-saving/contract-types/",
          "action": "savingConfig",
          "scope": "savings",
          "location": "settings",
          "permissions": [
            "showContracts"
          ],
          "permission": "showContracts"
        },
        {
          "text": "Saving Transaction",
          "image": "/images/icons/erxes-16.svg",
          "to": "/erxes-plugin-saving/transaction-list",
          "action": "transaction",
          "scope": "savings",
          "location": "transaction-list",
          "permissions": [
            "showTransactions"
          ]
        },
        {
          "text": "Saving config",
          "image": "/images/icons/erxes-16.svg",
          "to": "/erxes-plugin-saving/saving-settings/",
          "action": "savingConfig",
          "scope": "savings",
          "location": "settings",
          "permissions": [
            "savingsManageSavingConfigs"
          ],
          "permission": "savingsManageSavingConfigs"
        }
      ],
      "customerRightSidebarSection": "./contractSection",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-savings-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "savings": {
          "name": "savings",
          "description": "Saving",
          "actions": [
            {
              "name": "savingsAll",
              "description": "All Saving",
              "use": [
                "savingsContractsAdd",
                "savingsContractsEdit",
                "savingsContractsDealEdit",
                "savingsContractsClose",
                "savingsContractsRemove",
                "savingsShowContracts",
                "savingsManageContracts",
                "savingsManageSchedule",
                "savingsShowCollaterals",
                "savingsManageSavingConfigs",
                "savingsManageInsuranceTypes",
                "savingsManageInvoices",
                "savingsShowSavingInvoices",
                "savingsManageTransactions",
                "savingsShowTransactions",
                "savingsTransactionsEdit",
                "savingsTransactionsRemove",
                "savingsShowPeriodLocks",
                "savingsManagePeriodLocks"
              ]
            },
            {
              "name": "savingsContractsAll",
              "description": "Manage All Saving Contracts",
              "use": [
                "savingsContractsAdd",
                "savingsContractsEdit",
                "savingsContractsDealEdit",
                "savingsContractsClose",
                "savingsContractsRemove",
                "savingsShowContracts"
              ]
            },
            {
              "name": "savingsTransactionsAll",
              "description": "Manage All Saving Transaction",
              "use": [
                "savingsManageTransactions",
                "savingsShowTransactions",
                "transactionsEdit",
                "transactionsRemove"
              ]
            },
            {
              "name": "savingsPeriodLocksAll",
              "description": "Saving Manage All Period Locks",
              "use": [
                "savingsShowPeriodLocks",
                "savingsManagePeriodLocks"
              ]
            },
            {
              "name": "savingsContractsAdd",
              "description": "Saving Contract Add"
            },
            {
              "name": "savingsContractsEdit",
              "description": "Saving Contract Edit"
            },
            {
              "name": "savingsContractsDealEdit",
              "description": "Saving Contract Deal Relation"
            },
            {
              "name": "savingsContractsClose",
              "description": "Close Saving Contract"
            },
            {
              "name": "savingsContractsRemove",
              "description": "Delete Saving Contract"
            },
            {
              "name": "savingsShowContracts",
              "description": "Show Saving Contracts"
            },
            {
              "name": "savingsManageContracts",
              "description": "Manage Saving Contracts"
            },
            {
              "name": "manageSavingsConfigs",
              "description": "Manage Saving Configs"
            },
            {
              "name": "savingsManageTransactions",
              "description": "Manage Saving Transaction"
            },
            {
              "name": "savingsShowTransactions",
              "description": "Show Saving Transactions"
            },
            {
              "name": "savingsTransactionsEdit",
              "description": "Edit Saving Transactions"
            },
            {
              "name": "savingsTransactionsRemove",
              "description": "Remove Saving Transactions"
            },
            {
              "name": "showSavingsPeriodLocks",
              "description": "Show Saving Period Locks"
            },
            {
              "name": "manageSavingsPeriodLocks",
              "description": "Manage Saving Period Locks"
            }
          ]
        }
      }
    }
  },
  "goals": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-goals-ui/src",
      "name": "goalType",
      "scope": "goalType",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-goals-ui/remoteEntry.js",
        "scope": "goalType",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Goals",
          "to": "/erxes-plugin-goalType/goalType",
          "image": "/images/icons/erxes-18.svg",
          "location": "settings",
          "scope": "goalType"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-goals-ui/remoteEntry.js"
    }
  },
  "msdynamic": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-msdynamic-ui/src",
      "name": "msdynamic",
      "scope": "msdynamic",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./customerSidebar": "./src/containers/CustomerSidebar.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-msdynamic-ui/remoteEntry.js",
        "scope": "msdynamic",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Msdynamics",
          "to": "/msdynamics",
          "image": "/images/icons/erxes-18.svg",
          "location": "settings",
          "scope": "msdynamic"
        },
        {
          "text": "Sync MS Dynamic",
          "url": "/sync-msdynamic-history",
          "icon": "icon-file-check-alt",
          "location": "mainNavigation",
          "scope": "syncmsdynamic"
        }
      ],
      "customerRightSidebarSection": "./customerSidebar",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-msdynamic-ui/remoteEntry.js"
    }
  },
  "dailyco": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-dailyco-ui/src",
      "name": "dailyco",
      "scope": "dailyco",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./inboxEditorAction": "./src/containers/ManageRoom.tsx",
        "./videoCall": "./src/components/VideoCall.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-dailyco-ui/remoteEntry.js",
        "scope": "dailyco",
        "module": "./routes"
      },
      "inboxEditorAction": "./inboxEditorAction",
      "videoCall": "./videoCall",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-dailyco-ui/remoteEntry.js"
    }
  },
  "zms": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-zms-ui/src",
      "name": "zms",
      "scope": "zms",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-zms-ui/remoteEntry.js",
        "scope": "zms",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Zms",
          "url": "/plugin-zms/zms",
          "icon": "icon-star",
          "location": "mainNavigation"
        },
        {
          "text": "Main config",
          "image": "/images/icons/erxes-16.svg",
          "to": "/plugin-zms/settings",
          "action": "mainConfig",
          "scope": "zms",
          "location": "settings"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-zms-ui/remoteEntry.js"
    }
  },
  "syncpolaris": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-syncpolaris-ui/src",
      "name": "syncpolaris",
      "scope": "syncpolaris",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./customerSidebar": "./src/pullPolaris/containers/CustomerSidebar.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-syncpolaris-ui/remoteEntry.js",
        "scope": "syncpolaris",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Sync polaris config",
          "to": "/erxes-plugin-sync-polaris/settings/general",
          "image": "/images/icons/erxes-04.svg",
          "location": "settings",
          "scope": "syncpolaris",
          "action": "syncPolarisonfig",
          "permission": "syncPolarisConfig"
        },
        {
          "text": "Sync Polaris",
          "url": "/sync-polaris-history",
          "icon": "icon-star",
          "location": "mainNavigation"
        }
      ],
      "customerRightSidebarSection": "./customerSidebar",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-syncpolaris-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "syncpolaris": {
          "name": "polaris",
          "description": "Polaris",
          "actions": [
            {
              "name": "syncPolarisConfig",
              "description": "Manage polaris config"
            }
          ]
        }
      }
    }
  },
  "reports": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-reports-ui/src",
      "name": "reports",
      "scope": "reports",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./reportsCommonFormButton": "./src/containers/common/CommonFormButton.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-reports-ui/remoteEntry.js",
        "scope": "reports",
        "module": "./routes"
      },
      "reportsCommonFormButton": "./reportsCommonFormButton",
      "menus": [
        {
          "text": "Reports",
          "to": "/reports",
          "image": "/images/icons/erxes-18.svg",
          "location": "settings",
          "scope": "reports"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-reports-ui/remoteEntry.js"
    }
  },
  "instagram": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-instagram-ui/src",
      "name": "instagram",
      "scope": "instagram",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./inboxIntegrationSettings": "./src/containers/UpdateConfigsContainer.tsx",
        "./activityLog": "./src/containers/ActivityLogsContainer.tsx",
        "./inboxConversationDetailRespondBoxMask": "./src/containers/TagMessageContainer.tsx",
        "./automation": "./src/automations/index.tsx",
        "./messenger-bots": "./src/automations/bots/containers/List.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-instagram-ui/remoteEntry.js",
        "scope": "instagram",
        "module": "./routes"
      },
      "automation": "./automation",
      "automationBots": [
        {
          "name": "instagram-messenger-bots",
          "label": "Instagram Messenger",
          "description": "Generate Instagram Messenger Bots",
          "logo": "/images/integrations/instagram.png",
          "list": "./messenger-bots",
          "createUrl": "/settings/instagram-messenger-bot/create",
          "totalCountQuery": "query IgbootMessengerBotsTotalCount { igbootMessengerBotsTotalCount }"
        }
      ],
      "inboxIntegrationSettings": "./inboxIntegrationSettings",
      "inboxDirectMessage": {
        "messagesQuery": {
          "query": "\n          query instagramConversationMessages(\n            $conversationId: String!\n            $skip: Int\n            $limit: Int\n            $getFirst: Boolean\n          ) {\n            instagramConversationMessages(\n              conversationId: $conversationId,\n              skip: $skip,\n              limit: $limit,\n              getFirst: $getFirst\n            ) {\n              _id\n              content\n              conversationId\n              customerId\n              userId\n              createdAt\n              isCustomerRead\n              internal\n              botData\n              attachments {\n                url\n                name\n                type\n                size\n              }\n\n              user {\n                _id\n                username\n                details {\n                  avatar\n                  fullName\n                  position\n                }\n              }\n\n              customer {\n                _id\n                avatar\n                firstName\n                middleName\n                lastName\n                primaryEmail\n                primaryPhone\n                state\n\n                companies {\n                  _id\n                  primaryName\n                  website\n                }\n\n                customFieldsData\n                tagIds\n              }\n            }\n          }\n        ",
          "name": "instagramConversationMessages",
          "integrationKind": "instagram-messenger"
        },
        "countQuery": {
          "query": "\n          query instagramConversationMessagesCount($conversationId: String!) {\n            instagramConversationMessagesCount(conversationId: $conversationId)\n          }\n        ",
          "name": "instagramConversationMessagesCount",
          "integrationKind": "instagram-messenger"
        }
      },
      "inboxIntegrations": [
        {
          "name": "Instagram Post",
          "description": "Connect to Instagram posts right from your Team Inbox",
          "inMessenger": false,
          "isAvailable": true,
          "kind": "instagram-post",
          "logo": "/images/integrations/instagram.png",
          "createModal": "instagram-post",
          "createUrl": "/settings/integrations/createInstagram",
          "category": "All integrations, For support teams, Marketing automation, Social media",
          "components": [
            "inboxConversationDetailRespondBoxMask"
          ]
        },
        {
          "name": "Instagram Messenger",
          "description": "Connect and manage Instagram Messages right from your Team Inbox",
          "inMessenger": false,
          "isAvailable": true,
          "kind": "instagram-messenger",
          "logo": "/images/integrations/instagram.png",
          "createModal": "instagram-messenger",
          "createUrl": "/settings/integrations/createInstagram",
          "category": "All integrations, For support teams, Messaging, Social media, Conversation",
          "components": [
            "inboxConversationDetailRespondBoxMask"
          ]
        }
      ],
      "activityLog": "./activityLog",
      "inboxConversationDetailRespondBoxMask": "./inboxConversationDetailRespondBoxMask",
      "inboxConversationDetail": "./inboxConversationDetail",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-instagram-ui/remoteEntry.js"
    }
  },
  "whatsapp": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-whatsapp-ui/src",
      "name": "whatsapp",
      "scope": "whatsapp",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./inboxIntegrationSettings": "./src/containers/UpdateConfigsContainer.tsx",
        "./activityLog": "./src/containers/ActivityLogsContainer.tsx",
        "./inboxConversationDetailRespondBoxMask": "./src/containers/TagMessageContainer.tsx",
        "./automation": "./src/automations/index.tsx",
        "./messenger-bots": "./src/automations/bots/containers/List.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-whatsapp-ui/remoteEntry.js",
        "scope": "whatsapp",
        "module": "./routes"
      },
      "automation": "./automation",
      "automationBots": [
        {
          "name": "WhatsApp-bots",
          "label": "WhatsApp",
          "description": "Generate WhatsApp Bots",
          "logo": "/images/integrations/whatsapp.png",
          "list": "./messenger-bots",
          "createUrl": "/settings/whatsapp-messenger-bot/create",
          "totalCountQuery": "query WhatsappBootMessengerBotsTotalCount {  whatsappBootMessengerBotsTotalCount }"
        }
      ],
      "inboxIntegrationSettings": "./inboxIntegrationSettings",
      "inboxDirectMessage": {
        "messagesQuery": {
          "query": "\n          query whatsappConversationMessages(\n            $conversationId: String!\n            $skip: Int\n            $limit: Int\n            $getFirst: Boolean\n          ) {\n            whatsappConversationMessages(\n              conversationId: $conversationId,\n              skip: $skip,\n              limit: $limit,\n              getFirst: $getFirst\n            ) {\n              _id\n              content\n              conversationId\n              customerId\n              userId\n              createdAt\n              isCustomerRead\n              internal\n              botData\n\n              attachments {\n                url\n                name\n                type\n                size\n              }\n\n              user {\n                _id\n                username\n                details {\n                  avatar\n                  fullName\n                  position\n                }\n              }\n\n              customer {\n                _id\n                avatar\n                firstName\n                middleName\n                lastName\n                primaryEmail\n                primaryPhone\n                state\n\n                companies {\n                  _id\n                  primaryName\n                  website\n                }\n\n                customFieldsData\n                tagIds\n              }\n            }\n          }\n        ",
          "name": "whatsappConversationMessages",
          "integrationKind": "whatsapp"
        },
        "countQuery": {
          "query": "\n          query whatsappConversationMessagesCount($conversationId: String!) {\n            whatsappConversationMessagesCount(conversationId: $conversationId)\n          }\n        ",
          "name": "whatsappConversationMessagesCount",
          "integrationKind": "whatsapp"
        }
      },
      "inboxIntegrations": [
        {
          "name": "Whats App",
          "description": "Connect and manage Whats App right from your Team Inbox",
          "inMessenger": false,
          "isAvailable": true,
          "kind": "whatsapp",
          "logo": "/images/integrations/whatsapp.png",
          "createModal": "whatsapp",
          "createUrl": "/settings/integrations/createWhatsapp",
          "category": "All integrations, For support teams, Messaging, Social media, Conversation",
          "components": [
            "inboxConversationDetailRespondBoxMask"
          ]
        }
      ],
      "activityLog": "./activityLog",
      "inboxConversationDetailRespondBoxMask": "./inboxConversationDetailRespondBoxMask",
      "inboxConversationDetail": "./inboxConversationDetail",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-whatsapp-ui/remoteEntry.js"
    }
  },
  "burenscoring": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-burenscoring-ui/src",
      "name": "burenscoring",
      "scope": "burenscoring",
      "exposes": {
        "./routes": "./src/routes.tsx",
        "./burenSection": "./src/containers/BurenSection.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-burenscoring-ui/remoteEntry.js",
        "scope": "burenscoring",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "BurenScorings",
          "url": "/burenscorings",
          "icon": "icon-star",
          "location": "mainNavigation"
        },
        {
          "text": "scoring config",
          "to": "/erxes-plugin-burenscoring/config/Settings",
          "image": "/images/icons/erxes-04.svg",
          "location": "settings",
          "scope": "burenscoring"
        }
      ],
      "customerRightSidebarSection": "./burenSection",
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-burenscoring-ui/remoteEntry.js"
    }
  },
  "golomtbank": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-golomtbank-ui/src",
      "name": "golomtbank",
      "scope": "golomtbank",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-golomtbank-ui/remoteEntry.js",
        "scope": "golomtbank",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "GolomtBank",
          "to": "/settings/golomtBank",
          "image": "/images/icons/erxes-25.png",
          "location": "settings",
          "scope": "golomtBank"
        },
        {
          "text": "GolomtBank",
          "url": "/golomtBank-corporate-gateway",
          "icon": "icon-university",
          "location": "mainNavigation",
          "scope": "golomtBank"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-golomtbank-ui/remoteEntry.js"
    }
  },
  "accountings": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-accountings-ui/src",
      "name": "accountings",
      "scope": "accountings",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-accountings-ui/remoteEntry.js",
        "scope": "accountings",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Accountings",
          "url": "/accountings/ptrs",
          "icon": "icon-lamp",
          "location": "mainNavigation",
          "permission": "showAccounts"
        },
        {
          "text": "Accounts",
          "to": "/accountings/accounts",
          "image": "/images/icons/erxes-31.png",
          "location": "settings",
          "scope": "accountings",
          "action": "accounts",
          "permissions": [
            "showAccounts",
            "manageAccounts"
          ]
        },
        {
          "text": "Configs of Accountings",
          "to": "/accountings/configs",
          "image": "/images/icons/erxes-31.png",
          "location": "settings",
          "scope": "accountings",
          "action": "accounts",
          "permissions": [
            "showAccounts",
            "manageAccounts"
          ]
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-accountings-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "accounts": {
          "name": "accounts",
          "description": "Accounts",
          "actions": [
            {
              "name": "accountsAll",
              "description": "All",
              "use": [
                "showAccounts",
                "manageAccounts",
                "accountsMerge",
                "removeAccounts"
              ]
            },
            {
              "name": "manageAccounts",
              "description": "Manage accounts"
            },
            {
              "name": "removeAccounts",
              "description": "Remove accounts"
            },
            {
              "name": "showAccounts",
              "description": "Show accounts"
            },
            {
              "name": "accountsMerge",
              "description": "Merge accounts"
            }
          ]
        },
        "accountingsTransaction": {
          "name": "accountingsTr",
          "description": "Accounting Transaction",
          "actions": [
            {
              "name": "accountingsTrAll",
              "description": "Transaction ALL"
            },
            {
              "name": "accountingsCreateMainTr",
              "description": "create main transaction"
            }
          ]
        }
      }
    }
  },
  "pms": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-pms-ui/src",
      "name": "pms",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-pms-ui/remoteEntry.js",
        "scope": "pms",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "PMS config",
          "to": "/settings/pms/general",
          "image": "/images/icons/erxes-04.svg",
          "location": "settings",
          "scope": "pms",
          "action": "pmsConfig",
          "permission": "pmsConfig"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-pms-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "pms": {
          "name": "pmsConfig",
          "description": "pmsConfig",
          "actions": [
            {
              "name": "pmsConfig",
              "description": "pmsConfig"
            }
          ]
        }
      }
    }
  },
  "bm": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-bm-ui/src",
      "name": "bm",
      "scope": "bm",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-bm-ui/remoteEntry.js",
        "scope": "bm",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Bms",
          "url": "/bms",
          "icon": "icon-star",
          "location": "mainNavigation"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-bm-ui/remoteEntry.js"
    }
  },
  "template": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-template-ui/src",
      "name": "template",
      "scope": "template",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-template-ui/remoteEntry.js",
        "scope": "template",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Templates",
          "to": "/settings/templates",
          "image": "/images/icons/erxes-18.svg",
          "location": "settings",
          "scope": "template"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-template-ui/remoteEntry.js"
    }
  },
  "cms": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-cms-ui/src",
      "name": "cms",
      "scope": "cms",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cms-ui/remoteEntry.js",
        "scope": "cms",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "CMS",
          "url": "/cms/posts",
          "icon": "icon-star",
          "location": "mainNavigation",
          "scope": "cms"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cms-ui/remoteEntry.js"
    },
    "api": {
      "permissions": {
        "payments": {
          "name": "cms",
          "description": "CMS",
          "actions": [
            {
              "name": "cmsAll",
              "description": "All",
              "use": [
                "cmsPostsAdd",
                "cmsPostsEdit",
                "cmsPostsRemove",
                "cmsTagsAdd",
                "cmsTagsEdit",
                "cmsTagsRemove",
                "cmsCategoriesAdd",
                "cmsCategoriesEdit",
                "cmsCategoriesRemove",
                "cmsPagesAdd",
                "cmsPagesEdit",
                "cmsPagesRemove",
                "cmsMenuAdd",
                "cmsMenuEdit",
                "cmsMenuRemove",
                "showCmsPosts",
                "showCmsTags",
                "showCmsCategories"
              ]
            },
            {
              "name": "cmsPostsAdd",
              "description": "Add post"
            },
            {
              "name": "cmsPostsEdit",
              "description": "Edit post"
            },
            {
              "name": "cmsPostsRemove",
              "description": "Remove post"
            },
            {
              "name": "cmsTagsAdd",
              "description": "Add tag"
            },
            {
              "name": "cmsTagsEdit",
              "description": "Edit tag"
            },
            {
              "name": "cmsTagsRemove",
              "description": "Remove tag"
            },
            {
              "name": "cmsCategoriesAdd",
              "description": "Add category"
            },
            {
              "name": "cmsCategoriesEdit",
              "description": "Edit category"
            },
            {
              "name": "cmsCategoriesRemove",
              "description": "Remove category"
            },
            {
              "name": "cmsPagesAdd",
              "description": "Add page"
            },
            {
              "name": "cmsPagesEdit",
              "description": "Edit page"
            },
            {
              "name": "cmsPagesRemove",
              "description": "Remove page"
            },
            {
              "name": "cmsMenuAdd",
              "description": "Add menu"
            },
            {
              "name": "cmsMenuEdit",
              "description": "Edit menu"
            },
            {
              "name": "cmsMenuRemove",
              "description": "Remove menu"
            },
            {
              "name": "showCmsPosts",
              "description": "Show posts"
            },
            {
              "name": "showCmsTags",
              "description": "Show cms tags"
            },
            {
              "name": "showCmsCategories",
              "descriotion": "Show cms categories"
            }
          ]
        }
      }
    }
  },
  "activedirectory": {
    "ui": {
      "srcDir": "/home/munkhgoy/Documents/work/erxes/erxes/packages/plugin-activedirectory-ui/src",
      "name": "activedirectory",
      "scope": "activedirectory",
      "exposes": {
        "./routes": "./src/routes.tsx"
      },
      "routes": {
        "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-activedirectory-ui/remoteEntry.js",
        "scope": "activedirectory",
        "module": "./routes"
      },
      "menus": [
        {
          "text": "Active Directory",
          "to": "/settings/activedirectory/",
          "url": "/activedirectory",
          "location": "settings",
          "image": "/images/icons/erxes-18.svg",
          "scope": "activedirectory"
        }
      ],
      "url": "https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-activedirectory-ui/remoteEntry.js"
    }
  }
}
