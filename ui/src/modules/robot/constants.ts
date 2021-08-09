export const TOOLTIP = 'Your responsive will determine your onboarindg guides';

export const PLACEHOLDER = 'Choose one';

export const ROLE_VALUE = [
  { _id: 'answerOne', name: 'I’ve never used a CRM or business tools before' },
  { _id: 'answerTwo', name: 'I’m new to erxes, but I have used a CRM before' },
  { _id: 'answerThree', name: 'I know my way around erxes well' }
];

export const ROLE_OPTIONS = [
  { _id: 'sales', name: 'Sales' },
  { _id: 'marketing', name: 'Marketing' },
  { _id: 'customerSupport', name: 'Customer support' },
  { _id: 'managementAndOperations', name: 'Management and Operations' },
  { _id: 'above', name: 'All of the above' }
];

export const ROLE_SETUP = [
  {
    title: 'Setup',
    key: 'setup',
    content: [
      {
        name: 'Set your general settings',
        title: 'generalSettings',
        steps: 3,
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
        steps: 2,
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
        steps: 2,
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
        steps: 2,
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
        steps: 4,
        types: ['sales', 'marketing']
      },
      {
        name: 'Customize your Sales Pipeline',
        title: 'salesPipeline',
        steps: 3,
        types: ['sales', 'above']
      },
      {
        name: 'Invite your team members',
        title: 'inviteTeamMembers',
        steps: 3,
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
        steps: 2,
        types: ['sales', 'above']
      },
      {
        name: 'Install erxes widgets',
        title: 'installErxesWidgets',
        steps: 1,
        types: ['sales', 'marketing', 'customerSupport', 'above']
      },
      {
        name: 'Create your lead generation Forms',
        title: 'createLeadGenerationForm',
        steps: 2,
        types: ['marketing']
      },
      {
        name: 'Create your Knowledge Base',
        title: 'customizeKnowledgeBase',
        steps: 4,
        types: ['customerSupport', 'managementAndOperations']
      },
      {
        name: 'Plan your content with Tasks',
        title: 'customizeTickets',
        steps: 3,
        types: ['marketing']
      },
      {
        name: 'Customize your Tickets',
        title: 'customizeTickets',
        steps: 3,
        types: ['customerSupport', 'managementAndOperations', 'above']
      },
      {
        name: 'Customize your Tasks',
        title: 'customizeTasks',
        steps: 3,
        types: ['customerSupport', 'managementAndOperations', 'above']
      },
      {
        name: 'Import your existing customer data to erxes',
        title: 'importExistingContacts',
        steps: 4,
        types: ['above']
      },
      {
        name: 'Create your Forms',
        title: 'createLeadGenerationForm',
        steps: 2,
        types: ['above']
      },
      {
        name: 'Customize your Knowledge Base',
        title: 'customizeKnowledgeBase',
        steps: 4,
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
        title: 'customizeSegmentation',
        steps: 2,
        types: ['sales', 'marketing', 'above']
      },

      {
        name: 'Prepare content templates',
        title: 'prepareContentTemplates',
        steps: 3,
        types: ['sales', 'customerSupport', 'managementAndOperations', 'above']
      },

      {
        name: 'Automate your sales with Campaigns',
        title: 'automateCampaigns',
        steps: 3,
        types: ['sales']
      },
      {
        name: 'Customize your Reports',
        title: 'customizeReports',
        steps: 2,
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
        steps: 4,
        types: ['marketing', 'above']
      },
      {
        name: 'Customize your customer segmentation',
        title: 'customizeSegmentation',
        steps: 2,
        types: ['marketing']
      },
      {
        name: 'Prepare the email/response templates',
        title: 'prepareMailResponseTemplates',
        steps: 2,
        types: ['marketing']
      },
      {
        name: 'Automate your lead generation with Campaigns',
        title: 'automateCampaigns',
        steps: 3,
        types: ['marketing']
      },
      {
        name: 'Automate your customer support process',
        title: '',
        steps: 9,
        types: ['customerSupport']
      },
      {
        name: 'Automate your operational process',
        title: '',
        steps: 0,
        types: ['managementAndOperations']
      },
      {
        name: 'Automate with Campaigns',
        title: 'automateCampaigns',
        steps: 3,
        types: ['above']
      }
    ]
  }
];

export const ROLE_SETUP_DETAILS = {
  generalSettings: {
    text: 'Set your general settings',
    description:
      'Setting your general configuration adjusts the basic fundamental features on our platform',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      generalSettingsCreate: {
        name: 'Set your general setting',
        url: '/settings/general'
      },
      generalSettingsUploadCreate: {
        name: 'Set the types of file you would like to upload',
        url: '/settings/general/'
      },
      generelSettingsConstantsCreate: {
        name: 'Set your constants',
        url: '/settings/general/'
      }
    }
  },
  channelBrands: {
    text: 'Brand & Channel Set Up',
    description:
      'Creating brands and channels allows you can organize and view all messages and emails sent from customers under one platform',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      brandCreate: {
        name: 'Create brands',
        url: '/settings/brands#showBrandAddModal=true'
      },
      channelCreate: {
        name: 'Create channels',
        url: '/settings/channels#showChannelAddModal=true'
      }
    }
  },
  integrationOtherApps: {
    text: 'Integration/ App Store',
    description:
      'You can bring all inboxes to one window and manage your interactions with your customers',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      integrationsCreate: {
        name: 'Choose which integrations you would like to add',
        url: '/settings/integrations/'
      },
      connectIntegrationsToChannel: {
        name:
          'Follow the instructions as shown to successfully integrate communication channels',
        url: '/settings/channels/'
      }
    }
  },
  customizeDatabase: {
    text: 'Properties',
    description:
      'Adjust customer data settings, add properties for customer information, etc for your customer database',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      fieldGroupCreate: {
        name:
          'Add new groups and fields if the fields you require are not there',
        url: '/settings/properties/'
      },
      fieldCreate: {
        name: 'Adjust the existing fields',
        url: '/settings/properties/'
      }
    }
  },
  importExistingContacts: {
    text: 'Import',
    description:
      'You will be able to import large files and export data from our system',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      fieldGroupCreate: {
        name: 'Add groups',
        url: '/settings/properties/'
      },
      fieldCreate: {
        name: 'Add properties',
        url: '/settings/properties/'
      },
      importDownloadTemplate: {
        name: 'Download a template',
        url: '/settings/importHistories/'
      },
      importCreate: {
        name: 'Import the file',
        url: '/settings/importHistories/'
      }
    }
  },
  inviteTeamMembers: {
    text: 'Team members/ Permission',
    description:
      'Invite your team members into your organization to manage all internal and external activities in one location',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      userGroupCreate: {
        name: 'Create user group for permission',
        url: '/settings/permissions'
      },
      usersInvite: {
        name: 'Add your team member(s)',
        url: '/settings/team/'
      },
      userEdit: {
        name: "Enter your team member's information",
        url: '/settings/team/'
      }
    }
  },
  salesPipeline: {
    text: 'Sales stage',
    description:
      'Create sales stages to track your entire sales pipeline from one dashboard',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      dealBoardsCreate: {
        name: 'Create a board',
        url: '/settings/boards/deal#showBoardModal=true'
      },
      dealPipelinesCreate: {
        name: 'Create a pipeline to be used on your board',
        url: '/settings/boards/deal#showPipelineModal=true'
      },
      dealCreate: {
        name: 'Create deal',
        url: '/deal/board'
      }
    }
  },
  createProductServices: {
    text: 'Product & Service',
    description: 'Add and categorize your products and services to our system',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      productCategoryCreate: {
        name: 'Add a category',
        url: '/settings/boards/'
      },
      productCreate: {
        name: 'Add a product & service into the category',
        url: '/settings/boards/'
      }
    }
  },
  customizeTickets: {
    text: 'Ticket stage',
    description:
      "Customizing your ticket stages will help your team members with the process of receiving, maintaining, and resolving complaints from the organization's customers",
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      ticketBoardsCreate: {
        name: 'Create a board',
        url: '/settings/boards/ticket#showBoardModal=true'
      },
      ticketPipelinesCreate: {
        name: 'Create a pipeline to be used on your board',
        url: '/settings/boards/ticket#showPipelineModal=true'
      },
      ticketCreate: {
        name: 'Create ticket',
        url: '/ticket/board'
      }
    }
  },
  customizeTasks: {
    text: 'Task stage',
    description:
      "Customizing your ticket stages will help you manage and keep track of the organization's internal operations and activities",
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      taskBoardsCreate: {
        name: 'Create a board',
        url: '/settings/boards/task#showBoardModal=true'
      },
      taskPipelinesCreate: {
        name: 'Create a pipeline to be used on your board',
        url: '/settings/boards/task#showBoardModal=true'
      },
      taskCreate: {
        name: 'Create task',
        url: '/task/board'
      }
    }
  },
  customizeGrowthHacking: {
    text: 'Growth hacking stage',
    description:
      'Evaluate the percentage of success on every idea by dividing them into categories',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      growthHackBoardCreate: {
        name: 'Create marketing campaign',
        url: '/settings/boards/growthHack#showBoardModal=true'
      },

      pipelineTemplate: {
        name: 'Create a growth hacking template',
        url: '/settings/boards/growthHackTemplate'
      },

      growthHackPipelines: {
        name: 'Create marketing projects',
        url: '/settings/boards/growthHack#showPipelineModal=true'
      },

      growthHackCreate: {
        name: 'Create experiments',
        url: '/growthHack/board'
      }
    }
  },
  customizeSegmentation: {
    text: 'Contact',
    description:
      'A segment is smaller group of your contacts defined by rules or filters that you set',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      segmentCreate: {
        name: 'Create a segment',
        url: '/segments/new/customer'
      },
      subSegmentCreate: {
        name: 'Create a subsegment within the previous segment',
        url: '/segments/new/customer'
      }
    }
  },
  prepareMailResponseTemplates: {
    text: 'Email/response template',
    description:
      'You can save a lot of time by preparing email/response templates, all you need to do is automate your entire operation with prepared scripts. ',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      createResponseTemplate: {
        name: 'Create a response template',
        url: '/settings/response-templates#showListFormModal=true'
      },
      createEmailTemplate: {
        name: 'Create an email template',
        url: '/settings/email-templates#showListFormModal=true'
      }
    }
  },
  automateCampaigns: {
    text: 'Campaigns',
    description:
      'Create campaigns that automatically deliver information to customers based on segments and labels',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      engageVerifyEmail: {
        name: 'Verify your sending email',
        url: '/settings/campaign-configs'
      },
      engageSendTestEmail: {
        name: 'Send test email',
        url: '/settings/campaign-configs'
      },
      engageCreate: {
        name: 'Create a campaign',
        url: '/campaigns/create?kind=auto'
      }
    }
  },
  customizeKnowledgeBase: {
    text: 'Khowledge Base',
    description:
      'Educate both your customers and staff by creating a help center related to your brands, products and services to reach higher level of satisfactions',
    videoUrl: '',
    videoThumb: '',
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
      },
      knowledgeBaseInstalled: {
        name: 'Embed knowledge base',
        url: '#'
      }
    }
  },
  installErxesWidgets: {
    text: 'Erxes Widgets',
    description:
      "With erxes Messenger, you can have live direct chats with your customers regardless of it's placement",
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      messengerIntegrationCreate: {
        name: 'Add the erxes messenger',
        url: '/settings/integrations/createMessenger'
      }
    }
  },
  createLeadGenerationForm: {
    text: 'Form',
    description:
      "This allows you to add a form on your organization's website/business messenger to collect information from your potential leads",
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
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
  prepareContentTemplates: {
    text: 'Content template',
    description:
      'You can save a lot of time by preparing email/response templates, all you need to do is automate your entire operation with prepared scripts',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      createResponseTemplate: {
        name: 'Create a response template',
        url: '/settings/response-templates#showListFormModal=true'
      },

      createEmailTemplate: {
        name: 'Create an email template',
        url: '/settings/email-templates#showListFormModal=true'
      },

      pipelineTemplate: {
        name: 'Create a growth hacking template',
        url: '/settings/boards/growthHackTemplate'
      }
    }
  },
  customizeReports: {
    text: 'Reports',
    description:
      'Reports help you oversee the progress and effectiveness of your organization’s activities and make management decisions',
    videoUrl: '',
    videoThumb: '',
    settingsDetails: {
      dashboardCreate: {
        name: 'Create a Dashboard',
        url: '/dashboard#showDashboardAddModal=true'
      },
      dashboardItemCreate: {
        name: 'Create a chart',
        url: '/settings/boards/'
      }
    }
  }
};
