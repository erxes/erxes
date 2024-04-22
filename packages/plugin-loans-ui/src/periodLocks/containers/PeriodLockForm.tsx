import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import PeriodLockForm from '../components/PeriodLockForm';
import { mutations } from '../graphql';
import { IPeriodLock } from '../types';
import { __ } from 'coreui/utils';

type Props = {
  periodLock: IPeriodLock;
  getAssociatedPeriodLock?: (periodLockId: string) => void;
  closeModal: () => void;
};

const PeriodLockFromContainer = (props: Props) => {
  const { closeModal, getAssociatedPeriodLock } = props;
  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const afterSave = (data) => {
      closeModal();

      if (getAssociatedPeriodLock) {
        getAssociatedPeriodLock(data.periodLocksAdd);
      }
    };

    return (
      <ButtonMutate
        mutation={object ? mutations.periodLocksEdit : mutations.periodLocksAdd}
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
  return <PeriodLockForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['periodLocksMain', 'periodLockDetail', 'periodLocks'];
};

export default PeriodLockFromContainer;
