import colors from 'modules/common/styles/colors';

export const FEATURE_DETAILS = {
  growthHacks: {
    text: 'Growth hacking',
    icon: 'idea',
    color: '#f7802e',
    description:
      'From ideas to actual performance, making sure everything recorded, prioritized and centralized in the single platform to get tested with pool of analysis and learnings, which made the growing as pleasure.',
    videoUrl: 'url',
    settingsDetails: {
      boardCreate: {
        name: 'Create board',
        url: '/settings/boards/growthHack'
      },
      pipelineCreate: {
        name: 'Then create a project',
        url: '/settings/boards/growthHack'
      },
      growthHackCreate: {
        name: 'Now add an experiments',
        url: '/growthHack/board'
      }
    }
  },
  inbox: {
    text: 'Team inbox',
    description:
      'Combine real-time client and team communication with in-app messaging, live chat, email, and social networks, so your customers can reach you however and whenever they want.',
    videoUrl: 'url',
    settingsDetails: {
      brandCreate: {
        name: 'Create a brand',
        url: '/settings/brands'
      },
      channelCreate: {
        name: 'Create a channel',
        url: '/settings/channels'
      },
      integrationCreate: {
        name: 'Then create an integration',
        url: '/settings/integrations'
      }
    }
  },
  deals: {
    text: 'Sales pipeline',
    color: '#379ecb',
    icon: 'piggy-bank',
    description:
      'Control your sales pipeline from one responsive field by precisely analyzing your progress and determining your next best move for success.',
    videoUrl: 'url',
    settingsDetails: {
      boardCreate: {
        name: 'Create board',
        url: '/settings/boards/deal'
      },
      pipelineCreate: {
        name: 'Create pipeline',
        url: '/settings/boards/deal'
      },
      dealCreate: {
        name: 'Create deal',
        url: '/deal/board'
      }
    }
  },
  leads: {
    text: 'Pop Ups',
    color: '#c84b49',
    icon: 'laptop',
    description:
      'Turn regular visitors into qualified leads by capturing them with a customizable landing page, forms, pop-up or embed placements.',
    videoUrl: 'url',
    settingsDetails: {}
  },
  engages: {
    text: 'Engages',
    color: '#e359ae',
    icon: 'megaphone',
    description:
      'Start converting your prospects into potential customers through email, SMS, messenger or more interactions to drive them to a successful close.',
    videoUrl: 'url',
    settingsDetails: {
      emailTemplateCreate: {
        name: 'Create email template',
        url: '/settings/email-templates'
      },
      tagCreate: {
        name: 'Create tag',
        url: '/tags/engageMessage'
      }
    }
  },
  tasks: {
    text: 'Task',
    color: colors.colorCoreTeal,
    icon: 'clipboard',
    description:
      "Organize your own tasks or your team's sprints effectively with erxes Task. It involves planning, testing, tracking, and reporting.",
    videoUrl: 'url',
    settingsDetails: {
      boardCreate: {
        name: 'Create a task board',
        url: '/settings/boards/task'
      },
      pipelineCreate: {
        name: 'Create a task pipeline',
        url: '/settings/boards/task'
      },
      taskCreate: {
        name: 'Now add tasks',
        url: '/task/board'
      }
    }
  },
  tickets: {
    text: 'Tickets',
    description:
      'Easily scale and streamline your customer service and drastically improve your customer’s experience.',
    videoUrl: 'url',
    settingsDetails: {
      boardCreate: {
        name: 'Create a ticket board',
        url: '/settings/boards/ticket'
      },
      pipelineCreate: {
        name: 'Create a ticket pipeline',
        url: '/settings/boards/ticket'
      },
      ticketCreate: {
        name: 'Now add ticket',
        url: '/inbox/ticket/board'
      }
    }
  },
  knowledgeBase: {
    text: 'Knowledge base',
    icon: 'book',
    color: '#45b94c',
    description:
      'Educate both your customers and staff by creating a help center related to your brands, products and services to reach a higher level of satisfaction.',
    videoUrl: 'url',
    settingsDetails: {
      knowledgeBaseTopicCreate: {
        name: 'Create topic',
        url: '/knowledgebase'
      },
      knowledgeBaseCategoryCreate: {
        name: 'Create category',
        url: '/knowledgebase'
      },
      knowledgeBaseArticleCreate: {
        name: 'Now write articles',
        url: '/knowledgebase'
      }
    }
  },
  customers: {
    text: 'Database',
    icon: 'users',
    color: colors.colorCoreBlue,
    description:
      'Access our all-in-one CRM & product, and service system in one go so that it’s easier to coordinate and manage your interactions with your customers.',
    videoUrl: 'url',
    settingsDetails: {}
  },
  segments: {
    text: 'Segments',
    color: colors.colorSecondary,
    icon: 'pie-chart',
    description:
      'Segment is a customer data management and analytics solution that helps you make sense of customer and company data coming from multiple various sources.',
    videoUrl: 'url',
    settingsDetails: {}
  },
  tags: {
    text: 'Tags',
    color: '#89472e',
    icon: 'tag',
    description:
      'Tag means to categorize things into one abstract group. In other words, organizations can create and classify their own abstract categories.',
    videoUrl: 'url',
    settingsDetails: {}
  },
  properties: {
    text: 'Properties',
    color: colors.colorCoreGray,
    icon: 'folder-1',
    description:
      'You may need additional properties to gather information from customers, companies, and products/services.',
    videoUrl: 'url',
    settingsDetails: {}
  },
  permissions: {
    text: 'Permissions',
    color: colors.colorPrimaryDark,
    icon: 'shield',
    description:
      'Permissions cover areas where the app wants data or resources that involve the users private information, or could potentially affect the users stored data.',
    videoUrl: 'url',
    settingsDetails: {}
  },
  integrations: {
    text: 'integrations',
    color: colors.colorCoreYellow,
    icon: 'puzzle',
    description:
      'All your tools in one connected shared team inbox. Integrations help your team get more done in erxes.',
    videoUrl: 'url',
    settingsDetails: {
      brandCreate: {
        name: 'Manage brands',
        url: '/settings/brands'
      },
      channelCreate: {
        name: 'Manage channels',
        url: '/settings/channels'
      }
    }
  },
  insights: {
    text: 'Insights',
    description:
      "You'll have a full view of reports, which include the number of visits, performance report of your customers' relations employee, sales updates, conversion rate, product report, etc.",
    color: '#7b48ff',
    icon: 'bar-chart',
    videoUrl: 'url',
    settingsDetails: {}
  },
  importHistories: {
    text: 'Import/Export',
    color: colors.colorCoreRed,
    icon: 'download-3',
    description:
      'Import contains the lists of customer & company data and product information by the dates inserted to the platform and also will allow you to delete them one by one',
    videoUrl: 'url',
    settingsDetails: {}
  }
};
