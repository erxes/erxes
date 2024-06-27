import { ButtonMutate, withProps, __} from '@erxes/ui/src';
import { IUser, UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';
import NonBalanceTransactionForm from '../components/AddForm';
import { mutations } from '../graphql';
import { INonBalanceTransaction } from '../types';
type Props = {
  nonBalanceTransaction: INonBalanceTransaction;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
} & Props;
class NonBalanceTransactionContainer extends React.Component<FinalProps> {
  render() {
    const { nonBalanceTransaction } = this.props;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal } = this.props;

      const afterSave = () => {
        closeModal();
        getRefetchQueries()
      };

      return (
        <ButtonMutate
          mutation={mutations.nonBalanceTransactionsAdd}
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
    const updatedProps = {
      ...this.props,
      renderButton,
      nonBalanceTransaction: { ...nonBalanceTransaction }
    };
    return <NonBalanceTransactionForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['nonBalanceTransactionsMain'];
};

export default withProps<Props>(compose()(NonBalanceTransactionContainer));
