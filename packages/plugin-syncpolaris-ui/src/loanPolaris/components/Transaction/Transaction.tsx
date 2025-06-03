import { Box, Table } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';
import dayjs from 'dayjs';

import {
  ContractsTableWrapper,
  DidAmount,
  ExtraRow,
  ScrollTableColls
} from '../../styles';
import Icon from '@erxes/ui/src/components/Icon';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import Alert from '@erxes/ui/src/utils/Alert';
import { IContractDoc } from '../../types';

type Props = {
  contract: IContractDoc;
  sentTransaction: (data: any) => void;
};

function Transaction({ contract, sentTransaction }: Props) {
  const transactions = contract?.loanTransactionHistory || [];

  const onHandlePolaris = () =>
    confirm(__('Are you sure you want to send transactions?'))
      .then(() => {
        sentTransaction(transactions);
      })
      .catch((error) => {
        Alert.error(error.message);
      });

  const renderExtraButton = () => {
    return (
      !transactions[0].isSyncedTransaction && (
        <button onClick={onHandlePolaris} title="send transaction">
          <Icon icon="refresh-1" />
        </button>
      )
    );
  };

  const renderCell = (transaction, name) => {
    return <DidAmount> {(transaction[name] || 0).toLocaleString()}</DidAmount>;
  };

  return (
    <Box
      title={__('Transaction history')}
      name="showPolaris"
      isOpen={true}
      extraButtons={renderExtraButton()}
    >
      <ScrollTableColls>
        <ContractsTableWrapper>
          <Table>
            <thead>
              <tr>
                <th>{__('Date')}</th>
                <th>{__('Type')}</th>
                <th>{__('Saving Balance')}</th>
                <th>{__('Amount')}</th>
                <th>{__('Stored Interest')}</th>
                <th>{__('Total')}</th>
                <th>{__('Status')}</th>
              </tr>
            </thead>

            <tbody id="schedules">
              {transactions.map((transaction) => (
                <ExtraRow key={transaction._id}>
                  <td>{dayjs(transaction.payDate).format('YYYY/MM/DD')}</td>
                  <td>{transaction.transactionType}</td>
                  <td>{renderCell(transaction, 'balance')}</td>
                  <td>{renderCell(transaction, 'payment')}</td>
                  <td>{renderCell(transaction, 'storedInterest')}</td>
                  <td>{renderCell(transaction, 'total')}</td>
                  <td>
                    {transaction?.isSyncedTransaction ? 'Synced' : 'Not synced'}
                  </td>
                </ExtraRow>
              ))}
            </tbody>
          </Table>
        </ContractsTableWrapper>
      </ScrollTableColls>
    </Box>
  );
}

export default Transaction;
