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
  UNKNOWN: 'unknown',
  OK: 'ok',
  ALL: ['dt', 'ct', 'unknown', 'ok'],
};

export const JOURNALS = {
  MAIN: 'main',
  MAIN_FB: 'main_fb',
  CASH_IN: 'cash_in',
  CASH_OUT: 'cash_out',
  BANK_IN: 'bank_in',
  BANK_OUT: 'bank_out',
  DEBT: 'debt',
  PAYABLE_FB: 'payable_fb',
  PAYABLE: 'payable',
  RECEIVABLE_FB: 'receivable_fb',
  RECEIVABLE: 'receivable',
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
    'main',
    'cash_in', 'cash_out',
    'bank_in', 'bank_out',
    'debt', 'payable', 'receivable',
    'inv_fb', 'inv_income', 'inv_out', 'inv_move', 'inv_adjust', 'inv_convert',
    'inv_sale', 'inv_cost',
    'inv_in_return', 'inv_sale_return',
    'expense'
  ]
}
