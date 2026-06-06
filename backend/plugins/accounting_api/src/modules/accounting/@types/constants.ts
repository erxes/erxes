export const ACCOUNT_KINDS = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
  ALL: ['active', 'passive'],
};

export const ACCOUNT_JOURNALS = {
  MAIN: 'main',
  TAX: 'tax',
  CASH: 'cash',
  BANK: 'bank',
  DEBT: 'debt',
  EXCHANGE_DIFF: 'exchangeDiff',
  INVENTORY: 'inventory',
  INV_FOLLOW: 'invFollow',
  FIXED_ASSET: 'fixedAsset',
  ALL: [
    'main',
    'tax',
    'cash',
    'bank',
    'debt',
    'exchangeDiff',
    'inventory',
    'invFollow',
    'fixedAsset',
  ],
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
  ALL: ['dt', 'ct'],
};

export const TR_STATUSES = {
  // future level
  PLAN: 'plan',
  // conversation level
  DRAFT: 'draft',
  MENTIONED: 'mentioned',
  APPROVED: 'approved',
  REJECED: 'rejeced',
  RETURNED: 'returned',
  // business level
  PROGRESS: 'progress',
  ASSIGNED: 'assigned',
  CONFIRMED: 'confirmed',
  CANELLED: 'canelled',
  COMPLETE: 'complete',

  ALL: [
    'plan',
    'draft',
    'mentioned',
    'approved',
    'rejeced',
    'returned',
    'progress',
    'assigned',
    'confirmed',
    'canelled',
    'complete',
  ],
  ACTIVE: ['progress', 'assigned', 'confirmed', 'canelled', 'complete'],
  CONVERSATION: ['draft', 'mentioned', 'approved', 'rejeced', 'returned', 'plan'],
};

export const TR_INVENTORY_STATUS_TYPES = {
  OMIT: 'omit',
  SOON: 'soon',
  REAL: 'real',

  OMIT_STATUSES: [
    TR_STATUSES.PLAN,
  ],
  SOON_STATUSES: [
    TR_STATUSES.DRAFT,
    TR_STATUSES.MENTIONED,
    TR_STATUSES.APPROVED,
    TR_STATUSES.REJECED,
    TR_STATUSES.RETURNED,
  ],
  REAL_STATUSES: [
    TR_STATUSES.PROGRESS,
    TR_STATUSES.ASSIGNED,
    TR_STATUSES.CONFIRMED,
    TR_STATUSES.CANELLED,
    TR_STATUSES.COMPLETE,
  ],
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
  EXCHANGE_DIFF: 'exchangeDiff',
  MAIN_FB: 'main_fb',
  CASH: 'cash',
  BANK: 'bank',
  RECEIVABLE: 'receivable',
  PAYABLE: 'payable',
  INV_FB: 'inv_fb',
  INV_INCOME: 'invIncome',
  INV_OUT: 'invOut',
  INV_MOVE: 'invMove',
  INV_MOVE_IN: 'invMoveIn',
  INV_SALE: 'invSale',
  INV_SALE_COST: 'invSaleCost',
  INV_SALE_OUT: 'invSaleOut',
  INV_SALE_RETURN: 'invSaleReturn',
  INV_SALE_RETURN_COST: 'invSaleReturnCost',
  INV_SALE_RETURN_OUT: 'invSaleReturnOut',
  // INV_IN_RETURN: 'invInReturn',
  // INV_JUSTIFY: 'invJustify',
  // INV_CONVERT: 'invConvert',
  TAX: 'tax',
  ALL: [
    'main',
    'tax',
    'cash',
    'bank',
    'receivable',
    'payable',
    'inv_fb',
    'invIncome',
    'invOut',
    'invMove',
    'invMoveIn',
    'invSale',
    'invSaleOut',
    'invSaleCost',
    'invSaleReturn',
    'invSaleReturnOut',
    'invSaleReturnCost',
    'expense',
    'exchangeDiff',
  ],
  ALL_REAL_INV: [
    // yag urtug uldegdeld nuluuluh journal ni
    'inv_fb',
    'invIncome',
    'invOut',
    'invMove',
    'invMoveIn',
    'invSaleOut',
    'invSaleReturnOut',

    'invJustify',
    'invConvert',
    'invInReturn',
  ],
  ALL_ORIGINS: [
    'main',
    'cash',
    'bank',
    'receivable',
    'payable',
    'inv_fb',
    'invIncome',
    'invOut',
    'invMove',
    'invMoveIn',
    'invSale',
    'invSaleReturn',
    'tax',
  ],
  ALL_WITH_CURRENCIES: [
    'cash',
    'bank',
    'receivable',
    'payable',
  ],
  SINGLES: [
    'main',
    'cash',
    'bank',
    'receivable',
    'payable',
    'tax'
  ]
};

export const TR_FOLLOW_TYPES = {
  VAT: 'vat',
  CTAX: 'ctax',
  EXCHANGE_DIFF: 'exchangeDiff',
  INV_INCOME_EXPENSE: 'invIncomeExpense',
  INV_SALE_OUT: 'invSaleOut',
  INV_SALE_COST: 'invSaleCost',
  INV_SALE_RETURN_OUT: 'invSaleReturnOut',
  INV_SALE_RETURN_COST: 'invSaleReturnCost',
  INV_MOVE_IN: 'invMoveIn',
  ALL: [
    'vat',
    'ctax',
    'exchangeDiff',
    'invIncomeExpense',
    'invSaleOut',
    'invSaleCost',
    'invSaleReturnOut',
    'invSaleReturnCost',
    'invMoveIn',
  ],
};

export const TR_DETAIL_FOLLOW_TYPES = {
  SALE_OUT: 'saleOut',
  SALE_COST: 'saleCost',
  MOVE_IN: 'moveIn',
  ALL: ['saleOut', 'saleCost', 'moveIn'],
};
