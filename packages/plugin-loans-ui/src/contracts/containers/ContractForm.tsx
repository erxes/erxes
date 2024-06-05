import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import ContractForm from '../components/list/ContractForm';
import { mutations } from '../graphql';
import { IContract } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from 'coreui/utils';

type Props = {
  contract: IContract;
  getAssociatedContract?: (contractId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ContractFromContainer = (props: FinalProps) => {
  const { closeModal, getAssociatedContract, currentUser } = props;
  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
    disabled,
  }: IButtonMutateProps & { disabled: boolean }) => {
    const afterSave = (data) => {
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
        disabled={disabled}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };
  return <ContractForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    'contractsMain',
    'contractDetail',
    'contracts',
    'contractCounts',
    'activityLogs',
    'schedules',
  ];
};

export default withCurrentUser(ContractFromContainer);
