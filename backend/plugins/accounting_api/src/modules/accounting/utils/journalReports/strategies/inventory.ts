import { JOURNALS } from '../../../@types/constants';
import { IJournalReportBase } from '../maps';

export const inventoryCostReportBase: IJournalReportBase = {
  code: 'invCost',
  baseGroups: ['accountId', 'productId'],
  extraTransactionMatch: { journal: { $in: JOURNALS.ALL_REAL_INV } },
  extraDetailMatch: { 'details.productId': { $exists: true, $ne: '' } },
  sums: {
    sumAmount: { $sum: '$details.amount' },
    sumCount: { $sum: '$details.count' },
    sumCurrencyAmount: { $sum: '$details.currencyAmount' },
  },
};

export const inventorySaleReportBase: IJournalReportBase = {
  code: 'invSale',
  baseGroups: ['productId', 'journal'],
  periodMode: 'between',
  extraTransactionMatch: {
    journal: { $in: [JOURNALS.INV_SALE, JOURNALS.INV_SALE_RETURN] },
  },
  extraDetailMatch: { 'details.productId': { $exists: true, $ne: '' } },
  sums: {
    sumAmount: { $sum: '$details.amount' },
    sumCount: { $sum: '$details.count' },
  },
};

export const inventorySaleCostReportBase: IJournalReportBase = {
  code: 'invSaleCost',
  baseGroups: ['productId', 'journal'],
  periodMode: 'between',
  extraTransactionMatch: {
    journal: {
      $in: [
        JOURNALS.INV_SALE,
        JOURNALS.INV_SALE_RETURN,
        JOURNALS.INV_SALE_OUT,
        JOURNALS.INV_SALE_RETURN_OUT,
      ],
    },
  },
  extraDetailMatch: { 'details.productId': { $exists: true, $ne: '' } },
  sums: {
    sumAmount: { $sum: '$details.amount' },
    sumCount: { $sum: '$details.count' },
  },
};

export const inventorySaleCostPeriodReportBase: IJournalReportBase = {
  ...inventorySaleCostReportBase,
  code: 'invSaleCostPeriod',
  baseGroups: ['productId', 'journal'],
};

export const inventoryByPriceReportBase: IJournalReportBase = {
  code: 'invByPrice',
  baseGroups: ['productId', 'journal'],
  extraTransactionMatch: { journal: { $in: JOURNALS.ALL_REAL_INV } },
  extraDetailMatch: { 'details.productId': { $exists: true, $ne: '' } },
  sums: {
    sumAmount: { $sum: '$details.amount' },
    sumCount: { $sum: '$details.count' },
  },
};

export const inventoryProfitReportBase: IJournalReportBase = {
  code: 'invProfit',
  baseGroups: ['productId'],
  extraTransactionMatch: { journal: { $in: JOURNALS.ALL_REAL_INV } },
  extraDetailMatch: { 'details.productId': { $exists: true, $ne: '' } },
  sums: {
    sumAmount: { $sum: '$details.amount' },
    sumCount: { $sum: '$details.count' },
  },
};

export const inventoryShipperReportBase: IJournalReportBase = {
  code: 'invShipper',
  baseGroups: ['productId', 'journal'],
  extraTransactionMatch: { journal: { $in: JOURNALS.ALL_REAL_INV } },
  extraDetailMatch: { 'details.productId': { $exists: true, $ne: '' } },
  sums: {
    sumAmount: { $sum: '$details.amount' },
    sumCount: { $sum: '$details.count' },
  },
};

export const inventorySaleDailyReportBase: IJournalReportBase = {
  code: 'invSaleDaily',
  baseGroups: ['ptrId'],
  recordMode: 'line',
  extraTransactionMatch: {
    journal: {
      $in: [
        JOURNALS.INV_INCOME,
        JOURNALS.INV_OUT,
        JOURNALS.INV_MOVE,
        JOURNALS.INV_MOVE_IN,
        JOURNALS.INV_SALE,
        JOURNALS.INV_SALE_RETURN,
      ],
    },
  },
  extraDetailMatch: { 'details.productId': { $exists: true, $ne: '' } },
};

export const inventorySellerSubsysReportBase: IJournalReportBase = {
  code: 'invSellerSubsys',
  baseGroups: ['contentId', 'ptrId', 'accountId'],
  recordMode: 'line',
  extraTransactionMatch: {
    contentId: { $exists: true, $ne: '' },
    journal: {
      $in: [
        JOURNALS.CASH,
        JOURNALS.BANK,
        JOURNALS.RECEIVABLE,
        JOURNALS.PAYABLE,
        JOURNALS.INV_SALE,
        JOURNALS.INV_SALE_RETURN,
        JOURNALS.INV_SALE_OUT,
        JOURNALS.INV_SALE_RETURN_OUT,
      ],
    },
  },
};
