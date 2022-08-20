export const REPAYMENT_TYPE = [
  { label: 'Equal Principal Payment', value: 'equal' }, // undsen tulbur tentsuu
  { label: 'Fixed Rate Payment', value: 'fixed' } // niit tulbur tentsuu
];

export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  NORMAL: 'normal',
  BAD: 'bad',
  CLOSED: 'closed',
  ALL: ['draft', 'normal', 'bad', 'closed']
};

export const COLLATERAL_STATUS = {
  ACTIVE: 'active',
  ARCHIVE: 'archive',
  ALL: ['active', 'archive']
};

export const INVOICE_STATUS = {
  PENDING: 'pending',
  LESS: 'less',
  DONE: 'done',
  CANCELED: 'canceled',

  ALL: ['pending', 'less', 'done', 'canceled']
};

export const SCHEDULE_STATUS = {
  PENDING: 'pending',
  DONE: 'done',
  SKIPPED: 'skipped',
  LESS: 'less',

  ALL: ['pending', 'done', 'skipped', 'less']
};

export const LEASE_TYPES = {
  FINANCE: 'finance',
  SALVAGE: 'salvage',

  ALL: ['finance', 'salvage']
};
