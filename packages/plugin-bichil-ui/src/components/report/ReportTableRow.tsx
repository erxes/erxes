import React from 'react';
import { IReport, IUserReport } from '../../types';
import { __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';
import { timeFormat } from '../../constants';
import { returnDeviceTypes } from '../../utils';

type Props = {
  bichilReport: IReport;
  reportType: string;
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
          <td>{userReport.user.details?.position || '-'}</td>
          <td>{userReport.user.details?.lastName || '-'}</td>
          <td>{userReport.user.details?.firstName || '-'}</td>

          <td>{userReport.totalDays}</td>
          <td>{userReport.totalWeekendDays}</td>

          <td>{userReport.totalDaysScheduled}</td>
          <td>{userReport.totalHoursScheduled}</td>

          <td>{userReport.totalDaysWorked}</td>
          <td>{userReport.totalRegularHoursWorked}</td>
          <td>{userReport.totalHoursShiftRequest}</td>
          <td>{userReport.totalHoursOvertime}</td>

          <td>{userReport.totalMinsLate}</td>
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

function TableRow(props: Props) {
  const { reportType, bichilReport } = props;
  return (
    <tbody>
      {bichilReport.groupReport.map(userReport =>
        ReportRow(userReport, reportType)
      )}
    </tbody>
  );
}

export default TableRow;
