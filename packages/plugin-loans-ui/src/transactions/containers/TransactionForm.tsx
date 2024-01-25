import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { IInvoice } from '../../invoices/types';
import TransactionForm from '../components/TransactionForm';
import { mutations } from '../graphql';
import { ITransaction } from '../types';
import { __ } from 'coreui/utils';

type Props = {
  contractId?: string;
  transaction: ITransaction;
  type: string;
  invoice?: IInvoice;
  getAssociatedTransaction?: (transactionId: string) => void;
  closeModal: () => void;
};

const TransactionFromContainer = (props: Props) => {
  const { transaction, closeModal, getAssociatedTransaction } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const afterSave = (data) => {
      closeModal();

      if (getAssociatedTransaction) {
        getAssociatedTransaction(data.transactionsAdd);
      }
    };

    return (
      <ButtonMutate
        mutation={
          object && object._id
            ? mutations.transactionsEdit
            : mutations.transactionsAdd
        }
        variables={values}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  // const invoice = invoiceDetailQuery.invoiceDetail;

  const updatedProps = {
    ...props,
    renderButton,
    // invoice,
    transaction: { ...transaction },
  };
  return <TransactionForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['activityLogs', 'schedules', 'transactionsMain'];
};

export default TransactionFromContainer;
