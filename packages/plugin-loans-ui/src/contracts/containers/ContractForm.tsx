import * as compose from 'lodash.flowright';
import { withProps, ButtonMutate, withCurrentUser } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import ContractForm from '../components/list/ContractForm';
import { mutations } from '../graphql';
import { IContract } from '../types';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from 'coreui/utils';

type Props = {
  contract: IContract;
  getAssociatedContract?: (contractId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
} & Props;

class ContractFromContainer extends React.Component<FinalProps> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedContract, currentUser } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedContract) {
          getAssociatedContract(data.contractsAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations.contractsEdit : mutations.contractsAdd}
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
      renderButton
    };
    return <ContractForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    'contractsMain',
    'contractDetail',
    'contracts',
    'contractCounts',
    'activityLogs',
    'schedules'
  ];
};

export default withCurrentUser(
  withProps<Props>(compose()(ContractFromContainer))
);
