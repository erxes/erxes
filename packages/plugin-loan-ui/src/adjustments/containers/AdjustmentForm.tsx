import { ButtonMutate, withProps } from '@erxes/ui/src';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';

import AdjustmentForm from '../components/AdjustmentForm';
import { mutations } from '../graphql';
import { IAdjustment } from '../types';

type Props = {
  adjustment: IAdjustment;
  getAssociatedAdjustment?: (adjustmentId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
} & Props;

class AdjustmentFromContainer extends React.Component<FinalProps> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedAdjustment } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedAdjustment) {
          getAssociatedAdjustment(data.adjustmentsAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={
            object ? mutations.adjustmentsEdit : mutations.adjustmentsAdd
          }
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton
    };
    return <AdjustmentForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['adjustmentsMain', 'adjustmentDetail', 'adjustments'];
};

export default withProps<Props>(compose()(AdjustmentFromContainer));
