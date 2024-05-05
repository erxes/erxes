import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import ChangeTrForm from '../components/ChangeTrForm';
import { mutations } from '../graphql';
import { ITransaction } from '../types';
import { __ } from 'coreui/utils';

type Props = {
  transaction: ITransaction;
  closeModal: () => void;
};

const TransactionFromContainer: React.FC<Props> = (props) => {
  const { transaction } = props;

  const renderButton = ({
    values,
    isSubmitted,
    disableLoading,
  }: IButtonMutateProps) => {
    const { closeModal } = props;

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
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  // const invoice = invoiceDetailQuery.invoiceDetail;

  const updatedProps = {
    ...props,
    renderButton,
    transaction: { ...transaction },
  };
  return <ChangeTrForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['activityLogs', 'schedules', 'transactionsMain'];
};

export default TransactionFromContainer;
