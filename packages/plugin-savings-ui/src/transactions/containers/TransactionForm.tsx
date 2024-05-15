import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import TransactionForm from '../components/TransactionForm';
import { mutations } from '../graphql';
import { ITransaction } from '../types';
import { __ } from 'coreui/utils';

type Props = {
  transaction: ITransaction;
  getAssociatedTransaction?: (transactionId: string) => void;
  closeModal: () => void;
};

const TransactionFromContainer: React.FC<Props> = (props) => {
  const { transaction } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const { closeModal, getAssociatedTransaction } = props;

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
  return ['activityLogs', 'savingsTransactionsMain'];
};

export default TransactionFromContainer;
