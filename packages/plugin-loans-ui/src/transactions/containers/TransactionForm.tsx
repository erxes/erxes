import { ButtonMutate, withProps } from '@erxes/ui/src';
import { IUser, UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';
import { IInvoice } from '../../invoices/types';
import TransactionForm from '../components/TransactionForm';
import { mutations } from '../graphql';
import { ITransaction } from '../types';

type Props = {
  transaction: ITransaction;
  invoice?: IInvoice;
  getAssociatedTransaction?: (transactionId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
} & Props;

class TransactionFromContainer extends React.Component<FinalProps> {
  render() {
    const { transaction } = this.props;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedTransaction } = this.props;

      const afterSave = data => {
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
        />
      );
    };

    // const invoice = invoiceDetailQuery.invoiceDetail;

    const updatedProps = {
      ...this.props,
      renderButton,
      // invoice,
      transaction: { ...transaction }
    };
    return <TransactionForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['activityLogs', 'schedules', 'transactionsMain'];
};

export default withProps<Props>(compose()(TransactionFromContainer));
