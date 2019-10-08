import colors from 'modules/common/styles/colors';

export const FEATURE_DETAILS = {
  inbox: {
    text: 'Team Inbox',
    description:
      'Shared inbox for teams. Combine real-time client and team communication with in-app messaging, live chat, email and form, so your customers can reach you however and whenever they want.',
    videoUrl: 'url',
    settingsDetails: {
      brandCreate: {
        name: 'Manage brands',
        url: '/settings/brands'
      },
      channelCreate: {
        name: 'Manage channels',
        url: '/settings/channels'
      },
      integrationCreate: {
        name: 'Manage integrations',
        url: '/settings/integrations'
      }
    }
  },
  customers: {
    text: 'Contact',
    icon: 'users',
    color: colors.colorCoreBlue,
    description:
      'All-in-one CRM. Access our all-in-one CRM system in one go so that it’s easier to coordinate and manage your interactions with your customers.',
    videoUrl: 'url',
    settingsDetails: {}
  },
  deals: {
    text: 'Deals',
    color: '#379ecb',
    icon: 'piggy-bank',
    description:
      'Easy and clear sales funnels allow you to control your sales pipeline from one responsive field by precisely analyzing your progress and determining your next best move for success.',
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
  tickets: {
    text: 'Tickets',
    description: 'Ticket',
    videoUrl: 'url',
    settingsDetails: {
      boardCreate: {
        name: 'Create board',
        url: '/settings/boards/ticket'
      },
      pipelineCreate: {
        name: 'Create pipeline',
        url: '/settings/boards/ticket'
      },
      ticketCreate: {
        name: 'Create ticket',
        url: '/inbox/ticket/board'
      }
    }
  },
  tasks: {
    text: 'Tasks',
    color: colors.colorCoreTeal,
    icon: 'clipboard',
    description:
      "Organize your own tasks or your team's sprints effectively with erxes Task. It involves planning, testing, tracking, and reporting.",
    videoUrl: 'url',
    settingsDetails: {
      boardCreate: {
        name: 'Create board',
        url: '/settings/boards/task'
      },
      pipelineCreate: {
        name: 'Create pipeline',
        url: '/settings/boards/task'
      },
      taskCreate: {
        name: 'Create task',
        url: '/task/board'
      }
    }
  },
  growthHacks: {
    text: 'Growth Hacks',
    icon: 'idea',
    color: '#f7802e',
    description:
      'Manage your entire growth operation. From the ideation and prioritization of hypothesis up to testing and analysis of your learnings, everything centralized, unified and stored under the same workspace, built and designed for growth!',
    videoUrl: 'url',
    settingsDetails: {
      boardCreate: {
        name: 'Create board',
        url: '/settings/boards/growthHack'
      },
      pipelineCreate: {
        name: 'Create pipeline',
        url: '/settings/boards/growthHack'
      },
      growthHackCreate: {
        name: 'Create growthHack',
        url: '/growthHack/board'
      }
    }
  },
  engages: {
    text: 'Engages',
    color: '#e359ae',
    icon: 'megaphone',
    description:
      'Turn leads into loyal customers. Start converting your prospects into potential customers through email, SMS, messenger or more interactions to drive them to a successful close.',
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
  leads: {
    text: 'Leads',
    color: '#c84b49',
    icon: 'laptop',
    description:
      'Convert visitors into qualified leads. Turn regular visitors into qualified leads by capturing them with a customizable landing page, forms, pop-up or embed placements.',
    videoUrl: 'url',
    settingsDetails: {}
  },
  knowledgeBase: {
    text: 'Knowledge base',
    icon: 'book',
    color: '#45b94c',
    description:
      'Real-time & two-way help center. Educate both your customers and staff by creating a help center related to your brands, products and services to reach higher level of satisfactions',
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
        name: 'Create article',
        url: '/knowledgebase'
      }
    }
  },
  tags: {
    text: 'Tags',
    color: '#89472e',
    icon: 'tag',
    description:
      'Tag means to categorize things into one abstract group. In other words, organizations can create and classify their own abstract categories. It can also classify every messages that is not restricted to clients.',
    videoUrl: 'url',
    settingsDetails: {}
  },
  insights: {
    text: 'Insights',
    description:
      'You can find stats that defines the average response time by each team member.',
    color: '#7b48ff',
    icon: 'bar-chart',
    videoUrl: 'url',
    settingsDetails: {}
  },
  importHistories: {
    text: 'Import Histories',
    color: colors.colorCoreRed,
    icon: 'download-3',
    description: 'importHistories',
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
  properties: {
    text: 'Properties',
    color: colors.colorCoreGray,
    icon: 'folder-1',
    description:
      "You may need additional properties to gather information for your business's marketing, sales, and support processes. You can have up to unlimited properties per contacts or products.",
    videoUrl: 'url',
    settingsDetails: {}
  },
  permissions: {
    text: 'Permissions',
    color: colors.colorPrimaryDark,
    icon: 'shield',
    description:
      'All-in-one CRM. Access our all-in-one CRM system in one go so that it’s easier to coordinate and manage your interactions with your customers.',
    videoUrl: 'url',
    settingsDetails: {}
  },
  integrations: {
    text: 'integrations',
    color: colors.colorCoreYellow,
    icon: 'puzzle',
    description:
      'Publish an integration app on the erxes App Store among powerful tools like Gmail, Facebook page, Messenger, Twitter and Google Meet.',
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
  }
};
