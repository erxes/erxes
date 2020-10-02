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
      growthHackTemplatesDuplicate: {
        name: 'Duplicate growth hacking templates',
        url: '/settings/boards/growthHackTemplate'
      },
      growthHackCreate: {
        name: 'Now add an experiments',
        url: '/growthHack/board'
      }
    }
  },
  deals: {
    text: 'Sales pipeline',
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
      productCreate: {
        name: 'Configure product & service',
        url: '/settings/product-service#showProductModal=true'
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
        url: '/settings/integrations/createMessenger'
      },
      connectIntegrationsToChannel: {
        name: 'Connect integration to channel',
        url: '/settings/channels#showManageIntegrationModal=true'
      },
      responseTemplateCreate: {
        name: 'Add a response template',
        url: '/settings/response-templates#showListFormModal=true'
      }
    }
  },
  contacts: {
    text: 'Contact Management',
    icon: 'users',
    color: colors.colorCoreBlue,
    description:
      'Access our all-in-one CRM & product, and service system in one go so that it’s easier to coordinate and manage your interactions with your customers.',
    videoUrl: 'https://www.youtube.com/embed/Axazk8K30Qk?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Axazk8K30Qk/mqdefault.jpg',
    settingsDetails: {
      leadCreate: {
        name: 'Create a lead',
        url: '/contacts/lead#showCustomerModal=true'
      },
      customerCreate: {
        name: 'Create a customer',
        url: '/contacts/customer#showCustomerModal=true'
      },
      companyCreate: {
        name: 'Create a company',
        url: '/companies#showCompanyModal=true'
      },
      productCreate: {
        name: 'Create a product or service',
        url: '/settings/product-service#showProductModal=true'
      },
      fieldCreate: {
        name: 'Create a property',
        url: '/settings/properties?type=customer'
      },
      tagCreate: {
        name: 'Create a tag',
        url: '/tags/customer#showTagCustomerModal=true'
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
      brandCreate: {
        name: 'Create a brand',
        url: '/settings/brands#showBrandAddModal=true'
      },
      messengerIntegrationCreate: {
        name: 'Create your Messenger',
        url: '/settings/integrations/createMessenger'
      },
      connectIntegrationsToChannel: {
        name: 'Connect integration to channel',
        url: '/settings/channels#showManageIntegrationModal=true'
      },
      messengerIntegrationInstalled: {
        name: 'Install messenger code',
        url: '#'
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
      brandCreate: {
        name: 'Create a brand',
        url: '/settings/brands#showBrandAddModal=true'
      },
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
      engageVerifyEmail: {
        name: 'Verify your sending email',
        url: '/settings/engage-configs'
      },
      engageSendTestEmail: {
        name: 'Send test email',
        url: '/settings/engage-configs'
      },
      emailTemplateCreate: {
        name: 'Configure email template',
        url: '/settings/email-templates#showListFormModal=true'
      },
      segmentCreate: {
        name: 'Create segment',
        url: '/segments/new/customer'
      },
      engageCreate: {
        name: 'Now create manual message',
        url: '/engage/messages/create?kind=manual'
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
      brandCreate: {
        name: 'Create a brand',
        url: '/settings/brands#showBrandAddModal=true'
      },
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
      },
      knowledgeBaseInstalled: {
        name: 'Embed knowledgebase',
        url: '#'
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
      },
      taskAssignUser: {
        name: 'Assign a team member',
        url: '#'
      }
    }
  }
};

export const FEATURES = [
  {
    name: '<b id="first-feature">Scale your business</b> with Growth Hacking',
    key: 'growthHacks'
  },
  {
    name:
      '<b id="second-feature">Drive leads to a successful close</b> with Sales Pipeline',
    key: 'deals'
  },
  {
    name: '<b>Stay in sync</b> with Shared Team Inbox',
    key: 'inbox'
  },
  {
    name: '<b>Increase conversion</b> with Email & SMS Marketing',
    key: 'engages'
  },
  {
    name: '<b>Manage your customers</b> from the Contact Management',
    key: 'contacts'
  },
  {
    name:
      '<b>Connect with your customers</b> with Live Chat & In-App-Messaging',
    key: 'integrations'
  },
  {
    name: '<b>Never miss a potential lead</b> with Pop-ups & Forms',
    key: 'leads'
  },

  {
    name: '<b>Educate both your customers and staff</b> with Knowledge Base',
    key: 'knowledgeBase'
  },
  {
    name: '<b>Power your team’s success</b> with Task Management',
    key: 'tasks'
  }
];
