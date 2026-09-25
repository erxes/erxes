import { displayNum, ReportTable } from 'erxes-ui';
import { IGroupRule } from '~/modules/journal-reports/types/reportsMap';
import { TR_SIDES } from '~/modules/transactions/types/constants';
import { CalcReportResult } from '../types';

type SummaryRecord = {
  side?: string;
  sumAmount?: number;
  sumCurrencyAmount?: number;
  isBetween?: number;
  accountCurrency?: string;
};

const getItems = (dic: Record<string, unknown>) =>
  Array.isArray(dic.items) ? (dic.items as SummaryRecord[]) : [];

const splitBalance = (value: number) => [
  Math.max(value, 0),
  -1 * Math.min(value, 0),
];

export const HandleBalanceReport = (
  dic: Record<string, unknown>,
  _groupRule: IGroupRule,
  attr: string,
): CalcReportResult => {
  const items = getItems(dic);
  let [opening, debit, credit, closing] = [0, 0, 0, 0];
  let [currencyOpening, currencyDebit, currencyCredit, currencyClosing] = [
    0, 0, 0, 0,
  ];

  for (const record of items) {
    const isDebit = record.side === TR_SIDES.DEBIT;
    const amount = record.sumAmount || 0;
    const currencyAmount = record.sumCurrencyAmount || 0;
    const signedAmount = isDebit ? amount : -amount;
    const signedCurrencyAmount = isDebit ? currencyAmount : -currencyAmount;

    if (record.isBetween) {
      debit += isDebit ? amount : 0;
      credit += isDebit ? 0 : amount;
      currencyDebit += isDebit ? currencyAmount : 0;
      currencyCredit += isDebit ? 0 : currencyAmount;
    } else {
      opening += signedAmount;
      currencyOpening += signedCurrencyAmount;
    }

    closing += signedAmount;
    currencyClosing += signedCurrencyAmount;
  }

  const currency = items.find(
    (record) => record.accountCurrency && record.accountCurrency !== 'MNT',
  )?.accountCurrency;
  const [openingDebit, openingCredit] = splitBalance(opening);
  const [closingDebit, closingCredit] = splitBalance(closing);
  const [currencyOpeningDebit, currencyOpeningCredit] =
    splitBalance(currencyOpening);
  const [currencyClosingDebit, currencyClosingCredit] =
    splitBalance(currencyClosing);

  return {
    lastNode: (
      <>
        <ReportTable.Cell>{displayNum(openingDebit)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(openingCredit)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(debit)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(credit)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(closingDebit)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(closingCredit)}</ReportTable.Cell>
      </>
    ),
    afterNode: currency ? (
      <ReportTable.Row
        key={`${attr}-currency`}
        data-draw-zero="1"
        className="bg-muted/40 text-right italic"
      >
        <ReportTable.Cell colSpan={2} className="text-left">
          Валютаар {currency}
        </ReportTable.Cell>
        <ReportTable.Cell>{displayNum(currencyOpeningDebit)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(currencyOpeningCredit)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(currencyDebit)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(currencyCredit)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(currencyClosingDebit)}</ReportTable.Cell>
        <ReportTable.Cell>{displayNum(currencyClosingCredit)}</ReportTable.Cell>
      </ReportTable.Row>
    ) : null,
    lastData: { fr_diff: opening, currency_fr_diff: currencyOpening },
  };
};
