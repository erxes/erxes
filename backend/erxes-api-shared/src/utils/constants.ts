export const STATUSES = [
  { label: 'Active', value: 'Active' },
  { label: 'Deleted', value: 'Deleted' },
];

export const DEFAULT_SOCIAL_LINKS = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'whatsapp', value: 'whatsapp' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'Youtube', value: 'youtube' },
  { label: 'Website', value: 'website' },
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
  { label: 'Yelp', value: 'yelp' },
];

export const DEFAULT_SEX_CHOICES = [
  { label: 'Not known', value: 0 },
  { label: 'Male', value: 1 },
  { label: 'Female', value: 2 },
  { label: 'Not applicable', value: 9 },
];

export const SEX_OPTIONS = [
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
  { label: 'xe/xem', value: 22 },
];

export const USER_ROLES = {
  SYSTEM: 'system',
  USER: 'user',
  ALL: ['system', 'user'],
};

export const LOG_STATUSES = {
  FAILED: 'failed',
  SUCCESS: 'success',
};

export const CONFORMITY_TYPE = {
  customers: 'customer',
  companies: 'company',
};
