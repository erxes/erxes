export const OWNER_TYPES = {
  MEMBER: 'user',
  CUSTOMER: 'customer',
  COMPANY: 'company',
  CPUSER: 'cpUser',
  ALL: ['user', 'customer', 'company', 'cpUser'],
};

export const CAMPAIGN_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  ALL: ['expired', 'active', 'inactive'],
};

export const LOYALTY_STATUSES = {
  NEW: 'new',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  REDEEMED: 'redeemed',
  ALL: ['new', 'active', 'inactive', 'expired', 'redeemed'],
};

export const LOYALTY_CHAR_SET = {
  'A-Z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'a-z': 'abcdefghijklmnopqrstuvwxyz',
  '0-9': '0123456789',
  'А-Я': 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯ',
  'а-я': 'абвгдеёжзийклмнопрстуфхцчшщыэюя',
};
