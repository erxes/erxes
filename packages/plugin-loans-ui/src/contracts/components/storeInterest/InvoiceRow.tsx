import dayjs from 'dayjs';
import React from 'react';

import { ExtraRow, WillAmount } from '../../styles';
import { IInvoice } from '../../types';

type Props = {
  schedule: IInvoice;
};

function ScheduleRow({ schedule }: Props) {
  const renderCell = name => {
    return <WillAmount>{(schedule[name] || 0).toLocaleString()}</WillAmount>;
  };

  return (
    <ExtraRow isDefault={false} key={schedule._id}>
      <td>{dayjs(schedule.invDate).format('ll')}</td>

      <td>{renderCell('amount')}</td>
    </ExtraRow>
  );
}

export default ScheduleRow;
