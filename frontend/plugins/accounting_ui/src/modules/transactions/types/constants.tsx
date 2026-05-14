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

  INV_SALE_RETURN = 'invSaleReturn',
  INV_SALE_RETURN_OUT = 'invSaleReturnOut',
  INV_SALE_RETURN_COST = 'invSaleReturnCost',

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

  [TrJournalEnum.INV_SALE_RETURN]: 'Борлуулалтын Буцаалт',
  [TrJournalEnum.INV_SALE_RETURN_OUT]: 'Б.Буцаалт-зарлага',
  [TrJournalEnum.INV_SALE_RETURN_COST]: 'Б.Буцаалт-ББӨ',

  [TrJournalEnum.FIXED_ASSET]: 'Үндсэн хөрөнгө',
};

export const TR_PERFECT_JOURNALS = [TrJournalEnum.INV_MOVE];
export const ORIGIN_TR_JOURNALS = [
  TrJournalEnum.MAIN,
  TrJournalEnum.TAX,
  TrJournalEnum.CASH,
  TrJournalEnum.BANK,
  TrJournalEnum.RECEIVABLE,
  TrJournalEnum.PAYABLE,
  TrJournalEnum.INV_INCOME,
  TrJournalEnum.INV_OUT,
  TrJournalEnum.INV_MOVE,
  TrJournalEnum.INV_SALE,
  TrJournalEnum.INV_SALE_RETURN,
];

export const TR_SIDES = {
  DEBIT: 'dt' as const,
  CREDIT: 'ct' as const,
  ALL: ['dt', 'ct'],
  ENUM: { DT: 'dt', CT: 'ct' } as const,
  OPTIONS: [
    { value: 'dt', label: 'Дебет' },
    { value: 'ct', label: 'Кредит' },
  ],
  FUND_OPTIONS: [
    { value: 'dt', label: 'Орлого' },
    { value: 'ct', label: 'Зарлага' },
  ],
  RECEIVABLE_OPTIONS: [
    { value: 'dt', label: 'Үүсгэх' },
    { value: 'ct', label: 'Хаах' },
  ],
  PAYABLE_OPTIONS: [
    { value: 'dt', label: 'Хаах' },
    { value: 'ct', label: 'Үүсгэх' },
  ],
};

export const INV_INCOME_EXPENSE_TYPES = [
  { value: 'amount', label: 'Дүн' },
  { value: 'count', label: 'Тоо' },
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
}

export const TR_STATUS_LABELS: Record<string, string> = {
  // future level
  plan: 'Төлөвлөгөөт',
  // conversation level
  draft: 'Ноорог',
  mentioned: 'Хүсэлт',
  approved: 'Зөвшөөрсөн',
  rejeced: 'Татгалзсан',
  returned: 'Хариу хүсэлт',
  // business level
  progress: 'Хэрэгжүүлж буй',
  assigned: 'Баталгаажуулах',
  confirmed: 'Баталсан',
  canelled: 'Цуцалсан',

  complete: 'Бүрэн',
};

export const TR_STATUS_OPTIONS = TR_STATUSES.ALL.map((status) => ({
  value: status,
  label: TR_STATUS_LABELS[status] || status,
}));

export const TR_STATUS_GROUPS = [
  {
    label: 'Хүсэлт',
    values: [
      TR_STATUSES.DRAFT,
      TR_STATUSES.MENTIONED,
      TR_STATUSES.APPROVED,
      TR_STATUSES.REJECED,
      TR_STATUSES.RETURNED,
    ],
  },
  {
    label: 'Гүйцэтгэл',
    values: [
      TR_STATUSES.PROGRESS,
      TR_STATUSES.ASSIGNED,
      TR_STATUSES.CONFIRMED,
      TR_STATUSES.CANELLED,
      TR_STATUSES.COMPLETE,
    ],
  },
  {
    label: 'Төлөвлөгөө',
    values: [TR_STATUSES.PLAN],
  },
];
