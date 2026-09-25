import { displayNum, ReportTable } from 'erxes-ui';
import { IGroupRule } from '~/modules/journal-reports/types/reportsMap';
import { CalcReportResult } from '..';

type JournalLineRecord = {
  debit?: number;
  credit?: number;
  description?: string;
  accountCode?: string;
};

const numberValue = (value?: number) => value || 0;
const getItems = (dic: Record<string, unknown>) =>
  Array.isArray(dic.items) ? (dic.items as JournalLineRecord[]) : [];

export const HandleMainMJ = (
  dic: Record<string, unknown>,
  _groupRule: IGroupRule,
  _attr: string,
): CalcReportResult => {
  const items = getItems(dic);
  const debit = items.reduce(
    (sum, record) => sum + numberValue(record.debit),
    0,
  );
  const credit = items.reduce(
    (sum, record) => sum + numberValue(record.credit),
    0,
  );

  return {
    lastNode: (
      <>
        <ReportTable.Cell>{displayNum(debit)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(credit)}</ReportTable.Cell>
      </>
    ),
  };
};

export const HandleMainMJS = (
  dic: Record<string, unknown>,
  _groupRule: IGroupRule,
  _attr: string,
): CalcReportResult => {
  const items = getItems(dic);
  const debit = items.reduce(
    (sum, record) => sum + numberValue(record.debit),
    0,
  );
  const credit = items.reduce(
    (sum, record) => sum + numberValue(record.credit),
    0,
  );
  const debitAccounts = [
    ...new Set(
      items
        .filter((record) => numberValue(record.debit) > 0)
        .map((record) => record.accountCode)
        .filter((value): value is string => !!value),
    ),
  ];
  const creditAccounts = [
    ...new Set(
      items
        .filter((record) => numberValue(record.credit) > 0)
        .map((record) => record.accountCode)
        .filter((value): value is string => !!value),
    ),
  ];
  const diff = debit - credit;
  const amount =
    Math.round(debit * 10000) === Math.round(credit * 10000)
      ? debit
      : Math.max(debit, credit);

  return {
    lastNode: (
      <>
        <ReportTable.Cell className="text-left">
          {items[0]?.description || ''}
        </ReportTable.Cell>
        <ReportTable.Cell className="text-left">
          {debitAccounts.join(', ')}
        </ReportTable.Cell>
        <ReportTable.Cell className="text-left">
          {creditAccounts.join(', ')}
        </ReportTable.Cell>
        <ReportTable.Cell>{displayNum(amount)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(diff)}</ReportTable.Cell>
      </>
    ),
  };
};
