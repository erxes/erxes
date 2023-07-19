import { __ } from '@erxes/ui/src/utils';

export const EMPTY_IMPORT_CONTENT = {
  steps: [
    {
      title: 'Export your data',
      description: __(
        'Export your data from your previous software or have your data sheet (csv, xls) ready'
      )
    },
    {
      title: __('Create Custom Properties'),
      description: __(
        'If you wish to import any properties that are not available on erxes, you need to create custom properties'
      ),
      url:
        'https://www.erxes.org/user/general-settings/#how-to-setup-properties',
      isOutside: true,
      target: '_blank'
    },
    {
      title: __('Choose the data type'),
      description: `${__(
        'Make sure you’re on the right page and you’ve selected the right data type Lead, Customer, etc on the left'
      )}`,
      url: 'http://www.erxes.org/user/import#import',
      target: '_blank',
      isOutside: true
    },
    {
      title: __('Download Template'),
      description: `${__('Click on Download Template for importing')}.${__(
        'This is an important step, because your column titles need to match with erxes titles'
      )}`,
      isOutside: false
    },
    {
      title: __('Clean and prepare your data sheet'),
      description: `${__(
        'Make sure the column titles match with the Template'
      )}.${__('The order of the columns does not need to match')}`
    },
    {
      title: __('Export your data'),
      description: `${__(
        'You can export your data from the list on the left'
      )}.${__(
        'If you wish to export your popup forms, go to Customer and click on Export Popups Data'
      )}`,
      url: '/settings/importHistories',
      isOutside: false,
      urlText: 'Go to Customers',
      icon: 'export'
    }
  ]
};

export const EMPTY_SEGMENT_CONTENT = {
  title: __('Getting Started with Segments'),
  description: `${__(
    'The Segments feature helps you to filter, target, and engage a certain group of contacts'
  )}.${__('The Segments are used in the Contacts and Engage features')}`,
  urlText: __('Watch our tutorial'),
  url: '/tutorial#settingStage',
  steps: [
    {
      title: __('Create Custom Properties'),
      description: __(
        'If you wish to segment by any properties that are not available on erxes, make sure you’ve already created them'
      ),
      url: '/settings/properties?type=contacts:customer',
      urlText: 'Go to Properties'
    },
    {
      title: __('Choose the Contact Type'),
      description: __(
        'Make sure you’re on the right page and  you want to segment by from the list on the left: Visitor, Lead, Customer, Company'
      )
    }
  ]
};

export const EMPTY_NEW_SEGMENT_CONTENT = {
  title: __('Setup a new segment'),
  description: `${__('There aren’t any filters at the moment')}.${__(
    'You can create a segment by Property and/or by Events'
  )}`,
  steps: [
    {
      title: __('Create Custom Properties'),
      description: __(
        'If you wish to segment by any properties that are not available on erxes, make sure you’ve already created them'
      ),
      url: '/settings/properties?type=contacts:customer',
      urlText: __('Go to Properties')
    },
    {
      title: __('Install the Event Tracking script'),
      description:
        __(
          'If you wish to segment by events, i.e actions that are triggered by something your Customer performs on your website or app'
        ) + '.'
    },
    {
      title: __('Create your Segment'),
      description:
        'Select the property/event you want to filter by, select one of the operators and type in or select the value from the dropdown menu.'
    },
    {
      title: 'See our documentation',
      description: 'Walk through step by step instructions.',
      url: 'https://www.erxes.org/user/segments/',
      urlText: 'Go to the docs',
      target: '_blank',
      isOutside: true
    }
  ]
};

export const EMPTY_CONTENT_SCRIPT = {
  title: __('Getting Started with erxes Scripts'),
  description: __(
    `Avoid duplication of erxes widget scripts on your website, which might disable some of your erxes widgets (messenger, popups, etc)`
  ),
  steps: [
    {
      title: 'Generate the combination of scripts',
      description:
        'Click on “New Script” and choose which widgets you’re going to display in a single page'
    },
    {
      title: 'Install the script',
      description: __(
        'Copy the updated script and paste it into your website or Google Tag Manager'
      )
    }
  ]
};

export const EMPTY_CONTENT_POPUPS = {
  title: __('Getting Started with erxes forms'),
  description: __(
    'Never miss a potential lead by capturing them with a customizable Forms'
  ),
  steps: [
    {
      title: __('Create Form'),
      description: __('Fill out the details and create your form'),
      url: '/forms/create',
      urlText: 'Create Form'
    },
    {
      title: 'Install the script',
      description: __(
        'Copy the individual script or use Script Manager to avoid script duplication errors if you’re planning to display this form along with any other erxes widgets'
      ),
      url: '/settings/scripts',
      urlText: __('Go to Script Manager')
    }
  ]
};

export const EMPTY_CONTENT_FORUMS = {
  title: __('Getting Started with erxes forums'),
  description: __(
    'Never miss a potential lead by capturing them with a forums'
  ),
  steps: [
    {
      title: __('Create Posts'),
      description: __('Fill out the details and create your post'),
      url: '/forums/posts',
      urlText: 'Create Posts'
    },
    {
      title: __('Create Pages'),
      description: __('Fill out the details and create your page'),
      url: '/forums/pages',
      urlText: 'Create Pages'
    }
  ]
};

export const EMPTY_CONTENT_ENGAGE = {
  title: __('Getting Started with Campaigns'),
  description:
    __(
      'Learn how to use this feature to engage your contacts and drive conversations'
    ) + '.',
  steps: [
    {
      title: 'Email',
      description:
        "<ul><li><strong><a href='/settings/campaign-configs'>Verify</a> your email address</strong> <br/> Make sure it is the same as one of your team members</li><li><strong>Integrate that email address with <a href='/settings/integrations#showImapModal=true'>IMAP</a></strong> <br/> Connect your existing emails address as an integration</li><li><strong>Prepare your contacts by Segment / Tag / Brand</strong> <br/> For more targeted marketing, create a <a href='/segments/new/customer'>Segment</a></li></ul>",
      html: true,
      icon: 'envelope-edit'
    },
    {
      title: 'Messenger',
      description: __(
        '<strong>Prepare your contacts by Segment / Tag / Brand</strong><br/> For more targeted marketing, create a Segment'
      ),
      html: true,
      url: '/segments/new/customer',
      urlText: 'Create a Segment',
      icon: 'comment-edit'
    },
    {
      title: 'SMS',
      description:
        "<ul><li><strong><a href='/settings/campaign-configs'>Claim</a> your phone number</strong> <br/> Make sure you assigned it to a team member</li><li><strong>Prepare your contacts</strong> <br/> Check the <a href='https://en.wikipedia.org/wiki/E.164' target='_blank'>format</a>, verification status, and primary phone state</li><li><strong><a href='/segments/new/customer'>Create</a> a segment</strong> <br/> Filter all contacts with valid phone numbers and other properties</li></ul>",
      html: true,
      icon: 'comment-alt-message'
    }
  ]
};

export const EMPTY_CONTENT_KNOWLEDGEBASE = {
  title: __('Getting Started with erxes Knowledgebase'),
  description: __(
    'Educate your customers and staff by creating help articles to reach higher levels of satisfaction'
  ),
  steps: [
    {
      title: __('Create your knowledgebase'),
      description: __(
        '<ul><li>Make sure you’ve created your Brands</li><li>Click on “Add Knowledgebase” to create one for a specific Brand</li><li>Click on the “Settings” button and “Add Categories”. A good one to get started with would be “General, Pricing, etc.”</li><li>Click on “Add Articles” to start adding help articles</li></ul>'
      ),
      html: true
    },
    {
      title: __('Install the script'),
      description:
        "<ul><li>Copy the individual script by clicking on the Settings button.</li><li>Use <a href='/settings/scripts'>Script Manager</a> to avoid script duplication errors if you’re planning to display this popup along with any other erxes widgets</li></ul>",
      html: true,
      url: '/settings/scripts',
      urlText: __('Go to Script Manager')
    }
  ]
};

export const EMPTY_CONTENT_MESSENGER = {
  title: __('Getting Started with erxes Messenger'),
  description: `${__(
    'Learn how the erxes Messenger works and it is set up'
  )}.${' It is used in the Team Inbox and Knowledgebase and Engage features uses Messenger'}`,
  steps: [
    {
      title: __('Create a new messenger'),
      description: __('Click on “Add” and complete all the steps.'),
      url: '/settings/integrations/createMessenger',
      urlText: 'Add Messenger'
    },
    {
      title: __('Display your Knowledgebase'),
      description: __(
        'Click on “Add” of the Knowledgebase integration, if any, and complete the steps.'
      ),
      url: '/settings/integrations#showKBAddModal=true',
      urlText: 'Add Knowledgebase'
    },
    {
      title: __('Display your form'),
      description: __(
        'Click on “Add” of the Popup integration,if any, and complete the steps.'
      ),
      url: '/settings/integrations#showPopupAddModal=true',
      urlText: 'Add Popup'
    },
    {
      title: __('Install the script'),
      description: __(
        'Copy the script and install it on your website by clicking on the “Install Code” button.'
      )
    },
    {
      title: __('Avoid duplication of erxes widget scripts'),
      description: __(
        'If you wish to display erxes messenger and any other erxes widgets on the same webpage, use the Script Manager to combine scripts and avoid any duplication errors.'
      ),
      icon: 'exclamation-circle',
      url: '/settings/scripts',
      urlText: 'Manange Scripts'
    }
  ]
};

export const EMPTY_CONTENT_CONTACTS = {
  title: __('Getting Started with Contacts'),
  description: __('Coordinate and manage all your customer interactions'),
  steps: [
    {
      title: __('Import your previous contacts'),
      description: __(
        'Use Import feature to bulk import all your previous Customers or Leads'
      ),
      url: '/settings/importHistories',
      urlText: 'Go to Customer Import'
    },
    {
      title: __('Collect visitor information'),
      description: __(
        'Create your erxes Messenger to start capturing Visitors'
      ),
      url: '/settings/integrations/createMessenger',
      urlText: 'Create Messenger'
    },
    {
      title: __('Sync email contacts'),
      description: __(
        'Integrate your email address to sync previous email Leads'
      ),
      url: '/settings/integrations',
      urlText: 'Visit AppStore'
    },
    {
      title: __('Start capturing social media contacts'),
      description: __(
        'Integrate social media website to start capturing Leads'
      ),
      url: '/settings/integrations',
      urlText: 'Visit AppStore'
    },
    {
      title: __('Generate contacts through Forms'),
      description: 'Create your forms and start collecting Leads',
      url: '/forms/create',
      urlText: 'Create a Popup'
    }
  ]
};

export const EMPTY_CONTENT_DEAL_PIPELINE = {
  title: __('Getting Started with Sales Pipeline'),
  description: __(
    'Drive leads to a successful close with our Kanban-style boards'
  ),
  steps: [
    {
      title: __('Create your first Sales Board'),
      description:
        __(
          'Tip: This could be equivalent to your brands and/or you can organize by year/project/etc'
        ) + '.',
      url: '/settings/boards/deal#showBoardModal=true',
      urlText: 'Create a Board'
    },
    {
      title: __('Start adding Pipelines to the Board'),
      description:
        __(
          'Tip: This could be a bit more granular than the Board and/or you can organize by period/project/etc'
        ) + '.',
      urlText: 'Create a Pipeline',
      url: '/settings/boards/deal#showPipelineModal=true'
    }
  ]
};

export const EMPTY_CONTENT_PURCHASE_PIPELINE = {
  title: __('Getting Started with Purchase'),
  description: __(
    'Drive leads to a successful close with our Kanban-style boards'
  ),
  steps: [
    {
      title: __('Create your first Purchases Board'),
      description:
        __(
          'Tip: This could be equivalent to your brands and/or you can organize by year/project/etc'
        ) + '.',
      url: '/settings/boards/purchase#showBoardModal=true',
      urlText: 'Create a Board'
    },
    {
      title: __('Start adding Purchase to the Board'),
      description:
        __(
          'Tip: This could be a bit more granular than the Board and/or you can organize by period/project/etc'
        ) + '.',
      urlText: 'Create a Purchase',
      url: '/settings/boards/purchase#showPipelineModal=true'
    }
  ]
};

export const EMPTY_CONTENT_TASK_PIPELINE = {
  title: __('Getting Started with Sales Pipeline'),
  description: __(
    'Drive leads to a successful close with our Kanban-style boards'
  ),
  steps: [
    {
      title: __('Create your first Task Board'),
      description: __(
        'Tip: This could be equivalent to your departments and/or you can organize by year/project/etc.'
      ),
      url: '/settings/boards/task#showBoardModal=true',
      urlText: 'Create a Board'
    },
    {
      title: __('Start adding Pipelines to the Board'),
      description: __(
        'Tip: This could be a bit more granular than the Board and/or you can organize by period/project/etc.'
      ),
      urlText: 'Create a Pipeline',
      url: '/settings/boards/task#showPipelineModal=true'
    }
  ]
};

export const WEBHOOK_ACTIONS = [
  { label: 'Customer created', action: 'create', type: 'customer' },
  { label: 'Customer updated', action: 'update', type: 'customer' },
  { label: 'Customer deleted', action: 'delete', type: 'customer' },
  { label: 'Company created', action: 'create', type: 'company' },
  { label: 'Company updated', action: 'update', type: 'company' },
  { label: 'Company deleted', action: 'delete', type: 'company' },
  {
    label: 'Knowledge Base created',
    action: 'create',
    type: 'knowledgeBaseArticle'
  },
  {
    label: 'Knowledge Base updated',
    action: 'update',
    type: 'knowledgeBaseArticle'
  },
  {
    label: 'Knowledge Base deleted',
    action: 'delete',
    type: 'knowledgeBaseArticle'
  },
  { label: 'Admin messages', action: 'create', type: 'userMessages' },
  {
    label: 'Customer create conversation',
    action: 'create',
    type: 'conversation'
  },
  { label: 'Customer messages', action: 'create', type: 'customerMessages' },
  { label: 'Campaign', action: 'create', type: 'engageMessages' },
  {
    label: 'Form submission received',
    action: 'create',
    type: 'popupSubmitted'
  },
  {
    label: 'Deal created',
    action: 'create',
    type: 'deal'
  },
  {
    label: 'Deal updated',
    action: 'update',
    type: 'deal'
  },
  {
    label: 'Deal deleted',
    action: 'delete',
    type: 'deal'
  },
  {
    label: 'Deal moved',
    action: 'createBoardItemMovementLog',
    type: 'deal'
  },
  {
    label: 'Purchase created',
    action: 'create',
    type: 'purchase'
  },
  {
    label: 'Purchase updated',
    action: 'update',
    type: 'purchase'
  },
  {
    label: 'Purchase deleted',
    action: 'delete',
    type: 'purchase'
  },
  {
    label: 'Purchase moved',
    action: 'createBoardItemMovementLog',
    type: 'purchase'
  },
  {
    label: 'Task created',
    action: 'create',
    type: 'task'
  },
  {
    label: 'Task updated',
    action: 'update',
    type: 'task'
  },
  {
    label: 'Task deleted',
    action: 'delete',
    type: 'task'
  },
  {
    label: 'Task moved',
    action: 'createBoardItemMovementLog',
    type: 'task'
  },
  {
    label: 'Ticket created',
    action: 'create',
    type: 'ticket'
  },
  {
    label: 'Ticket updated',
    action: 'update',
    type: 'ticket'
  },
  {
    label: 'Ticket deleted',
    action: 'delete',
    type: 'ticket'
  },
  {
    label: 'Ticket moved',
    action: 'createBoardItemMovementLog',
    type: 'ticket'
  }
];

export const EMPTY_CONTENT_BOOKINGS = {
  title: __('Getting Started with erxes Booking'),
  description: __(
    'erxes Booking widget helps you create listings of your Products and Services and receive bookings with your erxes Form.'
  ),
  steps: [
    {
      title: __('Prepare Product Properties'),
      description: __(
        'This widget is based on your erxes Products and Services. Depending on your products, you may need to create custom Properties first. For example, you can display additional information such as Amenities, Services, etc. in the product detail page or as user filters.'
      ),
      url: '/settings/properties?type=products:product',
      urlText: 'Create Custom Properties'
    },
    {
      title: __('Organize Your Products'),
      description: __(
        'The number of pages in this widget depends on how many sub-categories you’ll create for your products and services. If you haven’t created or organized them yet, please go to Products & Services first.'
      ),
      url: '/settings/product-service',
      urlText: 'Manage Products & Services'
    }
  ]
};

export const FONTS = [
  {
    label: 'Ubuntu',
    value: `'Ubuntu', sans-serif`
  },
  {
    label: 'Lobster',
    value: `'Lobster', cursive`
  },
  {
    label: 'Roboto',
    value: `'Roboto', sans-serif`
  },
  {
    label: 'Roboto Condensed',
    value: `'Roboto Condensed', sans-serif`
  },
  {
    label: 'Open Sans',
    value: `'Open Sans', sans-serif`
  }
];

export const COLUMN_CHOOSER_EXCLUDED_FIELD_NAMES = {
  LIST: [
    'state',
    'avatar',
    'ownerId',
    'status',
    'integrationId',
    'categoryId',
    'vendorId',
    'emailValidationStatus',
    'phoneValidationStatus',
    'location.countryCode',
    'tagIds'
  ],

  IMPORT: [
    'state',
    'avatar',
    'ownerId',
    'status',
    'integrationId',
    'categoryId',
    'vendorId',
    'emailValidationStatus',
    'phoneValidationStatus',
    'location.countryCode',
    'tagIds',
    'isOnline',
    'sessionCount',
    'leadStatus',
    'relatedIntegrationIds',
    'hasAuthority',
    'stageChangedDate',
    'stageId',
    'userId',
    'modifiedBy',
    'assignedUserIds',
    'watchedUserIds'
  ],
  EXPORT: [
    'state',
    'avatar',
    'ownerId',
    'status',
    'integrationId',
    'categoryId',
    'vendorId',
    'location.countryCode',
    'tagIds',
    'isOnline',
    'leadStatus',
    'relatedIntegrationIds',
    'subUoms.uom',
    'subUoms.ratio'
  ]
};
