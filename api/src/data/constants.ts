export const EMAIL_CONTENT_CLASS = 'erxes-email-content';
export const EMAIL_CONTENT_PLACEHOLDER = `<div class="${EMAIL_CONTENT_CLASS}"></div>`;

export const MESSAGE_KINDS = {
  AUTO: 'auto',
  VISITOR_AUTO: 'visitorAuto',
  MANUAL: 'manual',
  ALL: ['auto', 'visitorAuto', 'manual']
};

export const FORM_FIELDS = {
  TYPES: {
    INPUT: 'input',
    TEXT_AREA: 'textarea',
    RADIO: 'radio',
    CHECK: 'check',
    SELECT: 'select',
    DIVIDER: 'divider',
    EMAIL: 'email',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    MIDDLE_NAME: 'middleName',
    ALL: [
      'input',
      'textarea',
      'radio',
      'check',
      'select',
      'divider',
      'email',
      'firstName',
      'lastName',
      'middleName'
    ]
  },
  VALIDATION: {
    BLANK: '',
    NUMBER: 'number',
    DATE: 'date',
    DATETIME: 'datetime',
    EMAIL: 'email',
    ALL: ['', 'number', 'date', 'datetime', 'email']
  }
};

export const FIELD_CONTENT_TYPES = {
  FORM: 'form',
  CUSTOMER: 'customer',
  COMPANY: 'company',
  PRODUCT: 'product',
  ALL: ['form', 'customer', 'company', 'product']
};

export const EXTEND_FIELDS = {
  CUSTOMER: [
    { name: 'tag', label: 'Tag' },
    { name: 'ownerEmail', label: 'Owner email' },
    { name: 'companiesPrimaryNames', label: 'Companies' }
  ],
  PRODUCT: [
    { name: 'categoryCode', label: 'Category Code' },
    { name: 'vendorCode', label: 'Vendor Code' }
  ]
};

export const COC_LEAD_STATUS_TYPES = [
  '',
  'new',
  'open',
  'inProgress',
  'openDeal',
  'unqualified',
  'attemptedToContact',
  'connected',
  'badTiming'
];

export const COC_LIFECYCLE_STATE_TYPES = [
  '',
  'subscriber',
  'lead',
  'marketingQualifiedLead',
  'salesQualifiedLead',
  'opportunity',
  'customer',
  'evangelist',
  'other'
];

export const FIELDS_GROUPS_CONTENT_TYPES = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  PRODUCT: 'product',
  CONVERSATION: 'conversation',
  DEVICE: 'device',
  ALL: ['customer', 'company', 'product', 'conversation', 'device']
};

export const NOTIFICATION_MODULES = [
  {
    name: 'conversations',
    description: 'Conversations',
    types: [
      {
        name: 'conversationStateChange',
        text: 'State change'
      },
      {
        name: 'conversationAssigneeChange',
        text: 'Assignee change'
      },
      {
        name: 'conversationAddMessage',
        text: 'Add message'
      }
    ]
  },

  {
    name: 'channels',
    description: 'Channels',
    types: [
      {
        name: 'channelMembersChange',
        text: 'Members change'
      }
    ]
  },

  {
    name: 'deals',
    description: 'Deals',
    types: [
      {
        name: 'dealAdd',
        text: 'Assigned a new deal  card'
      },
      {
        name: 'dealRemoveAssign',
        text: 'Removed from the deal card'
      },
      {
        name: 'dealEdit',
        text: 'Deal card edited'
      },
      {
        name: 'dealChange',
        text: 'Moved between stages'
      },
      {
        name: 'dealDueDate',
        text: 'Due date is near'
      },
      {
        name: 'dealDelete',
        text: 'Deal card deleted'
      }
    ]
  },

  {
    name: 'tickets',
    description: 'Tickets',
    types: [
      {
        name: 'ticketAdd',
        text: 'Assigned a new ticket  card'
      },
      {
        name: 'ticketRemoveAssign',
        text: 'Removed from the ticket card'
      },
      {
        name: 'ticketEdit',
        text: 'Ticket card edited'
      },
      {
        name: 'ticketChange',
        text: 'Moved between stages'
      },
      {
        name: 'ticketDueDate',
        text: 'Due date is near'
      },
      {
        name: 'ticketDelete',
        text: 'Ticket card deleted'
      }
    ]
  },

  {
    name: 'tasks',
    description: 'Tasks',
    types: [
      {
        name: 'taskAdd',
        text: 'Assigned a new task  card'
      },
      {
        name: 'taskRemoveAssign',
        text: 'Removed from the task card'
      },
      {
        name: 'taskEdit',
        text: 'Task card edited'
      },
      {
        name: 'taskChange',
        text: 'Moved between stages'
      },
      {
        name: 'taskDueDate',
        text: 'Due date is near'
      },
      {
        name: 'taskDelete',
        text: 'Task card deleted'
      }
    ]
  },
  {
    name: 'customers',
    description: 'Customers',
    types: [
      {
        name: 'customerMention',
        text: 'Mention on customer note'
      }
    ]
  },
  {
    name: 'companies',
    description: 'Companies',
    types: [
      {
        name: 'companyMention',
        text: 'Mention on company note'
      }
    ]
  }
];

export const MODULE_NAMES = {
  BOARD: 'board',
  BOARD_DEAL: 'dealBoards',
  BOARD_TASK: 'taskBoards',
  BOARD_TICKET: 'ticketBoards',
  BOARD_GH: 'growthHackBoards',
  PIPELINE_DEAL: 'dealPipelines',
  PIPELINE_TASK: 'taskPipelines',
  PIPELINE_TICKET: 'ticketPipelines',
  PIPELINE_GH: 'growthHackPipelines',
  STAGE_DEAL: 'dealStages',
  STAGE_TASK: 'taskStages',
  STAGE_TICKET: 'ticketStages',
  STAGE_GH: 'growthHackStages',
  CHECKLIST: 'checklist',
  CHECKLIST_ITEM: 'checkListItem',
  BRAND: 'brand',
  CHANNEL: 'channel',
  COMPANY: 'company',
  CUSTOMER: 'customer',
  DEAL: 'deal',
  EMAIL_TEMPLATE: 'emailTemplate',
  IMPORT_HISTORY: 'importHistory',
  PRODUCT: 'product',
  PRODUCT_CATEGORY: 'productCategory',
  RESPONSE_TEMPLATE: 'responseTemplate',
  TAG: 'tag',
  TASK: 'task',
  TICKET: 'ticket',
  PERMISSION: 'permission',
  USER: 'user',
  KB_TOPIC: 'knowledgeBaseTopic',
  KB_CATEGORY: 'knowledgeBaseCategory',
  KB_ARTICLE: 'knowledgeBaseArticle',
  USER_GROUP: 'userGroup',
  INTERNAL_NOTE: 'internalNote',
  PIPELINE_LABEL: 'pipelineLabel',
  PIPELINE_TEMPLATE: 'pipelineTemplate',
  GROWTH_HACK: 'growthHack',
  INTEGRATION: 'integration',
  SEGMENT: 'segment',
  ENGAGE: 'engage',
  SCRIPT: 'script',
  FIELD: 'field',
  AUTOMATION: 'automation',
  FIELD_GROUP: 'fieldGroup',
  WEBHOOK: 'webhook',
  DASHBOARD: 'dashboard',
  DASHBOARD_ITEM: 'dashboardItem'
};

export const RABBITMQ_QUEUES = {
  PUT_LOG: 'putLog',
  RPC_API_TO_INTEGRATIONS: 'rpc_queue:api_to_integrations',
  RPC_API_TO_WORKERS: 'rpc_queue:api_to_workers',
  RPC_API_TO_WEBHOOK_WORKERS: 'rpc_queue:api_to_webhook_workers',
  WORKERS: 'workers',
  VISITOR_LOG: 'visitorLog',
  RPC_VISITOR_LOG: 'rpc_queue:visitorLog',
  AUTOMATIONS_TRIGGER: 'erxes-automations:trigger'
};

export const AUTO_BOT_MESSAGES = {
  NO_RESPONSE: 'No reply',
  CHANGE_OPERATOR: 'The team will reply in message'
};

export const BOT_MESSAGE_TYPES = {
  SAY_SOMETHING: 'say_something'
};

export const AWS_EMAIL_STATUSES = {
  SEND: 'send',
  DELIVERY: 'delivery',
  OPEN: 'open',
  CLICK: 'click',
  COMPLAINT: 'complaint',
  BOUNCE: 'bounce',
  RENDERING_FAILURE: 'renderingfailure',
  REJECT: 'reject'
};

export const EMAIL_VALIDATION_STATUSES = {
  VALID: 'valid',
  INVALID: 'invalid',
  ACCEPT_ALL_UNVERIFIABLE: 'accept_all_unverifiable',
  UNVERIFIABLE: 'unverifiable',
  UNKNOWN: 'unknown',
  DISPOSABLE: 'disposable',
  CATCH_ALL: 'catchall',
  BAD_SYNTAX: 'badsyntax'
};

export const PROPERTY_GROUPS = [
  {
    label: 'Contacts',
    value: 'contact',
    description: 'description',
    types: [
      { value: 'visitor', label: 'Visitors' },
      { value: 'lead', label: 'Leads' },
      { value: 'customer', label: 'Customers' },
      { value: 'company', label: 'Companies' },
      { value: 'conversation', label: 'Conversation details' },
      { value: 'device', label: 'Device properties' }
    ]
  },
  {
    label: 'Tickets',
    value: 'ticket',
    description: 'description',
    types: [{ value: 'ticket', label: 'Tickets' }]
  },
  {
    label: 'Tasks',
    value: 'task',
    description: 'description',
    types: [{ value: 'task', label: 'Tasks' }]
  },
  {
    label: 'Sales pipeline',
    value: 'deal',
    description: 'description',
    types: [
      { value: 'deal', label: 'Sales pipeline' },
      { value: 'product', label: 'Products & services' }
    ]
  },
  {
    label: 'Team member',
    value: 'user',
    description: 'description',
    types: [{ value: 'user', label: 'Sales pipeline' }]
  }
];

export const CUSTOMER_BASIC_INFO = {
  avatar: 'Avatar',
  firstName: 'First Name',
  lastName: 'Last Name',
  middleName: 'Middle Name',
  primaryEmail: 'Primary E-mail',
  primaryPhone: 'Primary Phone',
  position: 'Position',
  department: 'Department',
  owner: 'Owner',
  pronoun: 'Pronoun',
  birthDate: 'Birthday',
  hasAuthority: 'Has Authority',
  description: 'Description',
  isSubscribed: 'Subscribed',
  code: 'Code',
  score: 'Score',

  ALL: [
    { field: 'avatar', label: 'Avatar', canHide: false },
    { field: 'firstName', label: 'First Name', canHide: false },
    { field: 'lastName', label: 'Last Name', canHide: false },
    { field: 'middleName', label: 'Middle Name', canHide: false },
    {
      field: 'primaryEmail',
      label: 'Primary E-mail',
      validation: 'email',
      canHide: false
    },
    {
      field: 'primaryPhone',
      label: 'Primary Phone',
      validation: 'phone',
      canHide: false
    },
    { field: 'position', label: 'Position', canHide: true },
    { field: 'department', label: 'Department', canHide: true },
    { field: 'hasAuthority', label: 'Has Authority', canHide: true },
    { field: 'description', label: 'Description', canHide: true },
    { field: 'isSubscribed', label: 'Subscribed', canHide: true },
    { field: 'owner', label: 'Owner', canHide: true },
    { field: 'pronoun', label: 'Pronoun', canHide: true },
    { field: 'birthDate', label: 'Birthday', canHide: true },
    { field: 'code', label: 'Code', canHide: true },
    { field: 'score', label: 'Score', canHide: true }
  ]
};

export const COMPANY_INFO = {
  avatar: 'Logo',
  code: 'Code',
  primaryName: 'Primary Name',
  size: 'Size',
  industry: 'Industries',
  plan: 'Plan',
  primaryEmail: 'Primary Email',
  primaryPhone: 'Primary Phone',
  businessType: 'Business Type',
  description: 'Description',
  isSubscribed: 'Subscribed',
  location: 'Headquarters Country',
  score: 'Score',

  ALL: [
    { field: 'avatar', label: 'Logo', canHide: false },
    { field: 'primaryName', label: 'Primary Name', canHide: false },
    {
      field: 'primaryEmail',
      label: 'Primary E-mail',
      validation: 'email',
      canHide: false
    },
    {
      field: 'primaryPhone',
      label: 'Primary Phone',
      validation: 'phone',
      canHide: false
    },
    { field: 'size', label: 'Size' },
    { field: 'industry', label: 'Industries' },
    { field: 'plan', label: 'Plan' },
    { field: 'owner', label: 'Owner', canHide: true },
    { field: 'businessType', label: 'Business Type', canHide: true },
    { field: 'code', label: 'Code', canHide: true },
    { field: 'description', label: 'Description', canHide: true },
    { field: 'isSubscribed', label: 'Subscribed', canHide: true },
    { field: 'location', label: 'Headquarters Country', canHide: true },
    { field: 'score', label: 'Score', canHide: true }
  ]
};

export const PRODUCT_INFO = {
  code: 'Code',
  name: 'Name',
  type: 'Type',
  category: 'Category',
  vendor: 'Vendor',
  description: 'Description',
  sku: 'Sku',

  ALL: [
    { field: 'code', label: 'Code' },
    { field: 'name', label: 'Name' },
    { field: 'type', label: 'Type' },
    { field: 'category', label: 'Category' },
    { field: 'vendor', label: 'Vendor' },
    { field: 'description', label: 'Description' },
    { field: 'sku', label: 'Sku' }
  ]
};

export const CONVERSATION_INFO = {
  opened: 'Opened',
  channels: 'Channels',
  brand: 'Brand',
  integration: 'Integration',
  count: 'Conversations',
  ALL: [
    { field: 'opened', label: 'Opened' },
    { field: 'channels', label: 'Channels' },
    { field: 'brand', label: 'Brand' },
    { field: 'integration', label: 'Integration' },
    { field: 'count', label: 'Conversations' }
  ]
};

export const DEVICE_PROPERTIES_INFO = {
  location: 'Location',
  browser: 'Browser',
  platform: 'Platform',
  ipAddress: 'IP Address',
  hostName: 'Hostname',
  language: 'Language',
  agent: 'User Agent',
  ALL: [
    { field: 'location', label: 'Location' },
    { field: 'browser', label: 'Browser' },
    { field: 'platform', label: 'Platform' },
    { field: 'ipAddress', label: 'IP Address' },
    { field: 'hostName', label: 'Hostname' },
    { field: 'language', label: 'Language' },
    { field: 'agent', label: 'User Agent' }
  ]
};

export const USER_PROPERTIES_INFO = {
  email: 'Primary email',
  username: 'User name',
  ALL: [
    { field: 'email', label: 'Primary email', canHide: false },
    { field: 'username', label: 'User name' }
  ]
};
