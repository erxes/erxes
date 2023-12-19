import { ButtonMutate, withProps } from '@erxes/ui/src';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
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

type FinalProps = {
  usersQuery: UsersQueryResponse;
} & Props;

class PeriodLockFromContainer extends React.Component<FinalProps> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedPeriodLock } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedPeriodLock) {
          getAssociatedPeriodLock(data.periodLocksAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={
            object ? mutations.periodLocksEdit : mutations.periodLocksAdd
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
      ...this.props,
      renderButton
    };
    return <PeriodLockForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    'savingsPeriodLocksMain',
    'savingsPeriodLockDetail',
    'savingsPeriodLocks'
  ];
};

export default withProps<Props>(compose()(PeriodLockFromContainer));
