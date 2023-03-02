import { __ } from '@erxes/ui/src/utils';
import React from 'react';

type Props = {
  reportType: string;
};

function TableHeaders(props: Props) {
  const { reportType } = props;

  switch (reportType) {
    case 'Урьдчилсан':
      return (
        <tr>
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
            <td>{__('Days')}</td>
            <td>{__('Hours')}</td>
            <td>{__('Worked days')}</td>
            <td>{__('Worked hours')}</td>
            <td>{__('Shift request')}</td>
            <td>{__('Overtime')}</td>
            <td>{__('Total')}</td>
            <td>{__('Mins Late')}</td>
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
            <td>{__('Team member Id')}</td>
            <td>{__('Last Name')}</td>
            <td>{__('First Name')}</td>
            <td>{__('Position')}</td>
            <td>{__('Date')}</td>
            <td>{__('Planned Check In')}</td>
            <td>{__('Planned Check Out')}</td>
            <td>{__('Planned Duration')}</td>
            <td>{__('Check In')}</td>
            <td>{__('In Device')}</td>
            <td>{__('Check Out')}</td>
            <td>{__('Out Device')}</td>
            <td>{__('Location')}</td>
            <td>{__('Duration')}</td>
            <td>{__('Overtime')}</td>
            <td>{__('Overnight')}</td>
            <td>{__('Mins Late')}</td>
          </tr>
        </>
      );

    default:
      return null;
  }
}

export default TableHeaders;
