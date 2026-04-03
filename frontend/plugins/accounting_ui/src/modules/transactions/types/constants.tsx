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
  
  INV_MOVE = 'invMove',
  INV_MOVE_IN = 'invMoveIn',
  
  INV_SALE = 'invSale',
  INV_SALE_OUT = 'invSaleOut',
  INV_SALE_COST = 'invSaleCost',

  FIXED_ASSET = 'fixedAsset',
}

export const TR_JOURNAL_LABELS = {
  [TrJournalEnum.MAIN]: 'Ерөнхий',
  [TrJournalEnum.TAX]: 'Татвар',
  [TrJournalEnum.CASH]: 'Касс',
  [TrJournalEnum.BANK]: 'Харилцах',
  [TrJournalEnum.RECEIVABLE]: 'Авлага',
  [TrJournalEnum.PAYABLE]: 'Өглөг',
  [TrJournalEnum.EXCHANGE_DIFF]: 'Ханшийн зөрүү',

  [TrJournalEnum.INV_INCOME]: 'Барааны орлого',
  [TrJournalEnum.INV_OUT]: 'Барааны зарлага',
  
  [TrJournalEnum.INV_MOVE]: 'Дотоод хөдөлгөөн',
  [TrJournalEnum.INV_MOVE_IN]: 'Дот.Хөд орлого',

  [TrJournalEnum.INV_SALE]: 'Борлуулалт',
  [TrJournalEnum.INV_SALE_OUT]: 'Борлуулалт-зарлага',
  [TrJournalEnum.INV_SALE_COST]: 'Борлуулалт-ББӨ',

  [TrJournalEnum.FIXED_ASSET]: 'Fixed Asset',
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
