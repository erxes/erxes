import React from 'react';
import { IReport, IUserReport } from '../../types';
import { __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';
import { timeFormat } from '../../constants';
import { returnDeviceTypes } from '../../utils';

type Props = {
  reportType: string;
  report: IReport;
};

const ReportRow = (userReport: IUserReport, reportType: string) => {
  switch (reportType) {
    case 'Урьдчилсан':
      return (
        <tr key={Math.random()}>
          <td>{userReport.user.employeeId}</td>
          <td>{userReport.user.details?.lastName || '-'}</td>
          <td>{userReport.user.details?.firstName || '-'}</td>
          <td>{userReport.user.details?.position || '-'}</td>
          <td>{userReport.totalDaysScheduled}</td>
          <td>{userReport.totalDaysWorked}</td>
          <td>{'-'}</td>
        </tr>
      );

    case 'Сүүлд':
      return (
        <tr key={Math.random()}>
          <td>{userReport.user.employeeId}</td>
          <td>{userReport.user.details?.lastName || '-'}</td>
          <td>{userReport.user.details?.firstName || '-'}</td>
          <td>{userReport.user.details?.position || '-'}</td>
          <td>{userReport.totalDaysScheduled}</td>
          <td>{userReport.totalHoursScheduled}</td>
          <td>{userReport.totalHoursBreak}</td>
          <td>{userReport.totalDaysWorked}</td>
          <td>{userReport.totalRegularHoursWorked}</td>
          <td>{userReport.totalHoursOvertime}</td>
          <td>{userReport.totalHoursOvernight}</td>
          <td>{userReport.totalHoursWorked}</td>
          <td>{userReport.totalMinsLate}</td>
          <td>{userReport.absenceInfo?.totalHoursWorkedAbroad}</td>
          <td>{userReport.absenceInfo?.totalHoursPaidAbsence}</td>
          <td>{userReport.absenceInfo?.totalHoursUnpaidAbsence}</td>
          <td>{userReport.absenceInfo?.totalHoursSick}</td>
          <td>{'-'}</td>
        </tr>
      );

    case 'Pivot':
      if (!userReport.scheduleReport || !userReport.scheduleReport.length) {
        const columnsNo = 13;
        return (
          <tr key={Math.random()}>
            <td>{userReport.user.employeeId}</td>
            <td>{userReport.user.details?.lastName || '-'}</td>
            <td>{userReport.user.details?.firstName || '-'}</td>
            <td style={{ textAlign: 'left' }}>
              {userReport.user.details?.position || '-'}
            </td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
          </tr>
        );
      }
      return (
        <>
          <tr key={Math.random()}>
            <td rowSpan={userReport.scheduleReport.length + 2}>
              {userReport.user.employeeId}
            </td>
            <td rowSpan={userReport.scheduleReport.length + 2}>
              {userReport.user.details?.lastName || '-'}
            </td>
            <td rowSpan={userReport.scheduleReport.length + 2}>
              {userReport.user.details?.firstName || '-'}
            </td>
            <td
              style={{ textAlign: 'left' }}
              rowSpan={userReport.scheduleReport.length + 2}
            >
              {userReport.user.details?.position || '-'}
            </td>
          </tr>
          {userReport.scheduleReport.map(scheduleReport => {
            return (
              <tr key={scheduleReport.timeclockDate}>
                {renderScheduleShiftInfo(scheduleReport)}
              </tr>
            );
          })}
        </>
      );
  }
};

const renderScheduleShiftInfo = scheduledShift => {
  const getInDevice =
    returnDeviceTypes(scheduledShift.deviceType)[0] &&
    returnDeviceTypes(scheduledShift.deviceType)[0].includes('faceTerminal')
      ? scheduledShift.deviceName
      : '-';

  const getOutDevice =
    returnDeviceTypes(scheduledShift.deviceType)[1] &&
    returnDeviceTypes(scheduledShift.deviceType)[1].includes('faceTerminal')
      ? scheduledShift.deviceName
      : '-';

  return (
    <>
      <td>{scheduledShift.timeclockDate}</td>
      <td>
        {scheduledShift.scheduledStart
          ? new Date(scheduledShift.scheduledStart).toTimeString().split(' ')[0]
          : '-'}
      </td>

      <td>
        {scheduledShift.scheduledEnd
          ? new Date(scheduledShift.scheduledEnd).toTimeString().split(' ')[0]
          : '-'}
      </td>
      <td>{scheduledShift.scheduledDuration}</td>
      <td>{scheduledShift.lunchBreakInHrs || 0}</td>

      <td>{dayjs(scheduledShift.timeclockStart).format(timeFormat)}</td>
      <td>{getInDevice}</td>
      <td>{dayjs(scheduledShift.timeclockEnd).format(timeFormat)}</td>
      <td>{getOutDevice}</td>
      <td>{scheduledShift.timeclockDuration}</td>
      <td>{scheduledShift.totalHoursOvertime}</td>
      <td>{scheduledShift.totalHoursOvernight}</td>
      <td>{scheduledShift.totalMinsLate}</td>
    </>
  );
};

const ReportList = (props: Props) => {
  const { report, reportType } = props;
  return (
    <tbody>
      {report.groupReport.map(userReport => ReportRow(userReport, reportType))}
    </tbody>
  );
};

export default ReportList;
