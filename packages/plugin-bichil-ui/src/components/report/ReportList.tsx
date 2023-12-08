import Table from '@erxes/ui/src/components/table';
import React, { useState, useEffect } from 'react';
import { IReport } from '../../types';
import TableRow, { ReportRow } from './ReportTableRow';
import TableHeaders from './ReportTableHeaders';

type Props = {
  bichilReports: IReport[];
  reportType: string;

  queryParams: any;
  deductionInfo: any;
};

function ReportList(props: Props) {
  const { bichilReports, reportType, deductionInfo } = props;

  const [maxParents, setMaxParents] = useState(0);
  const [parentBranchesDict, setParentBranchesDict] = useState<any>({});

  useEffect(() => {
    if (reportType === 'Сүүлд') {
      for (const bichilReport of bichilReports) {
        const { groupParentsTitles, groupParentsCount } = bichilReport;

        if (groupParentsCount > maxParents) {
          setMaxParents(bichilReport.groupParentsCount);
        }

        for (const parentTitle of groupParentsTitles) {
          if (parentBranchesDict[parentTitle]) {
            parentBranchesDict[parentTitle] = [
              ...parentBranchesDict[parentTitle],
              bichilReport
            ];
            continue;
          }

          parentBranchesDict[parentTitle] = [bichilReport];
        }
      }

      setParentBranchesDict(parentBranchesDict);
    }
  }, [bichilReports]);
  const renderTableHead = () => {
    return <TableHeaders reportType={reportType} maxParents={maxParents} />;
  };

  const renderExtraColumns = () => {
    const returnColumns: any = [];

    returnColumns.push(<td>{''}</td>);

    return returnColumns;
  };

  const renderTableBody = () => {
    // if(reportType === 'Сүүлд'){
    //   return bichilReports.map((bichilReport, i) => {
    //     const { groupParentsTitles, groupParentsCount, groupTitle, groupReport } = bichilReport;

    //     const reportRow: any = [];
    //     const titleRow : any = [];
    //     const rowSpan = groupReport.length;

    //     if(groupParentsCount < maxParents){
    //       for(let i = groupParentsCount ; i < maxParents; i ++){
    //         titleRow.push(<td rowSpan={rowSpan}>{'-'}</td>)
    //       }
    //     }

    //     for(const parentTitle of groupParentsTitles){
    //       titleRow.push(<td rowSpan={rowSpan}>
    //         {parentTitle}
    //       </td>
    //       )
    //     }

    //     titleRow.push(<td>
    //       <b>

    //       {groupTitle}
    //       </b>
    //       </td>)

    //     titleRow.push(ReportRow(groupReport[0], reportType, i))

    //     reportRow.push(<tr>{titleRow.map(t=> t)}</tr>)

    //     groupReport.forEach((userReport, i) => {
    //       if (i !== 0) {
    //         reportRow.push(<tr>{ReportRow(userReport, reportType, i)}</tr>)
    //       }
    //     })

    //     if(rowSpan > 1){

    //       reportRow.push(<TableRow
    //         index={i + 1}
    //         key={Math.random()}
    //         bichilReport={bichilReport}
    //         reportType={reportType}
    //         />)
    //       }

    //     return reportRow
    //   })
    // }

    if (reportType === 'Сүүлд' && Object.keys(parentBranchesDict).length) {
      return (
        <>
          {Object.keys(parentBranchesDict).map((parentTitle, i) => {
            // const rowSpan = parentBranchesDict[parentTitle].length;
            let rowSpan = 0;
            const groupReports = parentBranchesDict[parentTitle];
            const groupTitle = groupReports[0].groupTitle;

            for (const bichilReport of groupReports) {
              if (bichilReport.groupReport.length > 1) {
                rowSpan += bichilReport.groupReport.length;
                continue;
              }

              rowSpan += 1;
            }

            return (
              <>
                <tr>
                  <td
                    rowSpan={rowSpan}
                    style={{ textAlign: 'center', border: '1px solid #EEE' }}
                  >
                    {parentTitle}
                  </td>
                  <td rowSpan={groupReports[0].groupReport.length}>
                    <b>{groupTitle}</b>
                  </td>
                  {ReportRow(groupReports[0].groupReport[0], reportType, i)}
                </tr>

                {groupReports[0].groupReport.map((userReport, i) => {
                  if (i !== 0) {
                    return <tr>{ReportRow(userReport, reportType, i)}</tr>;
                  }
                })}

                {groupReports &&
                  groupReports.map((report, i) => {
                    if (i !== 0) {
                      return (
                        <TableRow
                          index={i + 1}
                          key={Math.random()}
                          bichilReport={report}
                          reportType={reportType}
                        />
                      );
                    }
                  })}
              </>
            );
          })}
        </>
      );
    }
    return (
      bichilReports &&
      bichilReports.map((report, i) => (
        <TableRow
          index={i + 1}
          key={Math.random()}
          bichilReport={report}
          reportType={reportType}
        />
      ))
    );
  };

  return (
    <Table>
      <thead>{renderTableHead()}</thead>

      {renderTableBody()}

      <tr>
        {renderExtraColumns()}
        <td>{''}</td>
        <td>{''}</td>
        <td>{''}</td>
        <td>{''}</td>
        <td>
          <b>{deductionInfo.totalHoursScheduled?.toFixed(2)}</b>
        </td>
        <td>
          <b>{deductionInfo.totalHoursWorked?.toFixed(2)}</b>
        </td>
        <td>{''}</td>
        <td>{''}</td>
        <td>{''}</td>
        <td>{''}</td>
        <td>{''}</td>
        <td>
          <b>
            {deductionInfo.totalShiftNotClosedDeduction?.toLocaleString(
              'en-US'
            )}
          </b>
        </td>
        <td>{''}</td>
        <td>{''}</td>
        <td>
          <b>{deductionInfo.totalLateMinsDeduction?.toFixed()}</b>
        </td>
        <td>{''}</td>
        <td>{''}</td>
        <td>
          <b>{deductionInfo.totalAbsentDeduction?.toLocaleString('en-US')}</b>
        </td>
        <td>
          <b>{deductionInfo.totalDeductionPerGroup?.toLocaleString('en-US')}</b>
        </td>
      </tr>
    </Table>
  );
}

export default ReportList;
