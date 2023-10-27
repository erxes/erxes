import dayjs from 'dayjs';
import { __ } from 'coreui/utils';
import _ from 'lodash';
import React from 'react';

import { ExtraRow, DidAmount, WillAmount } from '../../styles';
import { ITransaction } from '../../../transactions/types';

type Props = {
  transaction: ITransaction;
};

function ScheduleRow({ transaction }: Props) {
  const renderCell = name => {
    return (
      <>
        <DidAmount> {(transaction[name] || 0).toLocaleString()}</DidAmount>
      </>
    );
  };

  return (
    <ExtraRow key={transaction._id}>
      <td>{dayjs(transaction.payDate).format('ll')}</td>
      <td>{renderCell('balance')}</td>
      <td>{renderCell('payment')}</td>
      <td>{renderCell('storedInterest')}</td>
      <td>{renderCell('total')}</td>
    </ExtraRow>
  );
}

export default ScheduleRow;
