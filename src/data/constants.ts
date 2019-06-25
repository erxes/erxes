export const EMAIL_CONTENT_CLASS = 'erxes-email-content';
export const EMAIL_CONTENT_PLACEHOLDER = `<div class="${EMAIL_CONTENT_CLASS}"></div>`;

export const INTEGRATION_KIND_CHOICES = {
  MESSENGER: 'messenger',
  FORM: 'form',
  FACEBOOK: 'facebook',
  ALL: ['messenger', 'form', 'facebook'],
};

export const MESSAGE_KINDS = {
  AUTO: 'auto',
  VISITOR_AUTO: 'visitorAuto',
  MANUAL: 'manual',
  ALL: ['auto', 'visitorAuto', 'manual'],
};

// module constants
export const NOTIFICATION_TYPES = {
  CHANNEL_MEMBERS_CHANGE: 'channelMembersChange',
  CONVERSATION_ADD_MESSAGE: 'conversationAddMessage',
  CONVERSATION_ASSIGNEE_CHANGE: 'conversationAssigneeChange',
  CONVERSATION_STATE_CHANGE: 'conversationStateChange',
  DEAL_ADD: 'dealAdd',
  DEAL_REMOVE_ASSIGN: 'dealRemoveAssign',
  DEAL_EDIT: 'dealEdit',
  DEAL_CHANGE: 'dealChange',
  DEAL_DUE_DATE: 'dealDueDate',
  DEAL_DELETE: 'dealDelete',
  TICKET_ADD: 'ticketAdd',
  TICKET_REMOVE_ASSIGN: 'ticketRemoveAssign',
  TICKET_EDIT: 'ticketEdit',
  TICKET_CHANGE: 'ticketChange',
  TICKET_DUE_DATE: 'ticketDueDate',
  TICKET_DELETE: 'ticketDelete',
  TASK_ADD: 'taskAdd',
  TASK_REMOVE_ASSIGN: 'taskRemoveAssign',
  TASK_EDIT: 'taskEdit',
  TASK_CHANGE: 'taskChange',
  TASK_DUE_DATE: 'taskDueDate',
  TASK_DELETE: 'taskDelete',
  ALL: [
    'channelMembersChange',
    'conversationAddMessage',
    'conversationAssigneeChange',
    'conversationStateChange',
    'dealAdd',
    'dealRemoveAssign',
    'dealEdit',
    'dealChange',
    'dealDueDate',
    'dealDelete',
    'ticketAdd',
    'ticketRemoveAssign',
    'ticketEdit',
    'ticketChange',
    'ticketDueDate',
    'ticketDelete',
    'taskAdd',
    'taskRemoveAssign',
    'taskEdit',
    'taskChange',
    'taskDueDate',
    'taskDelete',
  ],
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
    ALL: ['input', 'textarea', 'radio', 'check', 'select', 'divider', 'email', 'firstName', 'lastName'],
  },
  VALIDATION: {
    BLANK: '',
    NUMBER: 'number',
    DATE: 'date',
    EMAIL: 'email',
    ALL: ['', 'number', 'date', 'email'],
  },
};

export const FIELD_CONTENT_TYPES = {
  FORM: 'form',
  CUSTOMER: 'customer',
  COMPANY: 'company',
  ALL: ['form', 'customer', 'company'],
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
  'badTiming',
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
  'other',
];

export const FIELDS_GROUPS_CONTENT_TYPES = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  ALL: ['customer', 'company'],
};

export const CUSTOMER_BASIC_INFOS = [
  'firstName',
  'lastName',
  'primaryEmail',
  'primaryPhone',
  'ownerId',
  'position',
  'department',
  'leadStatus',
  'lifecycleState',
  'hasAuthority',
  'description',
  'doNotDisturb',
];

export const COMPANY_BASIC_INFOS = [
  'primaryName',
  'size',
  'industry',
  'website',
  'plan',
  'primaryEmail',
  'primaryPhone',
  'leadStatus',
  'lifecycleState',
  'businessType',
  'description',
  'doNotDisturb',
];

export const INSIGHT_BASIC_INFOS = {
  count: 'Customer count',
  messageCount: 'Conversation message count',
  customerCount: 'Conversations by customer count',
  customerCountPercentage: 'Customer Count Percentage',
  resolvedCount: 'Resolved conversation',
  averageResponseDuration: 'Average duration of total',
  firstResponseDuration: 'Average duration of first response',
  ALL: [
    'date',
    'count',
    'customerCount',
    'customerCountPercentage',
    'messageCount',
    'resolvedCount',
    'averageResponseDuration',
    'firstResponseDuration',
  ],
};

export const INSIGHT_TYPES = {
  DEAL: 'deal',
  CONVERSATION: 'conversation',
  ALL: ['deal', 'conversation'],
};

export const NOTIFICATION_MODULES = [
  {
    name: 'conversations',
    description: 'Conversations',
    types: [
      {
        name: 'conversationStateChange',
        text: 'State change',
      },
      {
        name: 'conversationAssigneeChange',
        text: 'Assignee change',
      },
      {
        name: 'conversationAddMessage',
        text: 'Add message',
      },
    ],
  },

  {
    name: 'channels',
    description: 'Channels',
    types: [
      {
        name: 'channelMembersChange',
        text: 'Members change',
      },
    ],
  },

  {
    name: 'deals',
    description: 'Deals',
    types: [
      {
        name: 'dealAdd',
        text: 'Assigned a new deal  card',
      },
      {
        name: 'dealRemoveAssign',
        text: 'Removed from the deal card',
      },
      {
        name: 'dealEdit',
        text: 'Deal card edited',
      },
      {
        name: 'dealChange',
        text: 'Moved between stages',
      },
      {
        name: 'dealDueDate',
        text: 'Due date is near',
      },
      {
        name: 'dealDelete',
        text: 'Deal card deleted',
      },
    ],
  },

  {
    name: 'tickets',
    description: 'Tickets',
    types: [
      {
        name: 'ticketAdd',
        text: 'Assigned a new ticket  card',
      },
      {
        name: 'ticketRemoveAssign',
        text: 'Removed from the ticket card',
      },
      {
        name: 'ticketEdit',
        text: 'Ticket card edited',
      },
      {
        name: 'ticketChange',
        text: 'Moved between stages',
      },
      {
        name: 'ticketDueDate',
        text: 'Due date is near',
      },
      {
        name: 'ticketDelete',
        text: 'Ticket card deleted',
      },
    ],
  },

  {
    name: 'tasks',
    description: 'Tasks',
    types: [
      {
        name: 'taskAdd',
        text: 'Assigned a new task  card',
      },
      {
        name: 'taskRemoveAssign',
        text: 'Removed from the task card',
      },
      {
        name: 'taskEdit',
        text: 'Task card edited',
      },
      {
        name: 'taskChange',
        text: 'Moved between stages',
      },
      {
        name: 'taskDueDate',
        text: 'Due date is near',
      },
      {
        name: 'taskDelete',
        text: 'Task card deleted',
      },
    ],
  },
];
