import React from 'react';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { IReport, IUserReport } from '../types';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  displayType: string;
  report: IReport;
};

const ReportRow = (userReport: IUserReport) => {
  return (
    <tr key={Math.random()}>
      <td>
        <NameCard user={userReport.user} />
      </td>
      <td>
        {userReport.scheduleReport.map(userSchedule => {
          return (
            <>
              <div>{userSchedule.date}</div>
            </>
          );
        })}
      </td>
      <td>
        {userReport.scheduleReport.map(userSchedule => {
          const shiftTimeFormatted =
            userSchedule.minsWorked &&
            `${Math.round(
              userSchedule.minsWorked / 60
            )}h : ${userSchedule.minsWorked % 60}m`;
          return (
            <>
              <div>{shiftTimeFormatted || '-'}</div>
            </>
          );
        })}
      </td>
      <td>
        {userReport.scheduleReport.map(userSchedule => {
          return (
            <>
              <div>{userSchedule.minsLate || '-'}</div>
            </>
          );
        })}
      </td>
      <td>
        {userReport.totalMinsWorked &&
          `${Math.round(
            userReport.totalMinsWorked / 60
          )}h : ${userReport.totalMinsWorked % 60}m`}
      </td>
      <td>{userReport.totalMinsLate}</td>
      <td>{userReport.totalAbsenceMins}</td>
    </tr>
  );
};

const ReportList = (props: Props) => {
  const { report, displayType } = props;
  return (
    <tbody>
      {displayType === 'By Group' && (
        <tr>
          <h5>{report.groupTitle && report.groupTitle}</h5>
        </tr>
      )}
      {report.groupReport.map(userReport => ReportRow(userReport))}
      {displayType === 'By Group' && (
        <tr>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>
            <strong>
              {' '}
              {report.groupTotalMinsWorked &&
                `${Math.round(
                  report.groupTotalMinsWorked / 60
                )}h : ${report.groupTotalMinsWorked % 60}m`}
            </strong>
          </td>
          <td>
            <strong>{report.groupTotalMinsLate}</strong>
          </td>
          <td>
            <strong>{report.groupTotalAbsenceMins}</strong>
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default ReportList;
