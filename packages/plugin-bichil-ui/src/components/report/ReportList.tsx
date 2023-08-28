import Table from '@erxes/ui/src/components/table';
import React from 'react';
import { IReport } from '../../types';
import TableHeaders from './ReportTableHeaders';
import TableRow from './ReportTableRow';
type Props = {
  bichilReports: IReport[];
  reportType: string;

  queryParams: any;
};
function ReportList(props: Props) {
  const { bichilReports, reportType, queryParams } = props;

  const showBranch = queryParams.showBranch
    ? JSON.parse(queryParams.showBranch)
    : false;

  const showDepartment = queryParams.showDepartment
    ? JSON.parse(queryParams.showDepartment)
    : false;

  const renderTableHead = () => {
    return (
      <TableHeaders
        reportType={reportType}
        showBranch={showBranch}
        showDepartment={showDepartment}
      />
    );
  };

  return (
    <Table>
      <thead>{renderTableHead()}</thead>
      {bichilReports &&
        bichilReports.map((report, i) => (
          <TableRow
            index={i + 1}
            key={Math.random()}
            bichilReport={report}
            reportType={reportType}
            showBranch={showBranch}
            showDepartment={showDepartment}
          />
        ))}
    </Table>
  );
}

export default ReportList;
