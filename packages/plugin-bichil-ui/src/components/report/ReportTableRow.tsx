import React from 'react';
import { IReport, IUserReport } from '../../types';
import { __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';
import { timeFormat } from '../../constants';
import { returnDeviceTypes } from '../../utils';

type Props = {
  bichilReport: IReport;
  reportType: string;
  index: number;
  deductionInfo?: any;
};

const ReportRow = (
  userReport: IUserReport,
  reportType: string,
  index: number
) => {
  switch (reportType) {
    case 'Урьдчилсан':
      return (
        <tr key={Math.random()}>
          <td>
            <b>{index}</b>
          </td>
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
      const getLastName = userReport.user.details?.lastName || '';
      const getFirstName = userReport.user.details?.firstName || '';
      const getFullName = `${getLastName.charAt(0)}.${getFirstName}`;

      return (
        <tr>
          <td>{getFullName || '-'}</td>
          <td>{userReport.user.employeeId || '-'}</td>

          <td>{userReport.user.details?.position || '-'}</td>

          <td>{userReport.totalHoursScheduled}</td>
          <td>{userReport.totalHoursWorked}</td>

          <td>{userReport.totalHoursVacation}</td>
          <td>{userReport.totalHoursUnpaidAbsence}</td>
          <td>{userReport.totalHoursSick}</td>

          <td>{userReport.shiftNotClosedDaysPerUser}</td>
          <td>{userReport.shiftNotClosedFee}</td>
          <td>{userReport.shiftNotClosedDeduction}</td>

          <td>{userReport.totalMinsLate?.toFixed(2)}</td>
          <td>{userReport.latenessFee}</td>
          <td>{userReport.totalMinsLateDeduction?.toFixed(2)}</td>

          <td>{userReport.totalDeduction?.toFixed(2)}</td>
        </tr>
      );

    case 'Pivot':
      return (
        <tr key={Math.random()}>
          <td>
            <b>{index}</b>
          </td>
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
  const { reportType, bichilReport, index } = props;
  if (reportType === 'Сүүлд') {
    const { groupTitle } = bichilReport;
    const groupReportLength = bichilReport.groupReport.length;

    return (
      <tbody>
        <>
          <tr>
            <td rowSpan={groupReportLength + 1} style={{ textAlign: 'center' }}>
              <b>{groupTitle}</b>
            </td>
          </tr>
          {bichilReport.groupReport.map((userReport, i) =>
            ReportRow(userReport, reportType, i)
          )}
        </>
      </tbody>
    );
  }

  return (
    <tbody>
      {bichilReport.groupReport.map(userReport =>
        ReportRow(userReport, reportType, index)
      )}
    </tbody>
  );
}

export default TableRow;
