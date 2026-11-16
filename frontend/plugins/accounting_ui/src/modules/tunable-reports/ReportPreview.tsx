import { ReportHtml } from '@/tunable-reports/ReportHtml';
import { Table, cn } from 'erxes-ui';
import {
  AccountingTunableReportFieldsFragment,
  AccountingTunableReportGenerateQuery,
} from '~/gql/graphql';
import { reportValues, sortReportValues } from '@/tunable-reports/values';
import { useReportTranslation } from '@/tunable-reports/locales';
import {
  defaultReportRunSettings,
  ReportRunSettings,
} from '@/tunable-reports/runReport';

export const ReportPreview = ({
  report,
  settings = defaultReportRunSettings(),
  organizationName,
  cells = [],
}: {
  report: AccountingTunableReportFieldsFragment;
  settings?: ReportRunSettings;
  organizationName?: string;
  cells?: AccountingTunableReportGenerateQuery['accountingTunableReportGenerate']['cells'];
}) => {
  const { t } = useReportTranslation();
  const values = sortReportValues(reportValues(report));
  const cellValues = new Map(
    cells.map((cell) => [
      JSON.stringify([cell.sectionId, cell.rowId, cell.columnId]),
      cell.value,
    ]),
  );
  const numberFormat = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: settings.decimals,
    maximumFractionDigits: settings.decimals,
  });
  return (
    <div className="space-y-5 p-4 print:p-0">
      <article
        className={cn(
          'report-paper mx-auto space-y-6 rounded-lg border bg-white text-black p-6 print:max-w-none print:rounded-none print:border-0 print:p-0',
          values.orientation === 'landscape' ? 'max-w-7xl' : 'max-w-4xl',
        )}
      >
        <div className="space-y-2 text-center">
          {organizationName && <p>{organizationName}</p>}
          <h1 className="text-xl font-semibold">
            {values.name}
          </h1>
        </div>
        {values.header && (
          <ReportHtml
            value={values.header}
            fromDate={settings.fromDate}
            toDate={settings.toDate}
          />
        )}
        {values.sections
          .filter((section) => section.isActive)
          .map((section) => {
            const columns = section.columns.filter((column) => column.isActive);
            return (
              <section key={section._id} className="space-y-3">
                {section.name && (
                  <h2 className="text-lg font-semibold">{section.name}</h2>
                )}
                {section.header && (
                  <ReportHtml
                    value={section.header}
                    fromDate={settings.fromDate}
                    toDate={settings.toDate}
                  />
                )}
                <div className="overflow-x-auto print:overflow-visible">
                  <Table className="w-full table-fixed [&_th]:whitespace-normal [&_td]:whitespace-normal [&_th]:[overflow-wrap:anywhere] [&_td]:[overflow-wrap:anywhere] [&_td]:h-auto [&_td]:py-1">
                    <colgroup>
                      <col className="w-[8%]" />
                      <col style={{ width: columns.length ? '52%' : '92%' }} />
                      {columns.map((column) => (
                        <col
                          key={column._id}
                          style={{ width: `${40 / columns.length}%` }}
                        />
                      ))}
                    </colgroup>
                    <Table.Header className="[&_th]:border-t [&_th]:border-r [&_th]:border-b [&_th:first-child]:border-l">
                      <Table.Row>
                        <Table.Head>{t('number')}</Table.Head>
                        <Table.Head>{t('name')}</Table.Head>
                        {columns.map((column) => (
                          <Table.Head key={column._id}>
                            {column.name}
                          </Table.Head>
                        ))}
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {section.rows
                        .filter((row) => row.isActive)
                        .map((row) => (
                          <Table.Row
                            key={row._id}
                            className={cn(
                              row.isBold && 'font-bold',
                              row.isItalic && 'italic',
                              row.isUnderline && 'underline',
                            )}
                          >
                            <Table.Cell className="px-2">
                              {row.number}
                            </Table.Cell>
                            <Table.Cell className="px-2">
                              <span className="flex min-w-0">
                                <span
                                  aria-hidden="true"
                                  className="shrink-0 whitespace-pre"
                                >
                                  {' '.repeat(row.tabCount * 4)}
                                </span>
                                <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                                  {row.name}
                                </span>
                              </span>
                            </Table.Cell>
                            {columns.map((column) => {
                              const formula = section.formulas.find(
                                (formula) =>
                                  formula.rowId === row._id &&
                                  (!formula.columnId ||
                                    formula.columnId === column._id),
                              );
                              const date =
                                formula?.getDate ??
                                row.getDate ??
                                column.getDate;
                              const previous =
                                formula?.isPre ??
                                row.isPre ??
                                column.isPre ??
                                false;
                              const value = cellValues.get(
                                JSON.stringify([
                                  section._id,
                                  row._id,
                                  column._id,
                                ]),
                              );
                              return (
                                <Table.Cell
                                  key={column._id}
                                  className="px-2 text-right text-muted-foreground"
                                  title={
                                    date
                                      ? `${t(date)} · ${t(
                                          previous ? 'previous' : 'current',
                                        )}`
                                      : undefined
                                  }
                                >
                                  {value == null
                                    ? ''
                                    : numberFormat.format(
                                        settings.amountUnit === 'thousands'
                                          ? value / 1000
                                          : value,
                                      )}
                                </Table.Cell>
                              );
                            })}
                          </Table.Row>
                        ))}
                    </Table.Body>
                  </Table>
                </div>
                {!section.rows.length && (
                  <p className="text-sm text-muted-foreground">{t('noRows')}</p>
                )}
                {section.footer && (
                  <ReportHtml
                    value={section.footer}
                    fromDate={settings.fromDate}
                    toDate={settings.toDate}
                  />
                )}
              </section>
            );
          })}
        {values.footer && (
          <ReportHtml
            value={values.footer}
            fromDate={settings.fromDate}
            toDate={settings.toDate}
          />
        )}
      </article>
    </div>
  );
};
