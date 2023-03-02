import Table from '@erxes/ui/src/components/table';
import React from 'react';
import { IReport } from '../../types';
import TableHeaders from './TableHeaders';
import TableRow from './TableRow';
type Props = {
  bichilReports: IReport[];
  reportType: string;
};
function TableBody(props: Props) {
  const { bichilReports, reportType } = props;

  const renderTableHead = () => {
    return TableHeaders;
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

export default TableBody;
