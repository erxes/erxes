import { gql, useQuery } from '@apollo/client';
import { ButtonMutate, Spinner, __ } from '@erxes/ui/src';
import {
  BranchesMainQueryResponse,
  DepartmentsMainQueryResponse,
  UnitsMainQueryResponse
} from '@erxes/ui/src/team/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import GoalTypeForm from '../components/goalForm';
import { mutations, queries } from '../graphql';
import { IGoalType } from '../types';
import { CompaniesQueryResponse } from '@erxes/ui-contacts/src/companies/types';
import { queries as companyQueries } from '@erxes/ui-contacts/src/companies/graphql';
import { TagsQueryResponse } from '@erxes/ui-tags/src/types';
import { queries as tagQueries } from '@erxes/ui-tags/src/graphql';

type Props = {
  goalType: IGoalType;
  getAssociatedGoalType?: (insuranceTypeId: string) => void;
  closeModal: () => void;
};

const goalForm = (props: Props) => {
  const { closeModal, getAssociatedGoalType } = props;

  const branchListQuery = useQuery<BranchesMainQueryResponse>(
    gql(queries.branchesMain),
    {
      variables: {
        withoutUserFilter: true
      }
    }
  );

  const unitListQuery = useQuery<UnitsMainQueryResponse>(
    gql(queries.unitsMain),
    {
      variables: {
        withoutUserFilter: true
      }
    }
  );

  const departmentListQuery = useQuery<DepartmentsMainQueryResponse>(
    gql(queries.departmentsMain),
    {
      variables: {
        withoutUserFilter: true
      }
    }
  );

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
    const afterSave = (data) => {
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
        refetchQueries={['goalTypesMain', 'goalTypeDetail', 'goalTypes']}
        isSubmitted={isSubmitted}
        type='submit'
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}>
        {__('Save')}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };
  return (
    <GoalTypeForm
      segmentIds={[]}
      {...updatedProps}
    />
  );
};

export default goalForm;
