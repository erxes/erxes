import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { mutations } from '../../graphql';
import { IContract } from '../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from 'coreui/utils';
import RelCustomers from '../../components/detail/RelCustomersForm';

type Props = {
  contract: IContract;
  closeModal: () => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const RelCustomersFormContainer = (props: FinalProps) => {
  const { closeModal } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.contractsEdit}
        variables={values}
        callback={closeModal}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
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

  return <RelCustomers {...updatedProps} />;
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

export default RelCustomersFormContainer;
