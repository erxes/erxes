import Table from '@erxes/ui/src/components/table';
import { __ } from 'coreui/utils';
import React from 'react';

import TransactionRow from './TransactionRow';
import { ITransaction } from '../../../transactions/types';

interface IProps {
  transactions: ITransaction[];
}

const TransactionList = (props: IProps) => {
  const { transactions } = props;

  return (
    <Table $striped>
      <thead>
        <tr>
          <th>{__('Date')}</th>
          <th>{__('Type')}</th>
          <th>{__('Loan Payment')}</th>
          <th>{__('Interest')}</th>
          <th>{__('Loss')}</th>
          <th>{__('Total')}</th>
        </tr>
      </thead>
      <tbody id="schedules">
        {transactions.map((transaction) => (
          <TransactionRow
            transaction={transaction}
            key={transaction._id}
          ></TransactionRow>
        ))}
      </tbody>
    </Table>
  );
};

export default TransactionList;
