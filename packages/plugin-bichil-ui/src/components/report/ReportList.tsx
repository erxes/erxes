import Table from '@erxes/ui/src/components/table';
import React from 'react';
import { IReport } from '../../types';
import TableHeaders from './ReportTableHeaders';
import TableRow from './ReportTableRow';
type Props = {
  bichilReports: IReport[];
  reportType: string;
};
function ReportList(props: Props) {
  const { bichilReports, reportType } = props;

  const renderTableHead = () => {
    return <TableHeaders reportType={reportType} />;
  };

  return (
    <Table>
      <thead>{renderTableHead()}</thead>
      {bichilReports &&
        bichilReports.map(report => (
          <TableRow
            key={Math.random()}
            bichilReport={report}
            reportType={reportType}
          />
        ))}
    </Table>
  );
}

export default ReportList;
