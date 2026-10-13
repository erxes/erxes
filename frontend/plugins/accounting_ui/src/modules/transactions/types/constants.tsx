export const ACC_TRS__PER_PAGE = 30;

export enum TrJournalEnum {
  MAIN = 'main',
  CASH = 'cash',
  BANK = 'bank',
  RECEIVABLE = 'receivable',
  PAYABLE = 'payable',
  EXCHANGE_DIFF = 'exchangeDiff',
  TAX = 'tax',

  INV_INCOME = 'invIncome',
  INV_OUT = 'invOut',
  INV_JUSTIFY = 'invJustify',

  INV_MOVE = 'invMove',
  INV_MOVE_IN = 'invMoveIn',

  INV_SALE = 'invSale',
  INV_SALE_OUT = 'invSaleOut',
  INV_SALE_COST = 'invSaleCost',

  INV_SALE_RETURN = 'invSaleReturn',
  INV_SALE_RETURN_OUT = 'invSaleReturnOut',
  INV_SALE_RETURN_COST = 'invSaleReturnCost',

  FXA_INCOME = 'fxaIncome',
  FXA_OUT = 'fxaOut',
  FXA_DEP = 'fxaDep',
  FXA_DEP_IN = 'fxaDepIn',
  FXA_DEP_OUT = 'fxaDepOut',
  FXA_SALE_OUT = 'fxaSaleOut',
  FXA_SALE_COST = 'fxaSaleCost',
  FXA_MOVE = 'fxaMove',
  FXA_MOVE_IN = 'fxaMoveIn',
  FXA_SALE = 'fxaSale',
}

export const TR_JOURNAL_LABELS = {
  [TrJournalEnum.MAIN]: 'general',
  [TrJournalEnum.TAX]: 'tax',
  [TrJournalEnum.CASH]: 'cash-label',
  [TrJournalEnum.BANK]: 'bank',
  [TrJournalEnum.RECEIVABLE]: 'accounts-receivable',
  [TrJournalEnum.PAYABLE]: 'accounts-payable',
  [TrJournalEnum.EXCHANGE_DIFF]: 'exchange-rate-difference',

  [TrJournalEnum.INV_INCOME]: 'inventory-receipt',
  [TrJournalEnum.INV_OUT]: 'inventory-issue',
  [TrJournalEnum.INV_JUSTIFY]: 'inventory-cost-adjustment',

  [TrJournalEnum.INV_MOVE]: 'internal-transfer',
  [TrJournalEnum.INV_MOVE_IN]: 'internal-transfer-receipt',

  [TrJournalEnum.INV_SALE]: 'sales',
  [TrJournalEnum.INV_SALE_OUT]: 'sales-inventory-issue',
  [TrJournalEnum.INV_SALE_COST]: 'sales-cost-of-goods-sold',

  [TrJournalEnum.INV_SALE_RETURN]: 'sales-return-label',
  [TrJournalEnum.INV_SALE_RETURN_OUT]: 'sales-return-inventory-issue',
  [TrJournalEnum.INV_SALE_RETURN_COST]: 'sales-return-cost-of-goods-sold',

  [TrJournalEnum.FXA_INCOME]: 'fixed-asset-acquisition',
  [TrJournalEnum.FXA_OUT]: 'fixed-asset-disposal',
  [TrJournalEnum.FXA_DEP]: 'fixed-asset-depreciation',
  [TrJournalEnum.FXA_DEP_IN]:
    'fixed-asset-acquisition-accumulated-depreciation',
  [TrJournalEnum.FXA_DEP_OUT]: 'fixed-asset-disposal-accumulated-depreciation',
  [TrJournalEnum.FXA_SALE_OUT]: 'fixed-asset-sale-disposal',
  [TrJournalEnum.FXA_SALE_COST]: 'fixed-asset-sale-cost-of-goods-sold',
  [TrJournalEnum.FXA_MOVE]: 'fixed-asset-transfer',
  [TrJournalEnum.FXA_MOVE_IN]: 'fixed-asset-transfer-receipt',
  [TrJournalEnum.FXA_SALE]: 'fixed-asset-sale',
};

export const TR_PERFECT_JOURNALS = [
  TrJournalEnum.INV_MOVE,
  TrJournalEnum.FXA_MOVE,
];

export const ORIGIN_TR_JOURNALS = [
  TrJournalEnum.MAIN,
  TrJournalEnum.TAX,
  TrJournalEnum.CASH,
  TrJournalEnum.BANK,
  TrJournalEnum.RECEIVABLE,
  TrJournalEnum.PAYABLE,
  TrJournalEnum.INV_INCOME,
  TrJournalEnum.INV_OUT,
  TrJournalEnum.INV_JUSTIFY,
  TrJournalEnum.INV_MOVE,
  TrJournalEnum.INV_SALE,
  TrJournalEnum.INV_SALE_RETURN,
  TrJournalEnum.FXA_INCOME,
  TrJournalEnum.FXA_OUT,
  TrJournalEnum.FXA_MOVE,
  TrJournalEnum.FXA_SALE,
];

export const TR_SIDES = {
  DEBIT: 'dt' as const,
  CREDIT: 'ct' as const,
  ALL: ['dt', 'ct'],
  ENUM: { DT: 'dt', CT: 'ct' } as const,
  OPTIONS: [
    { value: 'dt', label: 'debit' },
    { value: 'ct', label: 'credit' },
  ],
  FUND_OPTIONS: [
    { value: 'dt', label: 'receipt' },
    { value: 'ct', label: 'issue' },
  ],
  JUSTIFY_OPTIONS: [
    { value: 'dt', label: 'cost-increase' },
    { value: 'ct', label: 'cost-decrease' },
  ],
  RECEIVABLE_OPTIONS: [
    { value: 'dt', label: 'create' },
    { value: 'ct', label: 'close' },
  ],
  PAYABLE_OPTIONS: [
    { value: 'dt', label: 'close' },
    { value: 'ct', label: 'create' },
  ],
};

export const INV_INCOME_EXPENSE_TYPES = [
  { value: 'amount', label: 'amount' },
  { value: 'count', label: 'quantity' },
  { value: 'weight', label: 'weight' },
];

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
};

export const TR_STATUS_LABELS: Record<string, string> = {
  // future level
  plan: 'planned',
  // conversation level
  draft: 'draft',
  mentioned: 'request',
  approved: 'authorized',
  rejeced: 'rejected',
  returned: 'response-request',
  // business level
  progress: 'in-progress',
  assigned: 'approve',
  confirmed: 'approved-label',
  canelled: 'cancelled',

  complete: 'complete-label',
};

export const TR_STATUS_OPTIONS = TR_STATUSES.ALL.map((status) => ({
  value: status,
  label: TR_STATUS_LABELS[status] || status,
}));

export const TR_STATUS_GROUPS = [
  {
    label: 'PUBLISHED',
    values: [
      TR_STATUSES.PROGRESS,
      TR_STATUSES.ASSIGNED,
      TR_STATUSES.CONFIRMED,
      TR_STATUSES.CANELLED,
      TR_STATUSES.COMPLETE,
    ],
  },
  {
    label: 'DRAFTED',
    values: [
      TR_STATUSES.DRAFT,
      TR_STATUSES.MENTIONED,
      TR_STATUSES.APPROVED,
      TR_STATUSES.REJECED,
      TR_STATUSES.RETURNED,
    ],
  },
  {
    label: '',
    values: [TR_STATUSES.PLAN],
  },
];
