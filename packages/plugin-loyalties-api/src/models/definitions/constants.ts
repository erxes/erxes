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
  LOSS: 'used',
  DONE: 'done',
  ALL: ['new','used', 'done']
};

export const VOUCHER_STATUS = {
  NEW: 'new',
  IN_USE: 'in_use',
  LOSS: 'used',
  EXPIRED: 'expired',
  ALL: ['new', 'in_use', 'used', 'expired']
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
