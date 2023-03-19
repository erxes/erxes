import React from 'react';
import { IReport, IUserReport } from '../../types';
import { __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';
import { timeFormat } from '../../constants';
import { returnDeviceTypes } from '../../utils';
import { TextAlignCenter } from '../../styles';

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
      return (
        <tr key={Math.random()}>
          <td>{userReport.user.employeeId}</td>
          <td>{userReport.user.details?.lastName || '-'}</td>
          <td>{userReport.user.details?.firstName || '-'}</td>
          <td>{userReport.user.details?.position || '-'}</td>

          {userReport.scheduleReport &&
            renderScheduleShiftsOfReport(userReport.scheduleReport)}
        </tr>
      );
  }
};

const renderScheduleShiftsOfReport = scheduleReport => {
  return (
    scheduleReport && (
      <>
        <td>
          {scheduleReport.map(schedule => {
            return (
              <div key={schedule.timeclockDate}> {schedule.timeclockDate}</div>
            );
          })}
        </td>
        <td>
          {scheduleReport.map(schedule => {
            return (
              <div key={schedule.timeclockDate}>
                {schedule.scheduledStart
                  ? new Date(schedule.scheduledStart)
                      .toTimeString()
                      .split(' ')[0]
                  : '-'}
              </div>
            );
          })}
        </td>
        <td>
          {scheduleReport.map(schedule => {
            return (
              <div key={schedule.timeclockDate}>
                {schedule.scheduledEnd
                  ? new Date(schedule.scheduledEnd).toTimeString().split(' ')[0]
                  : '-'}
              </div>
            );
          })}
        </td>
        <td>
          {scheduleReport.map(schedule => {
            return (
              <div key={schedule.timeclockDate}>
                {schedule.scheduledDuration}
              </div>
            );
          })}
        </td>
        <td>
          {scheduleReport.map(schedule => {
            return (
              <div key={schedule.timeclockDate}>
                {dayjs(schedule.timeclockStart).format(timeFormat)}
              </div>
            );
          })}
        </td>
        <td>
          {scheduleReport.map(schedule => {
            return (
              <div key={schedule.timeclockDate}>
                {returnDeviceTypes(schedule.deviceType)[0] || '-'}
              </div>
            );
          })}
        </td>
        <td>
          {scheduleReport.map(schedule => {
            return (
              <div key={schedule.timeclockDate}>
                {dayjs(schedule.timeclockEnd).format(timeFormat)}
              </div>
            );
          })}
        </td>
        <td>
          {scheduleReport.map(schedule => {
            return (
              <div key={schedule.timeclockDate}>
                {returnDeviceTypes(schedule.deviceType)[1] || '-'}
              </div>
            );
          })}
        </td>
        <td>
          {scheduleReport.map(schedule => {
            return (
              <div key={schedule.timeclockDate}> {schedule.deviceName}</div>
            );
          })}
        </td>
        <td>
          {scheduleReport.map(schedule => {
            return (
              <div key={schedule.timeclockDate}>
                {schedule.timeclockDuration}
              </div>
            );
          })}
        </td>
        <td>
          {scheduleReport.map(schedule => {
            return (
              <div key={schedule.timeclockDate}>
                {schedule.totalHoursOvertime}
              </div>
            );
          })}
        </td>
        <td>
          {scheduleReport.map(schedule => {
            return (
              <div key={schedule.timeclockDate}>
                {schedule.totalHoursOvernight}
              </div>
            );
          })}
        </td>
        <td>
          {scheduleReport.map(schedule => {
            return (
              <div key={schedule.timeclockDate}>{schedule.totalMinsLate}</div>
            );
          })}
        </td>
      </>
    )
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
