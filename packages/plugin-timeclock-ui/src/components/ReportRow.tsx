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
          return (
            <>
              <div>
                {(userSchedule.recordedStart &&
                  new Date(userSchedule.recordedStart).toLocaleTimeString()) ||
                  '-'}
              </div>
            </>
          );
        })}
      </td>
      <td>
        {userReport.scheduleReport.map(userSchedule => {
          return (
            <>
              <div>
                {(userSchedule.scheduleStart &&
                  new Date(userSchedule.scheduleStart).toLocaleTimeString()) ||
                  '-'}
              </div>
            </>
          );
        })}
      </td>
      <td>
        {userReport.scheduleReport.map(userSchedule => {
          return (
            <>
              <div>
                {(userSchedule.recordedEnd &&
                  new Date(userSchedule.recordedEnd).toLocaleTimeString()) ||
                  '-'}
              </div>
            </>
          );
        })}
      </td>
      <td>
        {userReport.scheduleReport.map(userSchedule => {
          return (
            <>
              <div>
                {(userSchedule.scheduleEnd &&
                  new Date(userSchedule.scheduleEnd).toLocaleTimeString()) ||
                  '-'}
              </div>
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
      <td>{userReport.totalMinsLate}</td>
      <td>{userReport.totalAbsenceMins}</td>
    </tr>
  );
};

const ReportList = (props: Props) => {
  const { report, displayType } = props;

  // const renderScheduledShifts = () => {} ;
  console.log('nani', report);
  console.log('nani', displayType);
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
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>{report.groupTotalMinsLate}</td>
          <td>{report.groupTotalAbsenceMins}</td>
        </tr>
      )}
    </tbody>
  );
};

export default ReportList;
