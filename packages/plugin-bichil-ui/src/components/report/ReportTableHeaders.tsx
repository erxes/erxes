import { __ } from '@erxes/ui/src/utils';
import React from 'react';

type Props = {
  reportType: string;
  showBranch: boolean;
  showDepartment: boolean;
};

function TableHeaders(props: Props) {
  const { reportType, showBranch, showDepartment } = props;

  switch (reportType) {
    case 'Урьдчилсан':
      return (
        <tr>
          <th>{__('№')}</th>
          <th>{__('Team member Id')}</th>
          <th>{__('Last Name')}</th>
          <th>{__('First Name')}</th>
          <th>{__('Position')}</th>
          <th>{__('Scheduled days')}</th>
          <th>{__('Worked days')}</th>
          <th>{__('Explanation')}</th>
        </tr>
      );
    case 'Сүүлд':
      return (
        <>
          <tr>
            <th rowSpan={2}>{__('№')}</th>
            {showDepartment && <th rowSpan={2}>{__('Department')}</th>}
            {showBranch && <th rowSpan={2}>{__('Branch')}</th>}
            <th rowSpan={2}>{__('Team member Id')}</th>
            <th rowSpan={2}>{__('Position')}</th>
            <th rowSpan={2}>{__('Last Name')}</th>
            <th rowSpan={2}>{__('First Name')}</th>
            <th rowSpan={2}>{__('Total Days of Calendar')}</th>
            <th rowSpan={2}>{__('Total Weekend Days')}</th>
            <th colSpan={2}>{__('Scheduled time')}</th>
            <th colSpan={6} style={{ textAlign: 'center' }}>
              {__('Timeclock info')}
            </th>
          </tr>
          <tr>
            <th>{__('Days')}</th>
            <th>{__('Hours')}</th>
            <th>{__('Worked days')}</th>
            <th>{__('Worked hours')}</th>
            <th>{__('Shift request')}</th>
            <th>{__('Overtime')}</th>
            <th>{__('Mins Late')}</th>
          </tr>
        </>
      );
    case 'Pivot':
      return (
        <>
          <tr>
            <th
              colSpan={4}
              style={{ textAlign: 'center', border: '1px solid #EEE' }}
            >
              {__('Generar Information')}
            </th>
            <th>{__('Time')}</th>
            <th
              colSpan={3}
              style={{ textAlign: 'center', border: '1px solid #EEE' }}
            >
              {__('Schedule')}
            </th>
            <th
              colSpan={8}
              style={{ textAlign: 'center', border: '1px solid #EEE' }}
            >
              {__('Performance')}
            </th>
          </tr>
          <tr>
            <th>{__('№')}</th>
            <th>{__('Team member Id')}</th>
            <th>{__('Last Name')}</th>
            <th>{__('First Name')}</th>
            <th>{__('Position')}</th>
            <th>{__('Date')}</th>
            <th>{__('Planned Check In')}</th>
            <th>{__('Planned Check Out')}</th>
            <th>{__('Planned Duration')}</th>
            <th>{__('Check In')}</th>
            <th>{__('In Device')}</th>
            <th>{__('Check Out')}</th>
            <th>{__('Out Device')}</th>
            <th>{__('Location')}</th>
            <th>{__('Duration')}</th>
            <th>{__('Overtime')}</th>
            <th>{__('Overnight')}</th>
            <th>{__('Mins Late')}</th>
          </tr>
        </>
      );

    default:
      return null;
  }
}

export default TableHeaders;
