import { ButtonMutate, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';

import ChangeTrForm from '../components/ChangeTrForm';
import { mutations } from '../graphql';
import { ITransaction } from '../types';

type Props = {
  transaction: ITransaction;
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
      values,
      isSubmitted,
      disableLoading
    }: IButtonMutateProps) => {
      const { closeModal } = this.props;

      const afterSave = () => {
        closeModal();
      };

      return (
        <ButtonMutate
          mutation={mutations.transactionsChange}
          disabled={disableLoading}
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully changed transaction`}
        />
      );
    };

    // const invoice = invoiceDetailQuery.invoiceDetail;

    const updatedProps = {
      ...this.props,
      renderButton,
      transaction: { ...transaction }
    };
    return <ChangeTrForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['activityLogs', 'schedules', 'transactionsMain'];
};

export default withProps<Props>(compose()(TransactionFromContainer));
