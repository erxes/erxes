import { ReportRules } from '../types/reportsMap';

export interface IReportHeaderCell {
  label: string;
  rowSpan?: number;
  colSpan?: number;
}

export type ReportHeaderRows = IReportHeaderCell[][];

const codeNameHeaderCells: IReportHeaderCell[] = [
  { label: 'code' },
  { label: 'name' },
];

const createSimpleHeaderRows = (
  valueLabels: string[],
  groupLabels: IReportHeaderCell[] = codeNameHeaderCells,
): ReportHeaderRows => [
  [...groupLabels, ...valueLabels.map((label) => ({ label }))],
];

const balanceHeaderRows: ReportHeaderRows = [
  [
    { label: 'code', rowSpan: 2 },
    { label: 'name', rowSpan: 2 },
    { label: 'opening-balance', colSpan: 2 },
    { label: 'transaction', colSpan: 2 },
    { label: 'closing-balance', colSpan: 2 },
  ],
  [
    { label: 'debit' },
    { label: 'credit' },
    { label: 'debit' },
    { label: 'credit' },
    { label: 'debit' },
    { label: 'credit' },
  ],
];

const costHeaderRows: ReportHeaderRows = [
  [
    { label: 'code', rowSpan: 2 },
    { label: 'name', rowSpan: 2 },
    { label: 'opening-balance', colSpan: 2 },
    { label: 'receipts', colSpan: 2 },
    { label: 'issues', colSpan: 2 },
    { label: 'closing-balance', colSpan: 2 },
    { label: 'unit-cost', rowSpan: 2 },
  ],
  [
    { label: 'quantity' },
    { label: 'amount' },
    { label: 'quantity' },
    { label: 'amount' },
    { label: 'quantity' },
    { label: 'amount' },
    { label: 'quantity' },
    { label: 'amount' },
  ],
];

const inventoryPriceHeaderRows: ReportHeaderRows = [
  [
    { label: 'code', rowSpan: 2 },
    { label: 'name', rowSpan: 2 },
    { label: 'unit-price', rowSpan: 2 },
    { label: 'opening-balance', colSpan: 2 },
    { label: 'receipts', colSpan: 2 },
    { label: 'internal-transfer', colSpan: 2 },
    { label: 'other-issues', colSpan: 2 },
    { label: 'sale', colSpan: 4 },
    { label: 'closing-balance', colSpan: 2 },
  ],
  [
    { label: 'quantity' },
    { label: 'amount' },
    { label: 'quantity' },
    { label: 'amount' },
    { label: 'receipts' },
    { label: 'issues' },
    { label: 'quantity' },
    { label: 'amount' },
    { label: 'quantity' },
    { label: 'sold' },
    { label: 'for-sale' },
    { label: 'discount' },
    { label: 'quantity' },
    { label: 'amount' },
  ],
];

const reportHeaderRowsByCode: Record<string, ReportHeaderRows> = {
  ac: balanceHeaderRows,
  tb: balanceHeaderRows,
  mb: balanceHeaderRows,
  fund: balanceHeaderRows,
  debt: balanceHeaderRows,
  mj: createSimpleHeaderRows(
    ['debit', 'credit'],
    [{ label: 'date-account' }, { label: 'description-account-name' }],
  ),
  mjs: createSimpleHeaderRows(
    [
      'transaction-description',
      'debit-account',
      'credit-account',
      'amount',
      'difference',
    ],
    [{ label: 'date' }, { label: 'document-number' }],
  ),
  invCost: costHeaderRows,
  fxa: costHeaderRows,
  invSale: createSimpleHeaderRows([
    'quantity',
    'unit-price',
    'total-sales',
    'amount-including-vat',
  ]),
  invSaleCost: createSimpleHeaderRows([
    'quantity',
    'unit-price',
    'total-sales',
    'unit-cost',
    'total-cost',
    'total-profit',
  ]),
  invSaleCostPeriod: createSimpleHeaderRows([
    'quantity',
    'unit-price',
    'total-sales',
    'unit-cost',
    'total-cost',
    'total-profit',
  ]),
  invByPrice: inventoryPriceHeaderRows,
  invProfit: createSimpleHeaderRows([
    'closing-quantity',
    'unit-cost',
    'total-cost',
    'unit-price',
    'total-value',
    'profit-amount',
  ]),
  invShipper: createSimpleHeaderRows([
    'opening-quantity',
    'opening-cost',
    'receipt-quantity',
    'receipt-cost',
    'return-quantity',
    'return-cost',
    'other-quantity',
    'other-cost',
    'closing-quantity',
    'closing-cost',
  ]),
  invSaleDaily: createSimpleHeaderRows([
    'document',
    'description',
    'contact',
    'quantity',
    'amount',
    'debit',
    'credit',
  ]),
  invSellerSubsys: createSimpleHeaderRows([
    'document',
    'description',
    'contact',
    'quantity',
    'amount',
    'debit',
    'credit',
  ]),
};

export const getReportHeaderRows = (report: string) =>
  reportHeaderRowsByCode[report] || [];

export const getReportColumnCount = (report: string) => {
  const valueColumnCount = ReportRules[report]?.colCount || 0;

  return valueColumnCount ? valueColumnCount + 2 : 0;
};
