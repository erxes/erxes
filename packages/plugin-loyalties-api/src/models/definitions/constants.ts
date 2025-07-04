export const CAMPAIGN_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  TRASH: 'trash',
  ALL: ['active', 'draft', 'trash']
};

export const OWNER_TYPES = {
  CUSTOMER: 'customer',
  TEAMMEMBER: 'user',
  COMPANY: 'company',
  CPUSer: 'cpUser',
  ALL: ['customer', 'user', 'company', 'cpUser']
};

export const CODE_STATUS = {
  NEW: 'new',
  IN_USE: 'in_use',
  DONE: 'done',
  ALL: ['new','in_use', 'done']
};

export const VOUCHER_STATUS = {
  NEW: 'new',
  LOSS: 'used',
  EXPIRED: 'expired',
  ALL: ['new', 'used', 'expired']
};

export const LOTTERY_STATUS = {
  NEW: 'new',
  WON: 'won',
  LOSS: 'loss',
  ALL: ['new', 'won', 'loss']
};

export const SPIN_STATUS = {
  NEW: 'new',
  LOSS: 'loss',
  WON: 'won',
  ALL: ['new', 'loss', 'won']
};

export const ASSIGNMENT_STATUS = {
  NEW: 'new',
  WON: 'won',
  LOSS: 'loss',
  ALL: ['new', 'won', 'loss']
};

export const AGENT_STATUSES = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
  ALL: ['active', 'draft', 'archived']
};

export const CHAR_SET = {
  'A-Z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'a-z': 'abcdefghijklmnopqrstuvwxyz',
  '0-9': '0123456789',
  'А-Я': 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯ',  
  'а-я': 'абвгдеёжзийклмнопрстуфхцчшщыэюя'
}
