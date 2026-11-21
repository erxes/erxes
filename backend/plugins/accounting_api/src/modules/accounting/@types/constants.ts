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
  FXA_FOLLOW: 'fxaFollow',
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
    'fxaFollow',
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

const TRANSACTION_STATUS = {
  ESTIMATED: 'estimated',
  COMPLETE: 'complete',
  EXECUTING: 'executing',
  REQUESTED: 'requested',
  DRAFT: 'draft',
  MENTIONED: 'mentioned',
  PLAN: 'plan',
};

const REAL_STATUSES = [
  TRANSACTION_STATUS.ESTIMATED,
  TRANSACTION_STATUS.COMPLETE,
];
const SOON_STATUSES = [
  TRANSACTION_STATUS.EXECUTING,
  TRANSACTION_STATUS.REQUESTED,
];
const OMIT_STATUSES = [
  TRANSACTION_STATUS.DRAFT,
  TRANSACTION_STATUS.MENTIONED,
  TRANSACTION_STATUS.PLAN,
];

export const TR_STATUSES = {
  ...TRANSACTION_STATUS,
  ALL: [...REAL_STATUSES, ...SOON_STATUSES, ...OMIT_STATUSES],
  ACTIVE: REAL_STATUSES,
};

export const TRANSACTION_STATUS_TYPES = {
  OMIT: 'omit',
  SOON: 'soon',
  REAL: 'real',
  OMIT_STATUSES,
  SOON_STATUSES,
  REAL_STATUSES,
};

/** The accounting tier of a status; unknown or missing statuses are omitted. */
export const getTransactionStatusType = (status?: string) => {
  if (REAL_STATUSES.includes(status || ''))
    return TRANSACTION_STATUS_TYPES.REAL;
  if (SOON_STATUSES.includes(status || ''))
    return TRANSACTION_STATUS_TYPES.SOON;
  return TRANSACTION_STATUS_TYPES.OMIT;
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
  INV_JUSTIFY: 'invJustify',
  INV_MOVE: 'invMove',
  INV_MOVE_IN: 'invMoveIn',
  INV_SALE: 'invSale',
  INV_SALE_COST: 'invSaleCost',
  INV_SALE_OUT: 'invSaleOut',
  INV_SALE_RETURN: 'invSaleReturn',
  INV_SALE_RETURN_COST: 'invSaleReturnCost',
  INV_SALE_RETURN_OUT: 'invSaleReturnOut',
  FXA_CAPITAL: 'fxaCapital',
  FXA_REVALUATION: 'fxaRevaluation',
  FXA_REVALUATION_RESULT: 'fxaRevaluationResult',
  FXA_DEFERRED_TAX: 'fxaDeferredTax',
  FXA_INCOME: 'fxaIncome',
  FXA_OUT: 'fxaOut',
  FXA_DEP: 'fxaDep',
  FXA_DEP_IN: 'fxaDepIn',
  FXA_DEP_OUT: 'fxaDepOut',
  FXA_SALE: 'fxaSale',
  FXA_SALE_OUT: 'fxaSaleOut',
  FXA_SALE_COST: 'fxaSaleCost',
  FXA_MOVE: 'fxaMove',
  FXA_MOVE_IN: 'fxaMoveIn',
  CLOSING: 'closing',
  // INV_IN_RETURN: 'invInReturn',
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
    'invJustify',
    'invMove',
    'invMoveIn',
    'invSale',
    'invSaleOut',
    'invSaleCost',
    'invSaleReturn',
    'invSaleReturnOut',
    'invSaleReturnCost',
    'fxaCapital',
    'fxaRevaluation',
    'fxaRevaluationResult',
    'fxaDeferredTax',
    'fxaIncome',
    'fxaOut',
    'fxaDep',
    'fxaDepIn',
    'fxaDepOut',
    'fxaSale',
    'fxaSaleOut',
    'fxaSaleCost',
    'fxaMove',
    'fxaMoveIn',
    'expense',
    'exchangeDiff',
    'closing',
  ],
  ALL_REAL_INV: [
    // yag urtug uldegdeld nuluuluh journal ni
    'inv_fb',
    'invIncome',
    'invOut',
    'invJustify',
    'invMove',
    'invMoveIn',
    'invSaleOut',
    'invSaleReturnOut',

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
    'invJustify',
    'invMove',
    'invMoveIn',
    'invSale',
    'invSaleReturn',
    'fxaCapital',
    'fxaRevaluation',
    'fxaIncome',
    'fxaOut',
    'fxaMove',
    'fxaMoveIn',
    'fxaSale',
    'tax',
  ],
  ALL_WITH_CURRENCIES: ['cash', 'bank', 'receivable', 'payable'],
  SINGLES: [
    'main',
    'cash',
    'bank',
    'receivable',
    'payable',
    'tax',
    'fxaCapital',
    'fxaRevaluation',
    'fxaIncome',
    'fxaOut',
    'fxaMove',
    'fxaSale',
  ],
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
  INV_SPLIT_OUT: 'invSplitOut',
  INV_SPLIT_INCOME: 'invSplitIncome',
  FXA_DEP: 'fxaDep',
  FXA_DEP_IN: 'fxaDepIn',
  FXA_DEFERRED_TAX: 'fxaDeferredTax',
  FXA_REVALUATION_RESULT: 'fxaRevaluationResult',
  FXA_DEP_OUT: 'fxaDepOut',
  FXA_SALE_OUT: 'fxaSaleOut',
  FXA_SALE_COST: 'fxaSaleCost',
  FXA_MOVE_IN: 'fxaMoveIn',
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
    'invSplitOut',
    'invSplitIncome',
    'fxaDep',
    'fxaDepIn',
    'fxaDeferredTax',
    'fxaRevaluationResult',
    'fxaDepOut',
    'fxaSaleOut',
    'fxaSaleCost',
    'fxaMoveIn',
  ],
};

export const TR_DETAIL_FOLLOW_TYPES = {
  SALE_OUT: 'saleOut',
  SALE_COST: 'saleCost',
  MOVE_IN: 'moveIn',
  INV_SPLIT_OUT: 'invSplitOut',
  INV_SPLIT_INCOME: 'invSplitIncome',
  FXA_DEP: 'fxaDep',
  FXA_DEP_IN: 'fxaDepIn',
  FXA_DEFERRED_TAX: 'fxaDeferredTax',
  FXA_REVALUATION_RESULT: 'fxaRevaluationResult',
  FXA_DEP_OUT: 'fxaDepOut',
  FXA_SALE_OUT: 'fxaSaleOut',
  FXA_SALE_COST: 'fxaSaleCost',
  FXA_MOVE_IN: 'fxaMoveIn',
  ALL: [
    'saleOut',
    'saleCost',
    'moveIn',
    'invSplitOut',
    'invSplitIncome',
    'fxaDep',
    'fxaDepIn',
    'fxaDeferredTax',
    'fxaRevaluationResult',
    'fxaDepOut',
    'fxaSaleOut',
    'fxaSaleCost',
    'fxaMoveIn',
  ],
};
