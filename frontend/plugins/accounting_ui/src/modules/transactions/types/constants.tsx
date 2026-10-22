import {
  IconBook,
  IconBuildingBank,
  IconBuildingFactory2,
  IconCalculator,
  IconPackage,
} from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';

export const ACC_TRS__PER_PAGE = 30;
export const RECEIPTS_STRUCTURE_PAGE_SIZE = 100;

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

export type TrJournalGroupItem = {
  journal: TrJournalEnum;
  label: string;
  hideInForm?: boolean;
  hideInAdd?: boolean;
};

export type TrJournalGroup = {
  label: string;
  icon: Icon;
  items: TrJournalGroupItem[];
};

export const TR_JOURNAL_GROUPS: TrJournalGroup[] = [
  {
    label: 'general',
    icon: IconBook,
    items: [
      { journal: TrJournalEnum.MAIN, label: 'general-journal' },
      { journal: TrJournalEnum.TAX, label: 'tax', hideInAdd: true },
    ],
  },
  {
    label: 'cash-and-bank',
    icon: IconBuildingBank,
    items: [
      { journal: TrJournalEnum.CASH, label: 'cash-label' },
      { journal: TrJournalEnum.BANK, label: 'bank' },
    ],
  },
  {
    label: 'calculation',
    icon: IconCalculator,
    items: [
      { journal: TrJournalEnum.RECEIVABLE, label: 'accounts-receivable' },
      { journal: TrJournalEnum.PAYABLE, label: 'accounts-payable' },
    ],
  },
  {
    label: 'inventory-label',
    icon: IconPackage,
    items: [
      { journal: TrJournalEnum.INV_INCOME, label: 'receipt' },
      { journal: TrJournalEnum.INV_OUT, label: 'supplies-issue' },
      { journal: TrJournalEnum.INV_JUSTIFY, label: 'cost-adjustment' },
      {
        journal: TrJournalEnum.INV_MOVE,
        label: 'internal-transfer',
        hideInForm: true,
      },
      { journal: TrJournalEnum.INV_SALE, label: 'sale' },
      { journal: TrJournalEnum.INV_SALE_RETURN, label: 'sales-return' },
    ],
  },
  {
    label: 'fixed-asset',
    icon: IconBuildingFactory2,
    items: [
      { journal: TrJournalEnum.FXA_INCOME, label: 'receipt' },
      { journal: TrJournalEnum.FXA_OUT, label: 'disposal' },
      { journal: TrJournalEnum.FXA_MOVE, label: 'movement' },
      { journal: TrJournalEnum.FXA_SALE, label: 'sale' },
    ],
  },
];

export const ORIGIN_TR_JOURNALS = TR_JOURNAL_GROUPS.flatMap((group) =>
  group.items.map((item) => item.journal),
);

export type TrRecordJournalGroup = {
  label: string;
  icon: Icon;
  journals: TrJournalEnum[];
};

export const TR_RECORD_JOURNAL_GROUPS: TrRecordJournalGroup[] = [
  {
    label: 'general',
    icon: IconBook,
    journals: [
      TrJournalEnum.MAIN,
      TrJournalEnum.TAX,
      TrJournalEnum.EXCHANGE_DIFF,
    ],
  },
  {
    label: 'cash-and-bank',
    icon: IconBuildingBank,
    journals: [TrJournalEnum.CASH, TrJournalEnum.BANK],
  },
  {
    label: 'calculation',
    icon: IconCalculator,
    journals: [TrJournalEnum.RECEIVABLE, TrJournalEnum.PAYABLE],
  },
  {
    label: 'inventory-label',
    icon: IconPackage,
    journals: [
      TrJournalEnum.INV_INCOME,
      TrJournalEnum.INV_OUT,
      TrJournalEnum.INV_JUSTIFY,
      TrJournalEnum.INV_MOVE,
      TrJournalEnum.INV_MOVE_IN,
      TrJournalEnum.INV_SALE,
      TrJournalEnum.INV_SALE_OUT,
      TrJournalEnum.INV_SALE_COST,
      TrJournalEnum.INV_SALE_RETURN,
      TrJournalEnum.INV_SALE_RETURN_OUT,
      TrJournalEnum.INV_SALE_RETURN_COST,
    ],
  },
  {
    label: 'fixed-asset',
    icon: IconBuildingFactory2,
    journals: [
      TrJournalEnum.FXA_INCOME,
      TrJournalEnum.FXA_DEP_IN,
      TrJournalEnum.FXA_OUT,
      TrJournalEnum.FXA_DEP_OUT,
      TrJournalEnum.FXA_DEP,
      TrJournalEnum.FXA_MOVE,
      TrJournalEnum.FXA_MOVE_IN,
      TrJournalEnum.FXA_SALE,
      TrJournalEnum.FXA_SALE_OUT,
      TrJournalEnum.FXA_SALE_COST,
    ],
  },
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
    { value: 'dt', label: 'cash-receipt' },
    { value: 'ct', label: 'cash-payment' },
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
  assigned: 'assigned',
  confirmed: 'approved-label',
  canelled: 'cancelled',

  complete: 'complete',
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
