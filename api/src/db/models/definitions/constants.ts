export const CONVERSATION_STATUSES = {
  NEW: 'new',
  OPEN: 'open',
  CLOSED: 'closed',
  ALL: ['new', 'open', 'closed']
};

export const CONVERSATION_OPERATOR_STATUS = {
  BOT: 'bot',
  OPERATOR: 'operator',
  ALL: ['bot', 'operator']
};

export const TAG_TYPES = {
  CONVERSATION: 'conversation',
  CUSTOMER: 'customer',
  ENGAGE_MESSAGE: 'engageMessage',
  COMPANY: 'company',
  INTEGRATION: 'integration',
  PRODUCT: 'product',
  ALL: [
    'conversation',
    'customer',
    'engageMessage',
    'company',
    'integration',
    'product'
  ]
};

export const MESSENGER_KINDS = {
  CHAT: 'chat',
  NOTE: 'note',
  POST: 'post',
  ALL: ['chat', 'note', 'post']
};

export const SENT_AS_CHOICES = {
  BADGE: 'badge',
  SNIPPET: 'snippet',
  FULL_MESSAGE: 'fullMessage',
  ALL: ['badge', 'snippet', 'fullMessage']
};

export const METHODS = {
  MESSENGER: 'messenger',
  EMAIL: 'email',
  SMS: 'sms',
  ALL: ['messenger', 'email', 'sms']
};

export const ENGAGE_KINDS = {
  AUTO: 'auto',
  MANUAL: 'manual',
  VISITOR_AUTO: 'visitorAuto',
  ALL: ['auto', 'manual', 'visitorAuto']
};

export const LEAD_LOAD_TYPES = {
  SHOUTBOX: 'shoutbox',
  POPUP: 'popup',
  EMBEDDED: 'embedded',
  DROPDOWN: 'dropdown',
  SLIDEINLEFT: 'slideInLeft',
  SLIDEINRIGHT: 'slideInRight',
  ALL: [
    '',
    'shoutbox',
    'popup',
    'embedded',
    'dropdown',
    'slideInLeft',
    'slideInRight'
  ]
};

export const LEAD_SUCCESS_ACTIONS = {
  EMAIL: 'email',
  REDIRECT: 'redirect',
  ONPAGE: 'onPage',
  ALL: ['', 'email', 'redirect', 'onPage']
};

export const KIND_CHOICES = {
  MESSENGER: 'messenger',
  LEAD: 'lead',
  FACEBOOK_MESSENGER: 'facebook-messenger',
  FACEBOOK_POST: 'facebook-post',
  GMAIL: 'gmail',
  NYLAS_GMAIL: 'nylas-gmail',
  NYLAS_IMAP: 'nylas-imap',
  NYLAS_OFFICE365: 'nylas-office365',
  NYLAS_EXCHANGE: 'nylas-exchange',
  NYLAS_OUTLOOK: 'nylas-outlook',
  NYLAS_YAHOO: 'nylas-yahoo',
  CALLPRO: 'callpro',
  TWITTER_DM: 'twitter-dm',
  CHATFUEL: 'chatfuel',
  SMOOCH_VIBER: 'smooch-viber',
  SMOOCH_LINE: 'smooch-line',
  SMOOCH_TELEGRAM: 'smooch-telegram',
  SMOOCH_TWILIO: 'smooch-twilio',
  WHATSAPP: 'whatsapp',
  TELNYX: 'telnyx',
  WEBHOOK: 'webhook',
  ALL: [
    'messenger',
    'lead',
    'facebook-messenger',
    'facebook-post',
    'gmail',
    'callpro',
    'chatfuel',
    'nylas-gmail',
    'nylas-imap',
    'nylas-office365',
    'nylas-outlook',
    'nylas-exchange',
    'nylas-yahoo',
    'twitter-dm',
    'smooch-viber',
    'smooch-line',
    'smooch-telegram',
    'smooch-twilio',
    'whatsapp',
    'telnyx',
    'webhook'
  ]
};

export const INTEGRATION_NAMES_MAP = {
  messenger: 'Messenger',
  lead: 'Forms',
  'facebook-messenger': 'Facebook Messenger',
  'facebook-post': 'Facebook Post',
  gmail: 'Gmail',
  webhook: 'Webhook',
  callpro: 'Call pro',
  chatfuel: 'Chatfuel',

  whatsapp: 'WhatsApp by Smooch',
  'smooch-telegram': 'Telegram by Smooch',
  'smooch-viber': 'Viber by Smooch',
  'smooch-line': 'Line by Smooch',
  'smooch-twilio': 'SMS Twilio by Smooch',

  'nylas-imap': 'IMAP by Nylas',
  'nylas-gmail': 'Gmail by Nylas',
  'nylas-office365': 'Office 365 by Nylas',
  'nylas-exchange': 'Microsoft Exchange by Nylas',
  'nylas-outlook': 'Outlook by Nylas',
  'nylas-yahoo': 'Yahoo by Nylas',
  'twitter-dm': 'Twitter dm',

  telnyx: 'SMS by Telnyx'
};

// messenger data availability constants
export const MESSENGER_DATA_AVAILABILITY = {
  MANUAL: 'manual',
  AUTO: 'auto',
  ALL: ['manual', 'auto']
};

export const ACTIVITY_CONTENT_TYPES = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  USER: 'user',
  DEAL: 'deal',
  TICKET: 'ticket',
  TASK: 'task',
  PRODUCT: 'product',
  GROWTH_HACK: 'growthHack',
  SMS: 'sms',
  CAMPAIGN: 'campaign',
  INTERNAL_NOTE: 'internal_note',
  CHECKLIST: 'checklist',
  CONVERSATION: 'conversation',
  SEGMENT: 'segment',
  EMAIL: 'email',
  BRAND: 'brand',

  ALL: [
    'customer',
    'company',
    'user',
    'deal',
    'ticket',
    'task',
    'product',
    'growthHack',
    'sms',
    'campaign',
    'internal_note',
    'checklist',
    'conversation',
    'segment',
    'email',
    'brand'
  ]
};

export const PUBLISH_STATUSES = {
  DRAFT: 'draft',
  PUBLISH: 'publish',
  ALL: ['draft', 'publish']
};

export const ACTIVITY_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MERGE: 'merge',
  SEND: 'send',
  MOVED: 'moved',
  CONVERT: 'convert',
  ASSIGNEE: 'assignee',

  ALL: [
    'create',
    'update',
    'delete',
    'merge',
    'send',
    'moved',
    'convert',
    'assignee'
  ]
};

export const ACTIVITY_PERFORMER_TYPES = {
  SYSTEM: 'SYSTEM',
  USER: 'USER',
  CUSTOMER: 'CUSTOMER',
  DEAL: 'DEAL',

  ALL: ['SYSTEM', 'USER', 'CUSTOMER', 'DEAL']
};

export const PRODUCT_TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  ALL: ['product', 'service']
};

export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted']
};

export const PIPELINE_VISIBLITIES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  ALL: ['public', 'private']
};

export const HACK_SCORING_TYPES = {
  RICE: 'rice',
  ICE: 'ice',
  PIE: 'pie',
  ALL: ['rice', 'ice', 'pie']
};

export const FIELDS_GROUPS_CONTENT_TYPES = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  CONVERSATION: 'conversation',
  DEVICE: 'device',
  PRODUCT: 'product',
  TICKET: 'ticket',
  TASK: 'task',
  DEAL: 'deal',
  VISITOR: 'visitor',
  LEAD: 'lead',
  FORM: 'form',
  ALL: [
    'customer',
    'company',
    'conversation',
    'device',
    'product',
    'ticket',
    'task',
    'deal',
    'visitor',
    'lead',
    'form'
  ]
};

export const CUSTOMER_LIFECYCLE_STATE_TYPES = [
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

export const COMPANY_LIFECYCLE_STATE_TYPES = [
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

export const COMPANY_BUSINESS_TYPES = [
  '',
  'Analyst',
  'Competitor',
  'Customer',
  'Integrator',
  'Investor',
  'Partner',
  'Press',
  'Prospect',
  'Reseller',
  'Other'
];

export const DEFAULT_COMPANY_INDUSTRY_TYPES = [
  '',
  'Aerospace & Defense',
  'Air Freight & Logistics',
  'Airlines',
  'Auto Components',
  'Automobiles',
  'Banks',
  'Beverages',
  'Biotechnology',
  'Building Products',
  'Capital Markets',
  'Chemicals',
  'Commercial Services & Supplies',
  'Communications Equipment',
  'Construction & Engineering',
  'Construction Materials',
  'Consumer Finance',
  'Containers & Packaging',
  'Distributors',
  'Diversified Consumer Services',
  'Diversified Financial Services',
  'Diversified Telecommunication Services',
  'Electric Utilities',
  'Electrical Equipment',
  'Electronic Equipment, Instruments & Components',
  'Energy Equipment & Services',
  'Entertainment',
  'Equity Real Estate Investment Trusts (REITs)',
  'Food & Staples Retailing',
  'Food Products',
  'Gas Utilities',
  'Health Care Equipment & Supplies',
  'Health Care Providers & Services',
  'Health Care Technology',
  'Hotels, Restaurants & Leisure',
  'Household Durables',
  'Household Products',
  'Independent Power and Renewable Electricity Producers',
  'Industrial Conglomerates',
  'Insurance',
  'Interactive Media & Services',
  'Internet & Direct Marketing Retail',
  'IT Services',
  'Leisure Products',
  'Life Sciences Tools & Services',
  'Machinery',
  'Marine',
  'Media',
  'Metals & Mining',
  'Mortgage Real Estate Investment Trusts (REITs)',
  'Multi-Utilities',
  'Multiline Retail',
  'Oil, Gas & Consumable Fuels',
  'Paper & Forest Products',
  'Personal Products',
  'Pharmaceuticals',
  'Professional Services',
  'Real Estate Management & Development',
  'Road & Rail',
  'Semiconductors & Semiconductor Equipment',
  'Software',
  'Specialty Retail',
  'Technology Hardware, Storage & Peripherals',
  'Textiles, Apparel & luxury goods',
  'Thrifts & Mortgage Finance',
  'Tobacco',
  'Trading Companies & Distributors',
  'Transportation Infrastructure',
  'Water Utilities',
  'Wireless Telecommunication Services',
  'Transportation',
  'Mining',
  'Finance',
  'Group company',
  'Government',
  'Utility',
  'Education',
  'Manufacturing',
  'Communication',
  'Retail',
  'Health',
  'Construction',
  'Management'
];

export const COMPANY_INDUSTRY_TYPES = [...DEFAULT_COMPANY_INDUSTRY_TYPES];

export const PROBABILITY = {
  TEN: '10%',
  TWENTY: '20%',
  THIRTY: '30%',
  FOURTY: '40%',
  FIFTY: '50%',
  SIXTY: '60%',
  SEVENTY: '70%',
  EIGHTY: '80%',
  NINETY: '90%',
  WON: 'Won',
  LOST: 'Lost',
  DONE: 'Done',
  RESOLVED: 'Resolved',
  ALL: [
    '10%',
    '20%',
    '30%',
    '40%',
    '50%',
    '60%',
    '70%',
    '80%',
    '90%',
    'Won',
    'Lost',
    'Done',
    'Resolved'
  ]
};

export const BOARD_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  ALL: ['active', 'archived']
};

export const BOARD_STATUSES_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' }
];

export const TIME_TRACK_TYPES = {
  STARTED: 'started',
  STOPPED: 'stopped',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ALL: ['started', 'stopped', 'paused', 'completed']
};

export const BOARD_TYPES = {
  DEAL: 'deal',
  TICKET: 'ticket',
  TASK: 'task',
  GROWTH_HACK: 'growthHack',
  ALL: ['deal', 'ticket', 'task', 'growthHack']
};

export const MESSAGE_TYPES = {
  VIDEO_CALL: 'videoCall',
  VIDEO_CALL_REQUEST: 'videoCallRequest',
  TEXT: 'text',
  ALL: ['videoCall', 'videoCallRequest', 'text']
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
  GROWTHHACK_ADD: 'growthHackAdd',
  GROWTHHACK_REMOVE_ASSIGN: 'growthHackRemoveAssign',
  GROWTHHACK_EDIT: 'growthHackEdit',
  GROWTHHACK_CHANGE: 'growthHackChange',
  GROWTHHACK_DUE_DATE: 'growthHackDueDate',
  GROWTHHACK_DELETE: 'growthHackDelete',
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
  CUSTOMER_MENTION: 'customerMention',
  COMPANY_MENTION: 'companyMention',
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
    'growthHackAdd',
    'growthHackRemoveAssign',
    'growthHackEdit',
    'growthHackChange',
    'growthHackDueDate',
    'growthHackDelete',
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
    'customerMention',
    'companyMention'
  ]
};

export const FORM_TYPES = {
  LEAD: 'lead',
  GROWTH_HACK: 'growthHack',
  ALL: ['lead', 'growthHack']
};

export const NOTIFICATION_CONTENT_TYPES = {
  TASK: 'task',
  DEAL: 'deal',
  COMPANY: 'company',
  CUSTOMER: 'customer',
  TICKET: 'ticket',
  CHANNEL: 'channel',
  CONVERSATION: 'conversation',
  ALL: [
    'task',
    'deal',
    'company',
    'customer',
    'ticket',
    'channel',
    'conversation'
  ]
};

const STATUSES = [
  { label: 'Active', value: 'Active' },
  { label: 'Deleted', value: 'Deleted' }
];

export const COMPANY_SELECT_OPTIONS = {
  BUSINESS_TYPES: [
    { label: 'Competitor', value: 'Competitor' },
    { label: 'Customer', value: 'Customer' },
    { label: 'Investor', value: 'Investor' },
    { label: 'Partner', value: 'Partner' },
    { label: 'Press', value: 'Press' },
    { label: 'Prospect', value: 'Prospect' },
    { label: 'Reseller', value: 'Reseller' },
    { label: 'Other', value: 'Other' },
    { label: 'Unknown', value: '' }
  ],
  STATUSES,
  DO_NOT_DISTURB: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
    { label: 'Unknown', value: '' }
  ]
};

export const DEFAULT_SOCIAL_LINKS = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'Youtube', value: 'youtube' },
  { label: 'Website', value: 'website' }
];

export const SOCIAL_LINKS = [
  ...DEFAULT_SOCIAL_LINKS,
  { label: 'Academia.edu', value: 'academia.edu' },
  { label: 'Chess.com', value: 'chess.com' },
  { label: 'Crunchyroll', value: 'crunchyroll' },
  { label: 'DeviantArt', value: 'deviantArt' },
  { label: 'Discord', value: 'discord' },
  { label: 'Douban', value: 'douban' },
  { label: 'eToro', value: 'eToro' },
  { label: 'Flickr', value: 'flickr' },
  { label: 'Gapo', value: 'gapo' },
  { label: 'Goodreads', value: 'goodreads' },
  { label: 'GitHub', value: 'gitHub' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'KakaoStory', value: 'kakaoStory' },
  { label: 'KizlarSoruyor', value: 'kizlarSoruyor' },
  { label: 'Last.fm', value: 'last.fm' },
  { label: 'LinkedIn', value: 'linkedIn' },
  { label: 'LiveJournal', value: 'liveJournal' },
  { label: 'Pinterest', value: 'pinterest' },
  { label: 'Pixnet', value: 'pixnet' },
  { label: 'Plurk', value: 'plurk' },
  { label: 'Quora', value: 'quora' },
  { label: 'Reddit', value: 'reddit' },
  { label: 'Renren', value: 'renren' },
  { label: 'Sina Weibo', value: 'sinaWeibo' },
  { label: 'SoundCloud', value: 'soundCloud' },
  { label: 'Spotify', value: 'spotify' },
  { label: 'Steam', value: 'steam' },
  { label: 'Tagged', value: 'tagged' },
  { label: 'Taringa', value: 'taringa' },
  { label: 'Tumblr', value: 'tumblr' },
  { label: 'VK', value: 'vk' },
  { label: 'Voat', value: 'voat' },
  { label: 'Wattpad', value: 'wattpad' },
  { label: 'XING', value: 'xing' },
  { label: 'Yammer', value: 'yammer' },
  { label: 'Yelp', value: 'yelp' }
];

export const DEFAULT_SEX_CHOICES = [
  { label: 'Not known', value: 0 },
  { label: 'Male', value: 1 },
  { label: 'Female', value: 2 },
  { label: 'Not applicable', value: 9 }
];

export const CUSTOMER_SELECT_OPTIONS = {
  SEX: [
    ...DEFAULT_SEX_CHOICES,
    { label: 'co/co', value: 10 },
    { label: 'en/en', value: 11 },
    { label: 'ey/em', value: 12 },
    { label: 'he/him', value: 13 },
    { label: 'he/them', value: 14 },
    { label: 'she/her', value: 15 },
    { label: 'she/them', value: 16 },
    { label: 'they/them', value: 17 },
    { label: 'xie/hir', value: 18 },
    { label: 'yo/yo', value: 19 },
    { label: 'ze/zir', value: 20 },
    { label: 've/vis', value: 21 },
    { label: 'xe/xem', value: 22 }
  ],
  EMAIL_VALIDATION_STATUSES: [
    { label: 'Valid', value: 'valid' },
    { label: 'Invalid', value: 'invalid' },
    { label: 'Accept all unverifiable', value: 'accept_all_unverifiable' },
    { label: 'Unverifiable', value: 'unverifiable' },
    { label: 'Unknown', value: 'unknown' },
    { label: 'Disposable', value: 'disposable' },
    { label: 'Catch all', value: 'catchall' },
    { label: 'Bad syntax', value: 'badsyntax' }
  ],
  PHONE_VALIDATION_STATUSES: [
    { label: 'Valid', value: 'valid' },
    { label: 'Invalid', value: 'invalid' },
    { label: 'Unknown', value: 'unknown' },
    { label: 'Can receive sms', value: 'receives_sms' },
    { label: 'Unverifiable', value: 'unverifiable' }
  ],
  LEAD_STATUS_TYPES: [
    { label: 'New', value: 'new' },
    { label: 'Contacted', value: 'attemptedToContact' },
    { label: 'Working', value: 'inProgress' },
    { label: 'Bad Timing', value: 'badTiming' },
    { label: 'Unqualified', value: 'unqualified' },
    { label: 'Unknown', value: '' }
  ],
  STATUSES,
  DO_NOT_DISTURB: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
    { label: 'Unknown', value: '' }
  ],
  HAS_AUTHORITY: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
    { label: 'Unknown', value: '' }
  ],
  STATE: [
    { label: 'Visitor', value: 'visitor' },
    { label: 'Lead', value: 'lead' },
    { label: 'Customer', value: 'customer' }
  ]
};

export const DEFAULT_CONSTANT_VALUES = {
  sex_choices: DEFAULT_SEX_CHOICES,
  company_industry_types: DEFAULT_COMPANY_INDUSTRY_TYPES.map(v => ({
    label: v,
    value: v
  })),
  social_links: DEFAULT_SOCIAL_LINKS
};

export const SEGMENT_STRING_OPERATORS = ['e', 'dne', 'c', 'dnc'];
export const SEGMENT_BOOLEAN_OPERATORS = ['is', 'ins', 'it', 'if'];
export const SEGMENT_NUMBER_OPERATORS = [
  'numbere',
  'numberdne',
  'numberigt',
  'numberilt'
];
export const SEGMENT_DATE_OPERATORS = [
  'dateigt',
  'dateilt',
  'wobm',
  'woam',
  'wobd',
  'woad',
  'drlt',
  'drgt'
];

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
  { label: 'User messages', action: 'create', type: 'userMessages' },
  { label: 'Customer messages', action: 'create', type: 'customerMessages' },
  { label: 'Engage messages', action: 'create', type: 'engageMessages' },
  {
    label: 'Form submission received',
    action: 'create',
    type: 'popupSubmitted'
  }
];

export const WEBHOOK_STATUS = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  ALL: ['available', 'unavailable']
};
