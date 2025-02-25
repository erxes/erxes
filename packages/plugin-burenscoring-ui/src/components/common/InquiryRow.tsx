import dayjs from 'dayjs';
import React from 'react';

import { ExtraRow } from '../../styles';

type Props = {
  inquiry: any;
};

function ScheduleRow({ inquiry }: Props) {
  return (
    <ExtraRow key={inquiry._id}>
      <td>{inquiry?.LOANCLASS || ''}</td>
      <td>{inquiry?.LOANTYPE || ''}</td>
      <td>{inquiry?.BALANCE || ''}</td>
      <td>{inquiry?.ADVAMOUNT || ''}</td>
      <td>{dayjs(inquiry?.EXPDATE).format('YYYY-MM-DD')}</td>
      <td>{inquiry?.ORGNAME || ''}</td>
    </ExtraRow>
  );
}

export default ScheduleRow;
