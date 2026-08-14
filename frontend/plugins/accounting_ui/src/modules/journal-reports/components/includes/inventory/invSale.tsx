import { displayNum, fixNum, ReportTable } from 'erxes-ui';
import { IGroupRule } from '~/modules/journal-reports/types/reportsMap';
import { CalcReportResult } from '..';

type InventorySaleRecord = {
  journal?: string;
  sumAmount?: number;
  sumCount?: number;
};

const SALE_RETURN_JOURNALS = new Set(['invSaleReturn', 'invSaleReturnOut']);
const COST_JOURNALS = new Set(['invSaleOut', 'invSaleReturnOut']);

const getItems = (dic: Record<string, unknown>) =>
  Array.isArray(dic.items) ? (dic.items as InventorySaleRecord[]) : [];

const signedValue = (record: InventorySaleRecord, value: number) =>
  SALE_RETURN_JOURNALS.has(record.journal || '') ? -1 * value : value;

export const HandleInvSale = (
  dic: Record<string, unknown>,
  _groupRule: IGroupRule,
  _attr: string,
): CalcReportResult => {
  const items = getItems(dic);
  let count = 0;
  let sale = 0;

  for (const record of items) {
    count += signedValue(record, record.sumCount || 0);
    sale += signedValue(record, record.sumAmount || 0);
  }

  return {
    lastNode: (
      <>
        <ReportTable.Cell>{displayNum(count)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(fixNum(sale / count))}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(sale)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(sale)}</ReportTable.Cell>
      </>
    ),
  };
};

export const HandleInvSaleCost = (
  dic: Record<string, unknown>,
  _groupRule: IGroupRule,
  _attr: string,
): CalcReportResult => {
  const items = getItems(dic);
  let count = 0;
  let sale = 0;
  let cost = 0;

  for (const record of items) {
    const amount = signedValue(record, record.sumAmount || 0);

    if (COST_JOURNALS.has(record.journal || '')) {
      cost += amount;
      continue;
    }

    count += signedValue(record, record.sumCount || 0);
    sale += amount;
  }

  return {
    lastNode: (
      <>
        <ReportTable.Cell>{displayNum(count)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(fixNum(sale / count))}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(sale)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(fixNum(cost / count))}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(cost)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(sale - cost)}</ReportTable.Cell>
      </>
    ),
  };
};
