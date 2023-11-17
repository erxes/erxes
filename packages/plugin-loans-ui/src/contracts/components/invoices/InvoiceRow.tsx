import dayjs from 'dayjs';
import { __ } from 'coreui/utils';
import _ from 'lodash';
import React from 'react';

import { ExtraRow, DidAmount, WillAmount } from '../../styles';
import { IInvoice } from '../../types';

type Props = {
  schedule: IInvoice;
};

function ScheduleRow({ schedule }: Props) {
  const renderCell = name => {
    return (
      <>
        <WillAmount>{(schedule[name] || 0).toLocaleString()}</WillAmount>
      </>
    );
  };

  return (
    <ExtraRow isDefault={false} key={schedule._id}>
      <td>{dayjs(schedule.payDate).format('ll')}</td>
      <td>{(schedule.balance || 0).toLocaleString()}</td>
      <td>{renderCell('payment')}</td>
      <td>{renderCell('interest')}</td>
      <td>{renderCell('undue')}</td>
      <td>{renderCell('total')}</td>
    </ExtraRow>
  );
}

export default ScheduleRow;
