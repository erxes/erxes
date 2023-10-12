import { ButtonMutate, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';

import GoalTypeForm from '../components/goalTypeForm';
import { mutations } from '../graphql';
import { IGoalType } from '../types';
import { __ } from 'coreui/utils';
type Props = {
  goalType: IGoalType;
  getAssociatedGoalType?: (insuranceTypeId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
} & Props;

class GoalTypeFromContainer extends React.Component<FinalProps> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedGoalType } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedGoalType) {
          getAssociatedGoalType(data.goalTypesAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations.goalTypesEdit : mutations.goalTypesAdd}
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
    return <GoalTypeForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['goalTypesMain', 'goalTypeDetail', 'goalTypes'];
};

export default withProps<Props>(compose()(GoalTypeFromContainer));
