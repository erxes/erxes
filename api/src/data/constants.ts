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
    ALL: [
      'input',
      'textarea',
      'radio',
      'check',
      'select',
      'divider',
      'email',
      'firstName',
      'lastName'
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
    { name: 'ownerEmail', label: 'Owner' },
    { name: 'companiesPrimaryNames', label: 'Companies' }
  ],
  PRODUCT: [{ name: 'categoryCode', label: 'Category Code' }]
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
  ALL: ['customer', 'company', 'product']
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
  PRODUCT_CATEGORY: 'product-category',
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
  WEBHOOK: 'webhook'
};

export const RABBITMQ_QUEUES = {
  PUT_LOG: 'putLog',
  RPC_API_TO_INTEGRATIONS: 'rpc_queue:api_to_integrations',
  RPC_API_TO_WORKERS: 'rpc_queue:api_to_workers',
  WORKERS: 'workers',
  VISITOR_LOG: 'visitorLog',
  RPC_VISITOR_LOG: 'rpc_queue:visitorLog'
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
