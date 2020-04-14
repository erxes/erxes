import colors from 'modules/common/styles/colors';

export const FEATURE_DETAILS = {
  growthHacks: {
    text: 'Growth hacking',
    icon: 'idea',
    color: '#f7802e',
    description:
      'From ideas to actual performance, making sure everything recorded, prioritized and centralized in the single platform to get tested with pool of analysis and learnings, which made the growing as pleasure.',
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      growthHackBoardsCreate: {
        name: 'Create a marketing campaign',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      growthHackPipelinesCreate: {
        name: 'Then create a project',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },
      growthHackCreate: {
        name: 'Now add an experiments',
        url: '/growthHack/board'
      }
    }
  },
  deals: {
    text: 'Configure Sales pipeline',
    color: '#379ecb',
    icon: 'piggy-bank',
    description:
      'Control your sales pipeline from one responsive field by precisely analyzing your progress and determining your next best move for success.',
    videoUrl: 'https://www.youtube.com/embed/jEkxpLdOMvU?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/jEkxpLdOMvU/mqdefault.jpg',
    settingsDetails: {
      dealBoardsCreate: {
        name: 'Create a sales board',
        url: '/settings/boards/deal#showBoardModal=true'
      },
      dealPipelinesCreate: {
        name: 'Create a sales pipeline',
        url: '/settings/boards/deal#showPipelineModal=true'
      },
      'configure.dealCurrency': {
        name: 'Configure currencies',
        url: '/settings/general'
      },
      'configure.dealUOM': {
        name: 'Configure unit of measurement',
        url: '/settings/general'
      },
      dealCreate: {
        name: 'Now add deals',
        url: '/deal/board'
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
        url: '/settings/brands#showBrandAddModal=true'
      },
      channelCreate: {
        name: 'Create a channel',
        url: '/settings/channels#showChannelAddModal=true'
      },
      messengerIntegrationCreate: {
        name: 'Then create an integration',
        url: '/settings/integrations'
      },
      responseTemplateCreate: {
        name: 'Add a response template',
        url: '/settings/response-templates#showListFormModal=true'
      },
      connectIntegrationsToChannel: {
        name: 'Connect integration to channel',
        url: '/settings/channels#showManageIntegrationModal=true'
      }
    }
  },

  leads: {
    text: 'Pop-ups & Forms',
    color: '#c84b49',
    icon: 'laptop',
    description:
      'Turn regular visitors into qualified pop ups by capturing them with a customizable landing page, forms, pop-up or embed placements.',
    videoUrl: 'https://www.youtube.com/embed/P2muPQVTTD8?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/P2muPQVTTD8/mqdefault.jpg',
    settingsDetails: {
      leadIntegrationCreate: {
        name: 'Create pop ups',
        url: '/leads/create'
      },
      leadIntegrationInstalled: {
        name: 'Install on website',
        url: '/leads'
      }
    }
  },
  engages: {
    text: 'Email & SMS Marketing',
    color: '#e359ae',
    icon: 'megaphone',
    videoUrl: 'https://www.youtube.com/embed/hd07s0oZ83A?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/hd07s0oZ83A/mqdefault.jpg',
    description:
      'Start converting your prospects into potential customers through email, SMS, messenger or more interactions to drive them to a successful close.',
    settingsDetails: {
      emailTemplateCreate: {
        name: 'Create email template',
        url: '/settings/email-templates#showListFormModal=true'
      },
      tagCreate: {
        name: 'Create email tag',
        url: '/tags/engageMessage#showTagengageMessageModal=true'
      },
      engageCreate: {
        name: 'Now create manual email newsletter',
        url: '/engage/messages/create?kind=manual'
      }
    }
  },
  tasks: {
    text: 'Task Management',
    color: colors.colorCoreTeal,
    icon: 'clipboard',
    description:
      "Organize your own tasks or your team's sprints effectively with erxes Task. It involves planning, testing, tracking, and reporting.",
    videoUrl: 'https://www.youtube.com/embed/WgMSf_aETdI?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/WgMSf_aETdI/mqdefault.jpg',
    settingsDetails: {
      taskBoardsCreate: {
        name: 'Create a task board',
        url: '/settings/boards/task#showBoardModal=true'
      },
      taskPipelinesCreate: {
        name: 'Create a task pipeline',
        url: '/settings/boards/task#showPipelineModal=true'
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
        url: '/settings/boards/ticket#showBoardModal=true'
      },
      ticketPipelinesCreate: {
        name: 'Create a ticket pipeline',
        url: '/settings/boards/ticket#showPipelineModal=true'
      },
      ticketCreate: {
        name: 'Now add tickets',
        url: '/inbox/ticket/board'
      }
    }
  },
  knowledgeBase: {
    text: 'Set Up Knowledge base',
    icon: 'book',
    color: '#45b94c',
    description:
      'Educate both your customers and staff by creating a help center related to your brands, products and services to reach a higher level of satisfaction.',
    videoUrl: 'url',
    settingsDetails: {
      knowledgeBaseTopicCreate: {
        name: 'Create topic',
        url: '/knowledgebase#showKBAddModal=true'
      },
      knowledgeBaseCategoryCreate: {
        name: 'Create category',
        url: '/knowledgebase#showKBAddCategoryModal=true'
      },
      knowledgeBaseArticleCreate: {
        name: 'Now write articles',
        url: '/knowledgebase#showKBAddArticleModal=true'
      }
    }
  },
  customers: {
    text: 'Manage Your Contacts',
    icon: 'users',
    color: colors.colorCoreBlue,
    description:
      'Access our all-in-one CRM & product, and service system in one go so that it’s easier to coordinate and manage your interactions with your customers.',
    videoUrl: 'https://www.youtube.com/embed/Axazk8K30Qk?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Axazk8K30Qk/mqdefault.jpg',
    settingsDetails: {
      customerCreate: {
        name: 'Create a contact',
        url: '/contacts/customer#showCustomerModal=true'
      },
      companyCreate: {
        name: 'Create a company',
        url: '/companies#showCompanyModal=true'
      },
      productCreate: {
        name: 'Create a product or service',
        url: '/settings/product-service#showProductModal=true'
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
        url: '/tags/customer#showTagcustomerModal=true'
      },
      companyTagCreate: {
        name: 'Create a company tag',
        url: '/tags/company#showTagcompanyModal=true'
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
        url: '/settings/properties?type=customer#showPropertycustomerModal=true'
      },
      companyFieldCreate: {
        name: 'Create a custom company properties',
        url: '/settings/properties?type=company#showPropertycompanyModal=true'
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
    text: 'Live Chat & In-App-Messaging',
    color: colors.colorCoreYellow,
    icon: 'puzzle',
    description:
      'Enable businesses to capture every single customer feedback and communicate in real time. You can educate your customers through knowledge-base from the erxes Messenger.',
    videoUrl: 'url',
    settingsDetails: {
      messengerIntegrationCreate: {
        name: 'Create your Messenger',
        url: '/settings/integrations/createMessenger'
      },
      facebookIntegrationCreate: {
        name: 'Connect your Facebook messenger',
        url: '/settings/integrations#showFacebookMessengerModal=true'
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

export const FEATURES = [
  {
    name: 'Scale your business with Growth Hacking',
    key: 'growthHacks'
  },
  {
    name: 'Drive leads* to a successful close with Sales Pipeline*',
    key: 'deals'
  },
  {
    name: 'Stay in sync with Shared Team Inbox',
    key: 'inbox'
  },
  {
    name: 'Increase conversion with Email & SMS Marketing',
    key: 'engages'
  },
  {
    name: 'Manage your customers from the Contact Management',
    key: 'customers'
  },
  {
    name: 'Connect with your customers with Live Chat & In-App-Messaging',
    key: 'integrations'
  },
  {
    name: 'Never miss a potential lead with Pop-ups & Forms',
    key: 'leads'
  },

  {
    name: 'Educate both your customers and staff with Knowledge Base',
    key: 'knowledgeBase'
  },
  {
    name: 'Power your team’s success with Task Management ',
    key: 'tasks'
  }
];

export const www = [
  {
    name: 'Sales',
    features: ['deals', 'segments', 'customers']
  },
  {
    name: 'Customer Support',
    features: ['inbox', 'tickets', 'knowledgeBase']
  },
  {
    name: 'Management',
    features: [
      'tasks',
      'permissions',
      'properties',
      'tags',
      'integrations',
      'insights',
      'importHistories'
    ]
  },
  {
    name: 'General',
    features: ['inbox', 'permissions', 'tags', 'integrations']
  }
];
