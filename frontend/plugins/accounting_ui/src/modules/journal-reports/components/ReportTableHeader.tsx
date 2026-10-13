import { useTranslation } from 'react-i18next';
import { ReportTable, useQueryState } from 'erxes-ui';
import { getReportHeaderRows } from './reportTableLayout';

export const ReportTableHeader = () => {
  const { t } = useTranslation('accounting');
  const [report] = useQueryState('report');
  const reportCode = typeof report === 'string' ? report : '';
  const headerRows = getReportHeaderRows(reportCode);

  if (!headerRows.length) {
    return null;
  }

  return (
    <>
      {headerRows.map((row, rowIndex) => (
        <ReportTable.Row key={`${reportCode}-header-value-${rowIndex}`}>
          {row.map((cell, cellIndex) => (
            <ReportTable.Head
              key={`${cell.label}-${cellIndex}`}
              rowSpan={cell.rowSpan}
              colSpan={cell.colSpan}
            >
              {t(cell.label || '', { nsSeparator: false })}
            </ReportTable.Head>
          ))}
        </ReportTable.Row>
      ))}
    </>
  );
};
