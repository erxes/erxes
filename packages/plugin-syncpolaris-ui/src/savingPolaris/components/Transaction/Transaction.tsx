import { Box } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';
import { Table } from '@erxes/ui/src';
import dayjs from 'dayjs';

import { ContractsTableWrapper, DidAmount, ExtraRow } from '../../styles';
import { ScrollTableColls } from '../../styles';
import Icon from '@erxes/ui/src/components/Icon';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import Alert from '@erxes/ui/src/utils/Alert';
import { IContractDoc } from '../../types';

type Props = {
  contract: IContractDoc;
  sentTransaction: (data: any) => void;
};

function Transaction({ contract, sentTransaction }: Props) {
  const transactions = contract?.savingTransactionHistory || [];

  const onHandlePolaris = () =>
    confirm(__('Are you sure you want to activate Savings?'))
      .then(() => {
        if (contract.isDeposit) {
          return sentTransaction(contract);
        } else {
          return sentTransaction(contract);
        }
      })
      .catch((error) => {
        Alert.error(error.message);
      });

  const renderExtraButton = () => {
    return (
      !contract.isActiveSaving && (
        <button onClick={onHandlePolaris} title="active contract">
          <Icon icon="refresh-1" />
        </button>
      )
    );
  };

  const renderCell = (transaction, name) => {
    return (
      <>
        <DidAmount> {(transaction[name] || 0).toLocaleString()}</DidAmount>
      </>
    );
  };

  return (
    <Box
      title={__('Active Saving')}
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
