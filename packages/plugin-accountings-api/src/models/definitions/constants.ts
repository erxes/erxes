export const ACCOUNT_KINDS = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
  ALL: ['active', 'passive'],
};

export const ACCOUNT_JOURNALS = {
  MAIN: 'main',
  CASH: 'cash',
  BANK: 'bank',
  DEBT: 'debt',
  INVENTORY: 'inventory',
  FIXED_ASSET: 'fixedAsset',
  TAX: 'tax',
  ALL: ['main', 'cash', 'bank', 'debt', 'inventory', 'fixedAsset', 'tax'],
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
  INV_FB: 'inv_fb',
  INV_INCOME: 'invIncome',
  INV_OUT: 'invOut',
  INV_MOVE: 'invMove',
  INV_JUSTIFY: 'invJustify',
  INV_CONVERT: 'invConvert',
  INV_SALE: 'invSale',
  INV_IN_RETURN: 'invInReturn',
  INV_SALE_RETURN: 'invSaleReturn',
  VAT: 'vat',
  CTAX: 'ctax',
  ALL: [
    'main', 'cash', 'bank', 'receivable', 'payable',
    'inv_fb', 'invIncome', 'invOut', 'inv_move', 'inv_adjust', 'inv_convert',
    'inv_sale', 'inv_cost',
    'inv_in_return', 'inv_sale_return',
    'expense', 'vat', 'ctax'
  ],
  ALL_INV: [],
}
