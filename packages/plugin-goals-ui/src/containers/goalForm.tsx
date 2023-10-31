import { Button, ButtonMutate, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';
import GoalTypeForm from '../components/goalForm';
import { mutations, queries } from '../graphql';
import { IGoalType } from '../types';
import { __ } from 'coreui/utils';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import {
  BranchesMainQueryResponse,
  DepartmentsMainQueryResponse,
  UnitsMainQueryResponse
} from '@erxes/ui/src/team/types';
import { EmptyState, Spinner } from '@erxes/ui/src';

type Props = {
  goalType: IGoalType;
  getAssociatedGoalType?: (insuranceTypeId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  branchListQuery: BranchesMainQueryResponse;
  unitListQuery: UnitsMainQueryResponse;
  departmentListQuery: DepartmentsMainQueryResponse;
} & Props;

class GoalTypeFromContainer extends React.Component<FinalProps> {
  render() {
    const { branchListQuery, unitListQuery, departmentListQuery } = this.props;

    if (
      branchListQuery.loading ||
      unitListQuery.loading ||
      departmentListQuery.loading
    ) {
      return <Spinner />;
    }

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
export default withProps<{}>(
  compose(
    graphql<{}>(gql(queries.branchesMain), {
      name: 'branchListQuery',
      options: () => ({
        variables: {
          withoutUserFilter: true
        }
      })
    }),
    graphql<{}>(gql(queries.unitsMain), {
      name: 'unitListQuery',
      options: () => ({
        variables: {
          withoutUserFilter: true
        }
      })
    }),
    graphql<{}>(gql(queries.departmentsMain), {
      name: 'departmentListQuery',
      options: () => ({
        variables: {
          withoutUserFilter: true
        }
      })
    })
  )(GoalTypeFromContainer)
);

// export default withProps<Props>(compose()(GoalTypeFromContainer));
