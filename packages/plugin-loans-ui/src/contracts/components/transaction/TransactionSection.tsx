import Box from '@erxes/ui/src/components/Box';
import { __ } from 'coreui/utils';
import React from 'react';
import Icon from '@erxes/ui/src/components/Icon';
import { ScrollTableColls } from '../../styles';
import withConsumer from '../../../withConsumer';
import TransactionList from './TransactionList';
import { ITransaction } from '../../../transactions/types';
import { ModalTrigger } from '@erxes/ui/src';
import TransactionForm from '../../../transactions/containers/TransactionForm';

type Props = {
  transactions: ITransaction[];
  contractId: string;
};

function TransactionSection({ transactions, contractId }: Props) {
  const repaymentForm = props => {
    return (
      <TransactionForm {...props} contractId={contractId} type="repayment" />
    );
  };

  return (
    <Box
      title={__(`Transactions`)}
      name="showSchedules"
      isOpen
      extraButtons={
        <ModalTrigger
          title={`${__('Repayment Transaction')}`}
          trigger={
            <button>
              <Icon icon="edit-3" />
            </button>
          }
          size="lg"
          content={repaymentForm}
        />
      }
    >
      <ScrollTableColls>
        <TransactionList transactions={transactions} />
      </ScrollTableColls>
    </Box>
  );
}

export default withConsumer(TransactionSection);
