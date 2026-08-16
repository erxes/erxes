import { debtReportBase } from './debt';
import { fixedAssetReportBase } from './fixedAsset';
import { fundReportBase } from './fund';
import {
  inventoryByPriceReportBase,
  inventoryCostReportBase,
  inventoryProfitReportBase,
  inventorySaleCostPeriodReportBase,
  inventorySaleCostReportBase,
  inventorySaleDailyReportBase,
  inventorySaleReportBase,
  inventorySellerSubsysReportBase,
  inventoryShipperReportBase,
} from './inventory';
import {
  accountStatementReportBase,
  generalLedgerReportBase,
  mainJournalReportBase,
  mainJournalSummaryReportBase,
  trialBalanceReportBase,
} from './main';

export const JOURNAL_REPORT_BASES = {
  ac: accountStatementReportBase,
  tb: trialBalanceReportBase,
  mj: mainJournalReportBase,
  mjs: mainJournalSummaryReportBase,
  mb: generalLedgerReportBase,
  fund: fundReportBase,
  debt: debtReportBase,
  invCost: inventoryCostReportBase,
  invSale: inventorySaleReportBase,
  invSaleCost: inventorySaleCostReportBase,
  invSaleCostPeriod: inventorySaleCostPeriodReportBase,
  invByPrice: inventoryByPriceReportBase,
  invProfit: inventoryProfitReportBase,
  invShipper: inventoryShipperReportBase,
  invSaleDaily: inventorySaleDailyReportBase,
  invSellerSubsys: inventorySellerSubsysReportBase,
  fxa: fixedAssetReportBase,
};

export type JournalReportCode = keyof typeof JOURNAL_REPORT_BASES;

export const getReportBase = (report: string) =>
  JOURNAL_REPORT_BASES[report as JournalReportCode];
