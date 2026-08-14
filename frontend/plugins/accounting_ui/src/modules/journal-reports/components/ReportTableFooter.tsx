import { ReportTable, useQueryState } from 'erxes-ui';
import { getReportColumnCount } from './reportTableLayout';

export const ReportTableFooter = () => {
  const [report] = useQueryState('report');
  const reportCode = typeof report === 'string' ? report : '';
  const columnCount = getReportColumnCount(reportCode);

  if (!columnCount) {
    return null;
  }

  return (
    <ReportTable.Row data-sum-key="footer" className="bg-muted/50">
      <ReportTable.Cell></ReportTable.Cell>
      <ReportTable.Cell className="text-right">НИЙТ ДҮН:</ReportTable.Cell>
      {Array.from({ length: columnCount - 2 }).map((_, index) => (
        <ReportTable.Cell key={index} className="text-right"></ReportTable.Cell>
      ))}
    </ReportTable.Row>
  );
};
