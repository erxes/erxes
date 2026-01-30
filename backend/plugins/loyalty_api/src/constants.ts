export const OWNER_TYPES = {
  MEMBER: 'user',
  CUSTOMER: 'customer',
  COMPANY: 'company',
  CPUSER: 'cpUser',
  ALL: ['user', 'customer', 'company', 'cpUser'],
};

export const LOYALTY_STATUSES = {
  NEW: 'new',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  REDEEMED: 'redeemed',
  WON: 'won',
  LOSS: 'loss',
  ALL: ['new', 'active', 'inactive', 'expired', 'redeemed', 'won', 'loss'],
};

export const LOYALTY_CHAR_SET = {
  'A-Z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'a-z': 'abcdefghijklmnopqrstuvwxyz',
  '0-9': '0123456789',
  'А-Я': 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯ',
  'а-я': 'абвгдеёжзийклмнопрстуфхцчшщыэюя',
};

export const LOYALTY_CHAR_SET_ADVANCED = {
  '0-9': '0123456789',
  'a-z': 'abcdefghijklmnopqrstuvwxyz',
  'A-Z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'a-Z': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0-z': '0123456789abcdefghijklmnopqrstuvwxyz',
  '0-Z': '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0-zZ': '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
};
