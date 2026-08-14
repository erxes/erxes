import { displayNum, fixNum, ReportTable } from 'erxes-ui';
import { IGroupRule } from '~/modules/journal-reports/types/reportsMap';
import { CalcReportResult } from '..';

type InventoryRecord = {
  journal?: string;
  sumAmount?: number;
  sumCount?: number;
  amount?: number;
  debit?: number;
  credit?: number;
  count?: number;
  productUnitPrice?: number;
  isBetween?: number;
  number?: string;
  ptrNumber?: string;
  description?: string;
  customerCode?: string;
  customerName?: string;
  accountCode?: string;
  accountName?: string;
};

const INCOME_JOURNALS = new Set(['invIncome', 'invMoveIn']);
const OUT_JOURNALS = new Set(['invOut', 'invMove', 'invSaleOut']);
const SALE_JOURNALS = new Set(['invSale', 'invSaleReturn']);
const SALE_RETURN_JOURNALS = new Set(['invSaleReturn', 'invSaleReturnOut']);

const getItems = (dic: Record<string, unknown>) =>
  Array.isArray(dic.items) ? (dic.items as InventoryRecord[]) : [];

const signed = (record: InventoryRecord, value: number) =>
  SALE_RETURN_JOURNALS.has(record.journal || '') ? -1 * value : value;

const diffCount = (record: InventoryRecord) => {
  const count = record.sumCount || record.count || 0;
  return OUT_JOURNALS.has(record.journal || '') ? -1 * count : count;
};

const diffAmount = (record: InventoryRecord) => {
  const amount = record.sumAmount || record.amount || 0;
  return OUT_JOURNALS.has(record.journal || '') ? -1 * amount : amount;
};

export const HandleInvByPrice = (
  dic: Record<string, unknown>,
  _groupRule: IGroupRule,
  _attr: string,
): CalcReportResult => {
  const items = getItems(dic);
  let firstCount = 0;
  let incomeCount = 0;
  let moveIn = 0;
  let moveOut = 0;
  let outcomeCount = 0;
  let saleCount = 0;
  let saleHistory = 0;
  let lastCount = 0;
  const unitPrice = Number(items[0]?.productUnitPrice || 0);

  for (const record of items) {
    const count = record.sumCount || 0;

    if (!record.isBetween) {
      firstCount += diffCount(record);
    } else if (record.journal === 'invMoveIn') {
      moveIn += count;
    } else if (record.journal === 'invMove') {
      moveOut += count;
    } else if (SALE_JOURNALS.has(record.journal || '')) {
      saleCount += signed(record, count);
      saleHistory += signed(record, record.sumAmount || 0);
    } else if (INCOME_JOURNALS.has(record.journal || '')) {
      incomeCount += count;
    } else {
      outcomeCount += count;
    }

    lastCount += diffCount(record);
  }

  const firstValue = firstCount * unitPrice;
  const incomeValue = incomeCount * unitPrice;
  const outcomeValue = outcomeCount * unitPrice;
  const salePlan = saleCount * unitPrice;
  const lastValue = lastCount * unitPrice;

  return {
    lastNode: (
      <>
        <ReportTable.Cell>{displayNum(unitPrice)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(firstCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(firstValue)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(incomeCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(incomeValue)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(moveIn)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(moveOut)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(outcomeCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(outcomeValue)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(saleCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(saleHistory)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(salePlan)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(salePlan - saleHistory)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(lastCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(lastValue)}</ReportTable.Cell>
      </>
    ),
  };
};

export const HandleInvProfit = (
  dic: Record<string, unknown>,
  _groupRule: IGroupRule,
  _attr: string,
): CalcReportResult => {
  const items = getItems(dic);
  const remCount = items.reduce((sum, record) => sum + diffCount(record), 0);
  const sumCost = items.reduce((sum, record) => sum + diffAmount(record), 0);
  const unitPrice = Number(items[0]?.productUnitPrice || 0);
  const unitCost = fixNum(sumCost / remCount);
  const sumPrice = remCount * unitPrice;

  return {
    lastNode: (
      <>
        <ReportTable.Cell>{displayNum(remCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(unitCost)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(sumCost)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(unitPrice)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(sumPrice)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(sumPrice - sumCost)}</ReportTable.Cell>
      </>
    ),
  };
};

export const HandleInvShipper = (
  dic: Record<string, unknown>,
  _groupRule: IGroupRule,
  _attr: string,
): CalcReportResult => {
  const items = getItems(dic);
  let firstCount = 0;
  let firstCost = 0;
  let incomeCount = 0;
  let incomeCost = 0;
  let returnCount = 0;
  let returnCost = 0;
  let otherCount = 0;
  let otherCost = 0;
  let lastCount = 0;
  let lastCost = 0;

  for (const record of items) {
    if (!record.isBetween) {
      firstCount += diffCount(record);
      firstCost += diffAmount(record);
    } else if (INCOME_JOURNALS.has(record.journal || '')) {
      incomeCount += record.sumCount || 0;
      incomeCost += record.sumAmount || 0;
    } else if (SALE_RETURN_JOURNALS.has(record.journal || '')) {
      returnCount += record.sumCount || 0;
      returnCost += record.sumAmount || 0;
    } else {
      otherCount += diffCount(record);
      otherCost += diffAmount(record);
    }

    lastCount += diffCount(record);
    lastCost += diffAmount(record);
  }

  return {
    lastNode: (
      <>
        <ReportTable.Cell>{displayNum(firstCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(firstCost)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(incomeCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(incomeCost)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(returnCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(returnCost)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(otherCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(otherCost)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(lastCount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(lastCost)}</ReportTable.Cell>
      </>
    ),
  };
};

export const HandleInvLineSummary = (
  dic: Record<string, unknown>,
  _groupRule: IGroupRule,
  _attr: string,
): CalcReportResult => {
  const items = getItems(dic);
  const count = items.reduce((sum, record) => sum + (record.count || 0), 0);
  const amount = items.reduce((sum, record) => sum + (record.amount || 0), 0);
  const debit = items.reduce((sum, record) => sum + (record.debit || 0), 0);
  const credit = items.reduce((sum, record) => sum + (record.credit || 0), 0);
  const first = items[0] || {};

  return {
    lastNode: (
      <>
        <ReportTable.Cell className="text-left">
          {first.ptrNumber || first.number || ''}
        </ReportTable.Cell>
        <ReportTable.Cell className="text-left">
          {first.description || ''}
        </ReportTable.Cell>
        <ReportTable.Cell className="text-left">
          {[first.customerCode, first.customerName].filter(Boolean).join(' - ')}
        </ReportTable.Cell>
        <ReportTable.Cell>{displayNum(count)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(amount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(debit)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(credit)}</ReportTable.Cell>
      </>
    ),
  };
};
