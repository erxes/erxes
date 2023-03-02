import { __ } from '@erxes/ui/src/utils';
import React from 'react';

type Props = {
  history: any;
};

function TableHeaders(props: Props) {
  return (
    <>
      <tr>
        <th rowSpan={2}>{__('Team member id')}</th>
        <th rowSpan={2}>{__('Position')}</th>
        <th rowSpan={2}>{__('Last Name')}</th>
        <th rowSpan={2}>{__('First Name')}</th>
        <th colSpan={2}>{__('Scheduled time')}</th>
        <th colSpan={6} style={{ textAlign: 'center' }}>
          {__('Timeclock info')}
        </th>
        <th colSpan={3} style={{ textAlign: 'center' }}>
          {__('Absence info')}
        </th>
      </tr>
      <tr>
        <td>{__('Days')}</td>
        <td>{__('Hours')}</td>
        <td>{__('Worked days')}</td>
        <td>{__('Worked hours')}</td>
        <td>{__('Overtime')}</td>
        <td>{__('Overnight')}</td>
        <td>{__('Total')}</td>
        <td>{__('Mins Late')}</td>
        <td>{__('-')}</td>
        <td>{__('-')}</td>
        <td>{__('-')}</td>
      </tr>
    </>
  );
}

export default TableHeaders;
