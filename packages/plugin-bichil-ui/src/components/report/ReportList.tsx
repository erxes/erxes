import Table from '@erxes/ui/src/components/table';
import React from 'react';
import { IReport } from '../../types';
import TableRow from './ReportTableRow';
import TableHeaders from './ReportTableHeaders';

type Props = {
  bichilReports: IReport[];
  reportType: string;

  queryParams: any;
  deductionInfo: any;
};
function ReportList(props: Props) {
  const { bichilReports, reportType, deductionInfo } = props;

  const renderTableHead = () => {
    return <TableHeaders reportType={reportType} />;
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
          />
        ))}

      <tr>
        <td>{''}</td>
        <td>{''}</td>
        <td>{''}</td>
        <td>{''}</td>
        <td>
          <b>{deductionInfo.totalHoursScheduled}</b>
        </td>
        <td>
          <b>{deductionInfo.totalHoursWorked}</b>
        </td>
        <td>{''}</td>
        <td>{''}</td>
        <td>{''}</td>
        <td>{''}</td>
        <td>{''}</td>
        <td>
          <b>{deductionInfo.totalShiftNotClosedDeduction}</b>
        </td>
        <td>{''}</td>
        <td>{''}</td>
        <td>
          <b>{deductionInfo.totalLateMinsDeduction?.toFixed(2)}</b>
        </td>
        <td>
          <b>{deductionInfo.totalDeductionPerGroup?.toFixed(2)}</b>
        </td>
      </tr>
    </Table>
  );
}

export default ReportList;
