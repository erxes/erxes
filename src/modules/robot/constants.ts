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
      growthHackBoardsCreate: {
        name: 'Create a marketing campaign',
        url: '/settings/boards/growthHack'
      },
      growthHackPipelinesCreate: {
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
      },
      responseTemplateCreate: {
        name: 'Add a response template',
        url: '/settings/response-templates'
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
      dealBoardsCreate: {
        name: 'Create a sales board',
        url: '/settings/boards/deal'
      },
      dealPipelinesCreate: {
        name: 'Create a sales pipeline',
        url: '/settings/boards/deal'
      },
      dealCreate: {
        name: 'Now add deals',
        url: '/deal/board'
      },
      'configure.dealCurrency': {
        name: 'Configure currencies',
        url: '/settings/general'
      },
      'configure.dealUOM': {
        name: 'Configure unit of measurement',
        url: '/settings/general'
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
    settingsDetails: {
      leadIntegrationCreate: {
        name: 'Create pop ups',
        url: '/leads/create'
      },
      leadIntegrationInstalled: {
        name: 'Install on website',
        url: '/leads/create'
      }
    }
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
        name: 'Create email tag',
        url: '/tags/engageMessage'
      },
      engageCreate: {
        name: 'Now create manual email newsletter',
        url: '/engage/messages/create?kind=manual'
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
      taskBoardsCreate: {
        name: 'Create a task board',
        url: '/settings/boards/task'
      },
      taskPipelinesCreate: {
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
      ticketBoardsCreate: {
        name: 'Create a ticket board',
        url: '/settings/boards/ticket'
      },
      ticketPipelinesCreate: {
        name: 'Create a ticket pipeline',
        url: '/settings/boards/ticket'
      },
      ticketCreate: {
        name: 'Now add tickets',
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
    settingsDetails: {
      customerCreate: {
        name: 'Create a contact',
        url: '/contacts/customers/all'
      },
      companyCreate: {
        name: 'Create a company',
        url: '/contacts/companies'
      },
      productCreate: {
        name: 'Create a product or service',
        url: '/settings/product-service'
      }
    }
  },
  segments: {
    text: 'Segments',
    color: colors.colorSecondary,
    icon: 'pie-chart',
    description:
      'Segment is a customer data management and analytics solution that helps you make sense of customer and company data coming from multiple various sources.',
    videoUrl: 'url',
    settingsDetails: {
      customerSegmentCreate: {
        name: 'Create a customer segment',
        url: '/segments/new/customer'
      },
      companySegmentCreate: {
        name: 'Create a company segment',
        url: '/segments/new/company'
      }
    }
  },
  tags: {
    text: 'Tags',
    color: '#89472e',
    icon: 'tag',
    description:
      'Tag means to categorize things into one abstract group. In other words, organizations can create and classify their own abstract categories.',
    videoUrl: 'url',
    settingsDetails: {
      customerTagCreate: {
        name: 'Create a customer tag',
        url: '/tags/customer'
      },
      companyTagCreate: {
        name: 'Create a company tag',
        url: '/tags/company'
      }
    }
  },
  properties: {
    text: 'Properties',
    color: colors.colorCoreGray,
    icon: 'folder-1',
    description:
      'You may need additional properties to gather information from customers, companies, and products/services.',
    videoUrl: 'url',
    settingsDetails: {
      customerFieldCreate: {
        name: 'Create a custom customer properties',
        url: '/settings/properties?type=customer'
      },
      companyFieldCreate: {
        name: 'Create a custom company properties',
        url: '/settings/properties?type=company'
      }
    }
  },
  permissions: {
    text: 'Permissions',
    color: colors.colorPrimaryDark,
    icon: 'shield',
    description:
      'Permissions cover areas where the app wants data or resources that involve the users private information, or could potentially affect the users stored data.',
    videoUrl: 'url',
    settingsDetails: {
      permissionCreate: {
        name: 'Manage permission',
        url: '/settings/permissions'
      }
    }
  },
  integrations: {
    text: 'integrations',
    color: colors.colorCoreYellow,
    icon: 'puzzle',
    description:
      'All your tools in one connected shared team inbox. Integrations help your team get more done in erxes.',
    videoUrl: 'url',
    settingsDetails: {
      messengerIntegrationCreate: {
        name: 'Create your Messenger',
        url: '/settings/integrations/createMessenger'
      },
      facebookIntegrationCreate: {
        name: 'Connect your Facebook messenger',
        url: '/settings/integrations'
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
    settingsDetails: {
      showInsights: {
        name: 'Check out team inbox insight',
        url: '/inbox/insights'
      }
    }
  },
  importHistories: {
    text: 'Import/Export',
    color: colors.colorCoreRed,
    icon: 'download-3',
    description:
      'Import contains the lists of customer & company data and product information by the dates inserted to the platform and also will allow you to delete them one by one',
    videoUrl: 'url',
    settingsDetails: {
      'customer_template.xlsxDownload': {
        name: 'Download customer import template',
        url: '/settings/importHistories?type=customer'
      },
      'company_template.xlsxDownload': {
        name: 'Download company import template',
        url: '/settings/importHistories?type=company'
      }
    }
  }
};
