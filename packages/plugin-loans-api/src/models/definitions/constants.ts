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

export const UNDUE_CALC_TYPE = {
  FROMAMOUNT: 'fromAmount',
  FROMINTEREST: 'fromInterest',
  FROMTOTALPAYMENT: 'fromTotalPayment',
  FROMENDAMOUNT: 'fromEndAmount',
  ALL: ['fromAmount', 'fromInterest', 'fromTotalPayment', 'fromEndAmount']
};

export const CONTRACT_CLASSIFICATION = {
  NORMAL: 'NORMAL',
  EXPIRED: 'EXPIRED',
  DOUBTFUL: 'DOUBTFUL',
  NEGATIVE: 'NEGATIVE',
  BAD: 'BAD',
  ALL: ['NORMAL', 'EXPIRED', 'DOUBTFUL', 'NEGATIVE', 'BAD']
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
  PRE: 'pre',

  ALL: ['pending', 'done', 'skipped', 'pre', 'less']
};

export const LEASE_TYPES = {
  FINANCE: 'finance',
  SALVAGE: 'salvage',

  ALL: ['finance', 'salvage']
};

export const STORED_INTEREST_TYPES = {
  STORED_INTEREST: 'storedInterest',
  OUT_BALANCE: 'outBalance'
};

export const INTEREST_CORRECTION_TYPE = {
  STOP_INTEREST: 'stopInterest',
  INTEREST_RETURN: 'interestReturn',
  INTEREST_CHANGE: 'interestChange',
  ALL: ['stopInterest', 'interestReturn', 'interestChange']
};
