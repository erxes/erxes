import { ButtonMutate, withCurrentUser } from '@erxes/ui/src';
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
  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
    disabled,
  }: IButtonMutateProps & { disabled: boolean }) => {
    const { closeModal, getAssociatedContract, currentUser } = props;

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
        type="submit"
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
    'savingsContractsMain',
    'contractDetail',
    'contracts',
    'contractCounts',
    'activityLogs',
    'schedules',
  ];
};

export default withCurrentUser(ContractFromContainer);
