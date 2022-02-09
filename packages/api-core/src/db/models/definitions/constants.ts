export const EMAIL_DELIVERY_STATUS = {
  PENDING: 'pending',
  RECEIVED: 'received',
  ALL: ['pending', 'received'],
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
