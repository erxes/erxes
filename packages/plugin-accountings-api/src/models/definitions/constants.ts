export const ACCOUNT_KINDS = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
  ALL: ['active', 'passive'],
};

export const ACCOUNT_JOURNALS = {
  MAIN: 'main',
  FUND_CASH: 'cash',
  FUND_BANK: 'bank',
  DEBT: 'debt',
  INVENTORY: 'inventory',
  FIXED_ASSET: 'fixedAsset',
  VAT: 'vat',
  ALL: ['main', 'cash', 'bank', 'debt', 'inventory', 'fixedAsset', 'vat'],
};

export const ACCOUNT_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted'],
};

export const ACCOUNT_CATEGORY_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  ALL: ['active', 'archived'],
};

export const ACCOUNT_CATEGORY_MASK_TYPES = {
  ANY: '',
  SOFT: 'soft',
  HARD: 'hard',
  ALL: ['', 'soft', 'hard'],
};

export const TR_SIDES = {
  DEBIT: 'dt',
  CREDIT: 'ct',
  ALL: ['dt', 'ct']
}
export const TR_STATUSES = {
  PLAN: 'plan',
  PENDING: 'pending',
  SYNCED: 'synced',
  NEW: 'new',
  REAL: 'real',
  CONFIRMED: 'confirmed',
  COMPLETE: 'complete',
  ALL: ['plan', 'pending', 'synced', 'real', 'confirmed', 'complete'],
};

export const PTR_STATUSES = {
  DT: 'dt',
  CT: 'ct',
  ZERO: 'zero',
  OK: 'ok',
  ALL: ['dt', 'ct', 'zero', 'ok'],
};