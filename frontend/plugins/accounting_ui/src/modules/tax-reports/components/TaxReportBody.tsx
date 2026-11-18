import { ReportTable, Skeleton, cn, displayNum } from 'erxes-ui';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { TaxReportRow } from '../types';

const TAB_PADDING = 20;
// Three columns: the name takes the rest and wraps on words; the last two share
// one fixed width and never wrap. They hold the line number and amount, or the
// debit and credit amounts of a row with a value side.
const VALUE_COL = 'w-32 min-w-32';
const NUMBER_CELL = 'whitespace-nowrap break-keep text-center';
const AMOUNT_CELL = 'whitespace-nowrap break-keep text-right';
const NAME_CELL = 'text-left break-words';
const UNUSED_CELL = 'bg-foreground/10';

const indentStyle = (row: TaxReportRow) =>
  ({ '--cellPadding': `${row.tabCount * TAB_PADDING}px` } as CSSProperties);

const nameCellClass = (row: TaxReportRow) =>
  cn(NAME_CELL, row.tabCount && 'pl-(--cellPadding)');

const amount = (value: number) => (value > 0 ? displayNum(value) : '');

/** Line number and amount, or debit and credit for a row with a side. */
const ValueCells = ({ row }: { row: TaxReportRow }) => {
  if (row.valueSide !== 'debit' && row.valueSide !== 'credit') {
    return (
      <>
        <ReportTable.Cell className={NUMBER_CELL}>
          {row.number}
          {row.formulaText}
        </ReportTable.Cell>
        <ReportTable.Cell className={AMOUNT_CELL}>
          {amount(row.value)}
        </ReportTable.Cell>
      </>
    );
  }

  return (
    <>
      {(['debit', 'credit'] as const).map((side) => (
        <ReportTable.Cell
          key={side}
          className={cn(AMOUNT_CELL, row.valueSide !== side && UNUSED_CELL)}
        >
          {row.valueSide === side ? amount(row.value) : ''}
        </ReportTable.Cell>
      ))}
    </>
  );
};

const TitleRow = ({ row }: { row: TaxReportRow }) => (
  <ReportTable.Row className="font-semibold">
    <ReportTable.Cell
      colSpan={3}
      className={nameCellClass(row)}
      style={indentStyle(row)}
    >
      {row.name}
    </ReportTable.Cell>
  </ReportTable.Row>
);

const TaxReportTable = ({ rows }: { rows: TaxReportRow[] }) => {
  const { t } = useTranslation('accounting');

  return (
    <ReportTable>
      <colgroup>
        <col />
        <col className={VALUE_COL} />
        <col className={VALUE_COL} />
      </colgroup>
      <ReportTable.Header>
        <ReportTable.Row>
          <ReportTable.Head>{t('name')}</ReportTable.Head>
          <ReportTable.Head>{t('vat-row-number')}</ReportTable.Head>
          <ReportTable.Head>{t('amount')}</ReportTable.Head>
        </ReportTable.Row>
      </ReportTable.Header>
      <ReportTable.Body>
        {rows.map((row) =>
          row.kind === 'title' ? (
            <TitleRow key={row._id} row={row} />
          ) : (
            <ReportTable.Row
              key={row._id}
              className={cn(row.isBold && 'font-semibold')}
            >
              <ReportTable.Cell
                className={nameCellClass(row)}
                style={indentStyle(row)}
              >
                {row.name}
              </ReportTable.Cell>
              <ValueCells row={row} />
            </ReportTable.Row>
          ),
        )}
      </ReportTable.Body>
    </ReportTable>
  );
};

const LOADING_ROWS = Array.from(
  { length: 8 },
  (_value, index) => `tax-report-loading-${index}`,
);

export const TaxReportBody = ({
  rows,
  loading,
  error,
}: {
  rows: TaxReportRow[];
  loading: boolean;
  error?: Error;
}) => {
  const { t } = useTranslation('accounting');

  if (loading) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        {LOADING_ROWS.map((key) => (
          <Skeleton key={key} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-6 text-center text-destructive" role="alert">
        {t(error.message, { nsSeparator: false, keySeparator: false })}
      </p>
    );
  }

  if (!rows.length) {
    return (
      <p className="py-6 text-center text-muted-foreground">
        {t('tax-report-no-rows')}
      </p>
    );
  }

  return <TaxReportTable rows={rows} />;
};
