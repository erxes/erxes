import { ButtonMutate, withCurrentUser } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import ContractTypeForm from '../components/ContractTypeForm';
import { mutations } from '../graphql';
import { IContractType } from '../types';
import { __ } from 'coreui/utils';

type Props = {
  contractType: IContractType;
  getAssociatedContractType?: (contractTypeId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ContractTypeFromContainer: React.FC<FinalProps> = (props) => {
  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const { closeModal, getAssociatedContractType } = props;

    const afterSave = (data) => {
      closeModal();

      if (getAssociatedContractType) {
        getAssociatedContractType(data.savingsContractTypesAdd);
      }
    };

    return (
      <ButtonMutate
        mutation={
          object ? mutations.contractTypesEdit : mutations.contractTypesAdd
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

  const updatedProps = {
    ...props,
    renderButton,
  };
  return <ContractTypeForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    'contractTypesMain',
    'SavingsContractTypesMain',
    'savingsContractTypes',
  ];
};

export default withCurrentUser(ContractTypeFromContainer);
