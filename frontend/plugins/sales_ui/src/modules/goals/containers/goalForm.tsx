import { gql, useQuery } from '@apollo/client';
import { useApolloClient, useMutation } from '@apollo/client';
import { Spinner } from 'erxes-ui';
// import {
//   BranchesMainQueryResponse,
//   DepartmentsMainQueryResponse,
//   UnitsMainQueryResponse
// } from '@erxes/ui/src/team/types';
import { useBranchesMain } from '../../../../../../libs/ui-modules/src/modules/structure/hooks/useBranchesMain';
import { useUnits } from '../../../../../../libs/ui-modules/src/modules/structure/hooks/useUnits';
import { useDepartmentsMain } from '../../../../../../libs/ui-modules/src/modules/structure/hooks/useDepartmentsMain';
import { Button } from '../../../../../../libs/erxes-ui/src/components/button';
// import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import mutations  from '../graphql/mutations';
import queries from '../graphql/queries';
import { IGoalType } from '../types';
import GoalForm from '../components/goalForm';
import { toast } from 'erxes-ui';
// import { CompaniesQueryResponse } from '@erxes/ui-contacts/src/companies/types';
// import { queries as companyQueries } from '@erxes/ui-contacts/src/companies/graphql';
// import { TagsQueryResponse } from '@erxes/ui-tags/src/types';
// import { queries as tagQueries } from '../../../../../../libs/ui-modules/src/modules/tags/graphql/queries/tagsQueries';


type Props = {
  goalType?: IGoalType;
  getAssociatedGoalType?: (goal: IGoalType) => void;
  closeModal: () => void;
};

const GoalFormContainer = (props: Props) => {
  const { closeModal, getAssociatedGoalType, goalType } = props;

  const branchListQuery = useBranchesMain();
  const unitListQuery = useUnits();
  const departmentListQuery = useDepartmentsMain();


  const [addGoal, addStatus] = useMutation(mutations.goalsAdd);
  const [editGoal, editStatus] = useMutation(mutations.goalsEdit);

  if (branchListQuery.loading || unitListQuery.loading || departmentListQuery.loading) {
    return <Spinner />;
  }

  const renderButton = ({ values }: any) => {
    const loading = addStatus.loading || editStatus.loading;

    const handleSave = async () => {
  try {
    const requiredFields = ['name', 'entity', 'contributionType', 'periodGoal'];
    const missingFields = requiredFields.filter(field => !values[field]);
    
    if (missingFields.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Missing required fields',
        description: `Please fill in: ${missingFields.join(', ')}`,
      });
      return;
    }

    const mutation = goalType ? editGoal : addGoal;
    const { data } = await mutation({
      variables: {
        ...values,
        id: goalType?._id,
      },
      refetchQueries: ['goalTypesMain']
    });

    if (!data?.goalsAdd && !data?.goalsEdit) {
      throw new Error('Server returned null response');
    }
    
    closeModal();
  } catch (e) {
    console.error('Mutation error:', e);
    toast({
      variant: 'destructive',
      title: 'Error',
      description: e.message || 'Failed to save goal type',
    });
  }
};

    return (
      <Button type="button" onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
    );
  };

  return (
    <GoalForm
      {...props}
      segmentIds={[]}
      renderButton={renderButton}
    />
  );
};

export default GoalFormContainer;