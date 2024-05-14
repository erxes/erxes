import { ButtonMutate } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { mutations } from '../../graphql';
import { IContract } from '../../types';
import ExpandForm from '../../components/detail/ExpandForm';

type Props = {
  contract: IContract;
  closeModal: () => void;
};

const CloseFromContainer = (props: Props) => {
  const { contract, closeModal } = props;

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const afterSave = () => {
      closeModal();
    };

    return (
      <ButtonMutate
        mutation={mutations.expandContract}
        variables={values}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={__(`You successfully expand this contract`)}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    contract,
    renderButton,
  };

  return <ExpandForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['savingsContractsMain', 'savingsContractDetail', 'savingsContracts'];
};

export default CloseFromContainer;
