import { ReportHtml } from '@/tunable-reports/ReportHtml';
import { Table, cn } from 'erxes-ui';
import {
  AccountingTunableReportFieldsFragment,
  AccountingTunableReportGenerateQuery,
} from '~/gql/graphql';
import { reportValues, sortReportValues } from '@/tunable-reports/values';
import { ReportValues } from '@/tunable-reports/schema';
import { useReportTranslation } from '@/tunable-reports/locales';
import {
  reportColumnWidths,
  reportRowIndent,
} from '@/tunable-reports/reportLayout';
import {
  ReportOrganization,
  reportTextHasToken,
} from '@/tunable-reports/reportText';
import {
  defaultReportRunSettings,
  ReportRunSettings,
} from '@/tunable-reports/runReport';

export type ReportCells =
  AccountingTunableReportGenerateQuery['accountingTunableReportGenerate']['cells'];

export const ReportPaper = ({
  values,
  settings = defaultReportRunSettings(),
  organization,
  cells = [],
}: {
  values: ReportValues;
  settings?: ReportRunSettings;
  organization?: ReportOrganization;
  cells?: ReportCells;
}) => {
  const { t } = useReportTranslation();
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
  const unit = settings.amountUnit === 'thousands' ? 1000 : 1;
  const formatAmount = (value?: number | null): string =>
    value == null ? '' : numberFormat.format(value / unit);
  const organizationName = organization?.name?.trim();
  const html = (value: string) => (
    <ReportHtml
      value={value}
      fromDate={settings.fromDate}
      toDate={settings.toDate}
      organization={organization}
    />
  );
  return (
    <div className="space-y-5 p-4 print:p-0">
      <article
        className={cn(
          'report-paper mx-auto space-y-6 rounded-lg border bg-white text-black p-6 print:max-w-none print:rounded-none print:border-0 print:p-0',
          values.orientation === 'landscape' ? 'max-w-7xl' : 'max-w-4xl',
        )}
      >
        <div className="space-y-2 text-center">
          {organizationName && !reportTextHasToken(values.header, 'name') && (
            <p>{organizationName}</p>
          )}
          <h1 className="text-xl font-semibold">{values.name}</h1>
        </div>
        {values.header && html(values.header)}
        {values.sections
          .filter((section) => section.isActive)
          .map((section) => {
            const columns = section.columns.filter((column) => column.isActive);
            const widths = reportColumnWidths(columns.length);
            return (
              <section key={section._id} className="space-y-3">
                {section.name && (
                  <h2 className="text-lg font-semibold">{section.name}</h2>
                )}
                {section.header && html(section.header)}
                <div className="overflow-x-auto print:overflow-visible">
                  <Table className="w-full table-fixed bg-white [&_th]:whitespace-normal [&_td]:whitespace-normal [&_th]:[overflow-wrap:anywhere] [&_td]:[overflow-wrap:anywhere] [&_td]:h-auto [&_td]:py-1">
                    <colgroup>
                      <col style={{ width: `${widths.number}%` }} />
                      <col style={{ width: `${widths.name}%` }} />
                      {columns.map((column) => (
                        <col
                          key={column._id}
                          style={{ width: `${widths.value}%` }}
                        />
                      ))}
                    </colgroup>
                    <Table.Header className="[&_th]:bg-white [&_th]:text-black [&_th]:border-t [&_th]:border-r [&_th]:border-b [&_th:first-child]:border-l">
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
                                  {' '.repeat(
                                    reportRowIndent(row.tabCount) * 4,
                                  )}
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
                                column.getDate ??
                                row.getDate;
                              const previous =
                                formula?.isPre ??
                                column.isPre ??
                                row.isPre ??
                                false;
                              const value = cellValues.get(
                                JSON.stringify([
                                  section._id,
                                  row._id,
                                  column._id,
                                ]),
                              );
                              const period = previous ? 'previous' : 'current';
                              const cellTitle = date
                                ? `${t(date)} · ${t(period)}`
                                : undefined;
                              return (
                                <Table.Cell
                                  key={column._id}
                                  className="px-2 text-right text-black tabular-nums"
                                  title={cellTitle}
                                >
                                  {formatAmount(value)}
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
                {section.footer && html(section.footer)}
              </section>
            );
          })}
        {values.footer && html(values.footer)}
      </article>
    </div>
  );
};

export const ReportPreview = ({
  report,
  settings,
  organization,
  cells,
}: {
  report: AccountingTunableReportFieldsFragment;
  settings?: ReportRunSettings;
  organization?: ReportOrganization;
  cells?: ReportCells;
}) => (
  <ReportPaper
    values={sortReportValues(reportValues(report))}
    settings={settings}
    organization={organization}
    cells={cells}
  />
);
