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

export const RABBITMQ_QUEUES = {
  PUT_LOG: 'putLog',
  RPC_API_TO_INTEGRATIONS: 'rpc_queue:api_to_integrations',
  RPC_API_TO_WORKERS: 'rpc_queue:api_to_workers',
  RPC_API_TO_WEBHOOK_WORKERS: 'rpc_queue:api_to_webhook_workers',
  WORKERS: 'workers',
  VISITOR_LOG: 'visitorLog',
  RPC_VISITOR_LOG: 'rpc_queue:visitorLog',
  AUTOMATIONS_TRIGGER: 'erxes-automations:trigger',
  LOG_DELETE_OLD: 'log:delete:old'
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

export const USER_PROPERTIES_INFO = {
  email: 'Primary email',
  username: 'User name',
  ALL: [
    { field: 'email', label: 'Primary email', canHide: false },
    { field: 'username', label: 'User name' }
  ]
};

export const PRIORITIES = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  NORMAL: 'Normal',
  LOW: 'Low',
  ALL: [
    {
      name: 'Critical',
      color: '#EA475D'
    },
    { name: 'High', color: '#F7CE53' },
    { name: 'Normal', color: '#3B85F4' },
    { name: 'Low', color: '#AAAEB3' }
  ]
};
