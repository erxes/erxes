import { RowTitle } from '@erxes/ui-engage/src/styles';
import React from 'react';

import { IKhanbankTransactionItem } from '../types';

type Props = {
  transaction: IKhanbankTransactionItem;
};

const Row = (props: Props) => {
  const { transaction } = props;

  const formatTime = (time: string) => {
    if (!time) {
      return '00:00:00';
    }

    const hour = time.slice(0, 2);
    const minute = time.slice(2, 4);
    const second = time.slice(4, 6);

    return `${hour}:${minute}:${second}`;
  };

  const beginBalance = () => {
    return Number(transaction.balance - transaction.amount).toLocaleString();
  };

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>
          {transaction.tranDate} {formatTime(transaction.time)}{' '}
        </RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{transaction.description}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{beginBalance()}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{transaction.balance.toLocaleString()}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{transaction.amount.toLocaleString()}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>{transaction.relatedAccount}</RowTitle>
      </td>
    </tr>
  );
};

export default Row;
