import dayjs from 'dayjs';
import { __ } from 'coreui/utils';
import React from 'react';

import { ExtraRow, WillAmount } from '../../styles';
import { ITransaction } from '../../../transactions/types';

type Props = {
  transaction: ITransaction;
};

function TransactionRow({ transaction }: Props) {
  const renderCell = name => {
    return <WillAmount>{(transaction[name] || 0).toLocaleString()}</WillAmount>;
  };

  return (
    <ExtraRow isDefault={false} key={transaction._id}>
      <td>{dayjs(transaction.payDate).format('ll')}</td>
      <td>{__(`Loan ${transaction.transactionType}`)}</td>
      <td>{renderCell('payment')}</td>
      <td>{renderCell('interestEve')}</td>
      <td>{renderCell('undue')}</td>
      <td>{renderCell('total')}</td>
    </ExtraRow>
  );
}

export default TransactionRow;
