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

export const VOUCHER_STATUS = {
  NEW: 'new',
  LOSS: 'used',
  ALL: ['new', 'used']
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
