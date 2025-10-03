export const ACC_TRS__PER_PAGE = 20;

export enum TrJournalEnum {
  MAIN = 'main',
  CASH = 'cash',
  BANK = 'bank',
  RECEIVABLE = 'receivable',
  PAYABLE = 'payable',
  INVENTORY = 'inventory',
  FIXED_ASSET = 'fixedAsset',
  TAX = 'tax',
  INV_INCOME = 'invIncome',
  INV_OUT = 'invOut',
  INV_MOVE = 'invMove',
  INV_SALE = 'invSale',

  INV_SALE_OUT = 'invSaleOut',
  INV_SALE_COST = 'invSaleCost',
}

export const TR_JOURNAL_LABELS = {
  [TrJournalEnum.MAIN]: 'Main',
  [TrJournalEnum.CASH]: 'Cash',
  [TrJournalEnum.BANK]: 'Bank',
  [TrJournalEnum.RECEIVABLE]: 'Receivable',
  [TrJournalEnum.PAYABLE]: 'Payable',
  [TrJournalEnum.INVENTORY]: 'Inventory',
  [TrJournalEnum.FIXED_ASSET]: 'Fixed Asset',
  [TrJournalEnum.TAX]: 'Tax',
  [TrJournalEnum.INV_INCOME]: 'Inventory Income',
  [TrJournalEnum.INV_OUT]: 'Inventory Out',
  [TrJournalEnum.INV_MOVE]: 'Inventory Move',
  [TrJournalEnum.INV_SALE]: 'Inventory Sale',
};

export const TR_PERFECT_JOURNALS = [
  TrJournalEnum.INV_MOVE,
]

export const TR_SIDES = {
  DEBIT: 'dt' as const,
  CREDIT: 'ct' as const,
  ALL: ['dt', 'ct'],
  ENUM: { DT: 'dt', CT: 'ct' } as const,
  OPTIONS: [{ value: 'dt', label: 'debit' }, { value: 'ct', label: 'credit' }],
  FUND_OPTIONS: [{ value: 'dt', label: 'incoming' }, { value: 'ct', label: 'outgoing' }],
  RECEIVABLE_OPTIONS: [{ value: 'dt', label: 'open' }, { value: 'ct', label: 'close' }],
  PAYABLE_OPTIONS: [{ value: 'dt', label: 'close' }, { value: 'ct', label: 'open' }],
}

export const INV_INCOME_EXPENSE_TYPES = [
  { value: 'amount', label: 'Amount' },
  { value: 'count', label: 'Count' }
]
