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

export const PRODUCT_CATEGORY_STATUSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  ARCHIVED: 'archived',
  ALL: ['active', 'disabled', 'archived']
};

export const PRODUCT_SUPPLY = {
  UNIQUE: 'unique',
  LIMITED: 'limited',
  UNLIMITED: 'unlimited',
  ALL: ['unique', 'limited', 'unlimited']
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
  USER: 'user',
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
    'form',
    'user'
  ]
};

export const FORM_TYPES = {
  LEAD: 'lead',
  GROWTH_HACK: 'growthHack',
  BOOKING: 'booking',
  ALL: ['lead', 'growthHack', 'booking']
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

export const DEFAULT_CONSTANT_VALUES = {
  sex_choices: DEFAULT_SEX_CHOICES,
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
  { label: 'Deal created', action: 'create', type: 'deal' },
  { label: 'Deal updated', action: 'update', type: 'deal' },
  { label: 'Deal deleted', action: 'delete', type: 'deal' },
  { label: 'Deal moved', action: 'createBoardItemMovementLog', type: 'deal' },
  { label: 'Task created', action: 'create', type: 'task' },
  { label: 'Task updated', action: 'update', type: 'task' },
  { label: 'Task deleted', action: 'delete', type: 'task' },
  { label: 'Task moved', action: 'createBoardItemMovementLog', type: 'task' },
  { label: 'Ticket created', action: 'create', type: 'ticket' },
  { label: 'Ticket updated', action: 'update', type: 'ticket' },
  { label: 'Ticket deleted', action: 'delete', type: 'ticket' },
  {
    label: 'Ticket moved',
    action: 'createBoardItemMovementLog',
    type: 'ticket'
  },
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
  {
    label: 'Customer create conversation',
    action: 'create',
    type: 'conversation'
  },
  {
    label: 'Campaign created',
    action: 'create',
    type: 'engageMessages'
  },
  {
    label: 'Form submission received',
    action: 'create',
    type: 'popupSubmitted'
  }
];

export const WEBHOOK_TYPES = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  CONVERSATION: 'conversation',
  USER_MESSAGES: 'userMessages',
  CUSTOMER_MESSAGES: 'customerMessages',
  FORM_SUBMITTED: 'popupSubmitted',
  KNOWLEDGEBASE: 'knowledgeBaseArticle',
  CAMPAIGN: 'engageMessages',
  DEAL: 'deal',
  TASK: 'task',
  TICKET: 'ticket',
  ALL: [
    'customer',
    'company',
    'conversation',
    'userMessages',
    'customerMessages',
    'popupSubmitted',
    'knowledgeBaseArticle',
    'engageMessages',
    'deal',
    'task',
    'ticket'
  ]
};

export const WEBHOOK_STATUS = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  ALL: ['available', 'unavailable']
};

export const REACTION_CHOICES = {
  LIKE: 'like',
  DISLIKE: 'disLike',
  ALL: ['like', 'dislike']
};
