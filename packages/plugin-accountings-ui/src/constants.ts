export const PRODUCT_TYPE_CHOISES = {
  product: 'Product',
  service: 'Service',
  unique: 'Unique',
};

export const PRODUCT_CATEGORIES_STATUS = ['active', 'disabled', 'archived'];
export const PRODUCT_CATEGORIES_STATUS_FILTER = {
  disabled: 'Disabled',
  archived: 'Archived',
  deleted: 'Deleted',
};

export const CONFIGS_KEY_LABELS = {
  isRequireUOM: 'is required UOM',
};

export const ACCOUNT_KINDS = [
  { label: 'ACTIVE', value: 'active' },
  { label: 'PASSIVE', value: 'passive' }
];

export const ACCOUNT_JOURNALS = [
  { label: 'MAIN', value: 'main' },
  { label: 'CASH', value: 'cash' },
  { label: 'BANK', value: 'bank' },
  { label: 'DEBT', value: 'debt' },
  { label: 'INVENTORY', value: 'inventory' },
  { label: 'FIXED_ASSET', value: 'fixedAsset' },
  { label: 'TAX', value: 'tax' },
];

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

export const TR_CUSTOMER_TYPES = [
  { value: 'customer', label: 'Customer' },
  { value: 'company', label: 'Company' },
  { value: 'user', label: 'Team Member' },
];

export const TR_SIDES = {
  DEBIT: 'dt',
  CREDIT: 'ct',
  ALL: ['dt', 'ct'],
  OPTIONS: [{ value: 'dt', label: 'debit' }, { value: 'ct', label: 'credit' }],
  FUND_OPTIONS: [{ value: 'dt', label: 'incoming' }, { value: 'ct', label: 'outgoing' }],
  RECEIVABLE_OPTIONS: [{ value: 'dt', label: 'open' }, { value: 'ct', label: 'close' }],
  PAYABLE_OPTIONS: [{ value: 'dt', label: 'close' }, { value: 'ct', label: 'open' }],
}

export const TR_STATUSES = {
  PLAN: 'plan',
  PENDING: 'pending',
  SYNCED: 'synced',
  NEW: 'new',
  REAL: 'real',
  CONFIRMED: 'confirmed',
  COMPLETE: 'complete',
  DELETED: 'deleted',
  ACTIVE: ['synced', 'real', 'confirmed', 'complete'],
  ALL: ['plan', 'pending', 'synced', 'real', 'confirmed', 'complete', 'deleted'],
};

export const PTR_STATUSES = {
  UNKNOWN: 'unknown',
  DIFF: 'diff',
  ACCOUNT_BALANCE: 'acc',
  OK: 'ok',
  ALL: ['unknown', 'diff', 'ok'],
};

export const JOURNALS = {
  MAIN: 'main',
  MAIN_FB: 'main_fb',
  CASH: 'cash',
  BANK: 'bank',
  RECEIVABLE: 'receivable',
  PAYABLE: 'payable',
  VAT: 'vat',
  CTAX: 'ctax',
  INV_FB: 'inv_fb',
  INV_INCOME: 'inv_income',
  INV_OUT: 'inv_out',
  INV_MOVE: 'inv_move',
  INV_ADJUST: 'inv_adjust',
  INV_CONVERT: 'inv_convert',
  INV_SALE: 'inv_sale',
  INV_COST: 'inv_cost',
  INV_IN_RETURN: 'inv_in_return',
  INV_SALE_RETURN: 'inv_sale_return',
  ALL: [
    'main', 'cash', 'bank', 'receivable', 'payable',
    'inv_fb', 'inv_income', 'inv_out', 'inv_move', 'inv_adjust', 'inv_convert',
    'inv_sale', 'inv_cost',
    'inv_in_return', 'inv_sale_return',
    'expense', 'vat', 'ctax',
  ],
  ALL_INV: [],
}
