import colors from 'modules/common/styles/colors';

export const PLACEHOLDER = 'Choose one';

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
      'Turn regular visitors into qualified forms by capturing them with a customizable landing page, forms, pop-up or embed placements.',
    videoUrl: 'https://www.youtube.com/embed/P2muPQVTTD8?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/P2muPQVTTD8/mqdefault.jpg',
    settingsDetails: {
      brandCreate: {
        name: 'Create a brand',
        url: '/settings/brands#showBrandAddModal=true'
      },
      leadIntegrationCreate: {
        name: 'Create forms',
        url: '/forms/create'
      },
      leadIntegrationInstalled: {
        name: 'Install on website',
        url: '/forms'
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
        url: '/settings/campaign-configs'
      },
      engageSendTestEmail: {
        name: 'Send test email',
        url: '/settings/campaign-configs'
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

export const ROLE_VALUE = [
  { _id: 'one', name: "I've never used CAM or business ... before." },
  { _id: 'two', name: "I'm ... to erxes but I've used a CAM before." },
  { _id: 'three', name: 'I know my way around erxes pretty well.' }
];

export const ROLE_OPTIONS = [
  { _id: 'sales', name: 'Sales' },
  { _id: 'marketing', name: 'Marketing' },
  { _id: 'customerSupport', name: 'Customer Support' },
  { _id: 'managementAndOperations', name: 'Management and Operations' },
  { _id: 'above', name: 'All of the above' }
];

export const ROLE_SETUP = [
  {
    title: 'Options',
    key: 'options',
    content: [
      {
        name: 'Set your general settings',
        title: 'generalSettings',
        steps: '3 steps',
        types: [
          'sales',
          'marketing',
          'customerSupport',
          'managementAndOperations',
          'above'
        ]
      },
      {
        name: 'Create your brands and channels',
        title: 'channelBrands',
        steps: '2 steps',
        types: [
          'sales',
          'marketing',
          'customerSupport',
          'managementAndOperations',
          'above'
        ]
      },
      {
        name: 'Integrate other apps into erxes',
        title: 'integrationOtherApps',
        steps: '2 steps',
        types: [
          'sales',
          'marketing',
          'customerSupport',
          'managementAndOperations',
          'above'
        ]
      },
      {
        name: 'Customize your erxes database',
        title: 'customizeDatabase',
        steps: '2 steps',
        types: [
          'sales',
          'marketing',
          'customerSupport',
          'managementAndOperations',
          'above'
        ]
      }
    ]
  },
  {
    title: 'Operational',
    key: 'operational',
    content: [
      {
        name: 'Import your existing contacts',
        title: 'importExistingContacts',
        steps: '6 steps',
        types: ['sales', 'marketing']
      },
      {
        name: 'Customize your Sales Pipeline',
        title: 'salesPipeline',
        steps: '3 steps',
        types: ['sales', 'above']
      },
      {
        name: 'Invite your team members',
        title: 'inviteTeamMembers',
        steps: '2 steps',
        types: [
          'sales',
          'marketing',
          'customerSupport',
          'managementAndOperations',
          'above'
        ]
      },
      {
        name: 'Add your product and services',
        title: 'createProductServices',
        steps: '2 steps',
        types: ['sales', 'above']
      },
      {
        name: 'Install erxes widgets',
        title: '',
        steps: '3 steps',
        types: ['sales', 'marketing', 'customerSupport', 'above']
      },
      {
        name: 'Create your lead generation Forms',
        title: '',
        steps: '4 steps',
        types: ['marketing']
      },
      {
        name: 'Create your Knowledge Base',
        title: '',
        steps: '5 steps',
        types: ['customerSupport', 'managementAndOperations']
      },
      {
        name: 'Plan your content with Tasks',
        title: '',
        steps: '6 steps',
        types: ['marketing']
      },
      {
        name: 'Customize your Tickets',
        title: 'customizeTickets',
        steps: '3 steps',
        types: ['customerSupport', 'managementAndOperations', 'above']
      },
      {
        name: 'Customize your Tasks',
        title: 'customizeTasks',
        steps: '3 steps',
        types: ['customerSupport', 'managementAndOperations', 'above']
      },
      {
        name: 'Import your existing customer data to erxes',
        title: '',
        steps: '7 steps',
        types: ['above']
      },
      {
        name: 'Create your Forms',
        title: '',
        steps: '7 steps',
        types: ['above']
      },
      {
        name: 'Customize your Knowledge Base',
        title: 'customizeKnowledgeBase',
        steps: '3 steps',
        types: ['above']
      }
    ]
  },
  {
    title: 'On-going',
    key: 'on-going',
    content: [
      {
        name: 'Segment your contacts',
        title: '',
        steps: '1 steps',
        types: ['sales', 'marketing', 'above']
      },
      {
        name: 'Prepare content templates',
        title: '',
        steps: '2 steps',
        types: ['sales', 'customerSupport', 'managementAndOperations', 'above']
      },
      {
        name: 'Automate your sales with Campaigns',
        title: 'automateCampaigns',
        steps: '4 steps',
        types: ['sales']
      },
      {
        name: 'Customize your Reports',
        title: '',
        steps: '4 steps',
        types: [
          'sales',
          'marketing',
          'customerSupport',
          'managementAndOperations',
          'above'
        ]
      },
      {
        name: 'Customize your Growth Hacking',
        title: 'customizeGrowthHacking',
        steps: '5 steps',
        types: ['marketing', 'above']
      },
      {
        name: 'Customize your customer segmentation',
        title: 'customizeSegmentation',
        steps: '6 steps',
        types: ['marketing']
      },
      {
        name: 'Prepare the email/response templates',
        title: 'prepareMailResponseTemplates',
        steps: '7 steps',
        types: ['marketing']
      },
      {
        name: 'Automate your lead generation with Campaigns',
        title: 'automateCampaigns',
        steps: '4 steps',
        types: ['marketing']
      },
      {
        name: 'Automate your customer support process',
        title: '',
        steps: '9 steps',
        types: ['customerSupport']
      },
      {
        name: 'Automate your operational process',
        title: '',
        steps: '10 steps',
        types: ['managementAndOperations']
      },
      {
        name: 'Automate with Campaigns',
        title: 'automateCampaigns',
        steps: '4 steps',
        types: ['above']
      }
    ]
  }
];

export const ROLE_SETUP_DETAILS = {
  generalSettings: {
    text: 'Set your general settings',
    description:
      'Setting your general configuration adjusts the basic fundamental features on our platform.',
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Set your general setting',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name: 'Set the types of file you would like to upload',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },
      step3: {
        name: 'Set your constants',
        url: '/settings/boards/growthHackTemplate'
      }
    }
  },
  channelBrands: {
    text: 'Brand & channel set up',
    description:
      'Creating brands and channels allows you can organize and view all messages and emails sent from customers under one platform. Customizing the incoming communication channels is the foundation of all your effective operational process.  ',
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Create brands',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name: 'Create channels',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  },
  integrationOtherApps: {
    text: 'Integration/ App Store',
    description:
      'You can bring all inboxes to one window and manage your interactions with your customers. The shared Team Inbox keeps all history of your engagements. It also provides tags and filter tools to help you work more productively.',
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Choose which integrations you would like to add',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name:
          'Follow the instructions as shown to successfully integrate communication channels',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  },
  customizeDatabase: {
    text: 'Properties',
    description:
      'Adjust customer data settings, add properties for customer information, etc. for your     customer database.',
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Adjust the existing fields',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name:
          'Add new groups and fields if the fields you require are not there',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  },
  importExistingContacts: {
    text: 'Import',
    description:
      'You will be able to import large files and export data from our system.',
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Add groups',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name: 'Add properties',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },
      step3: {
        name: 'Prepare files to be imported on excel',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },
      step4: {
        name: 'Download a template',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },
      step5: {
        name: 'Enter your data in the template',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },
      step6: {
        name: 'Import the file',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  },
  inviteTeamMembers: {
    text: 'Team members/ Permission',
    description:
      'Invite your team members into your organization to manage all internal and external activities in one location.',
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Add your team member(s)',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name: "Enter your team member's information",
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  },
  salesPipeline: {
    text: 'Sales stage',
    description:
      'Create sales stages to track your entire sales pipeline from one dashboard. Erxes also provides a field where you can add notes, tags, checklist dealine and all other useful tools to lead you successful sales.',
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Create a board',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name: 'Create a pipeline to be used on your board',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },
      step3: {
        name: 'Customize the stages in your pipeline',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  },
  createProductServices: {
    text: 'Product & service',
    description:
      'Add and categorize your products and services to our system. Storing them all in one place is a great way to stay organized.',
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Add a category',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name: 'Add a product & service into the category',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  },
  customizeTickets: {
    text: 'Ticket stage',
    description:
      "Customizing your ticket stages will help your team members with the process of receiving, maintaining, and resolving complaints from the organization's customers.",
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Create a board',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name: 'Create a pipeline to be used on your board',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },
      step3: {
        name: 'Customize the stages in your pipeline',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  },
  customizeTasks: {
    text: 'Task stage',
    description:
      "Customizing your ticket stages will help you manage and keep track of the organization's internal operations and activities. You can save time, manage your projects, monitor your team and increase your productivity in just a few clicks. ",
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Create a board',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name: 'Create a pipeline to be used on your board',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },
      step3: {
        name: 'Customize the stages in your pipeline',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  },
  customizeGrowthHacking: {
    text: 'Growth hacking stage',
    description:
      "Evaluate the percentage of success on every idea by dividing them into categories. This enables you to more effectively predict an experiment's impact.",
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Create a growth hacking template',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name: 'Customize the stages in your template',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  },
  customizeSegmentation: {
    text: 'Contact',
    description:
      'A segment is smaller group of your contacts defined by rules or filters that you set. This can be used for target marketing.',
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Famliarize yourself with the existing segments ',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name: 'Create a segment',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },
      step3: {
        name: 'Create a subsegment within the previous segment',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  },
  prepareMailResponseTemplates: {
    text: 'Email/response template',
    description:
      'You can save a lot of time by preparing email/response templates, all you need to do is automate your entire operation with prepared scripts. ',
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Create a response template',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name: 'Create an email template',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  },
  automateCampaigns: {
    text: 'Campaigns',
    description:
      'Create campaigns that automatically deliver information to customers based on segments and labels. Start converting your prospects into potential customers through email, SMS, Live chat, and In-app-messaging or more interactions to drive them to a successful close. You can make manual and visitor auto campaigns as well.',
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Create a campaign',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name: 'Choose a channel',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },
      step3: {
        name: 'Choose the recipients of the campaign',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },
      step4: {
        name: 'Compose your campaign',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  },
  customizeKnowledgeBase: {
    text: 'Khowledge Base',
    description:
      'Educate both your customers and staff by creating a help center related to your brands, products and services to reach higher level of satisfactions.',
    videoUrl: 'https://www.youtube.com/embed/Z5KI5YuvZ7U?autoplay=1',
    videoThumb: 'https://img.youtube.com/vi/Z5KI5YuvZ7U/mqdefault.jpg',
    settingsDetails: {
      step1: {
        name: 'Add and edit the appearance of your knowledge base',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },
      step2: {
        name: 'Add categories in the knowledge base',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },
      step3: {
        name: 'Add an article within the knowledge base',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      }
    }
  }
};
