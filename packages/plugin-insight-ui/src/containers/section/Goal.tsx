import React from 'react';
import GoalSection from '../../components/section/Goal';
import { gql, useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../../graphql';
import { Alert, __, confirm, router } from '@erxes/ui/src';
import {
  RemoveMutationVariables,
  SectionsListQueryResponse,
} from '../../types';

type Props = {
  history: any;
  queryParams: any;
};

const GoalSectionContainer = (props: Props) => {
  const { queryParams, history } = props;
  const { goalId, dashboardId, reportId } = queryParams;

  const goalsQuery = useQuery(gql(queries.goalTypesMain));
  const sectionsQuery = useQuery<SectionsListQueryResponse>(
    gql(queries.sectionList),
    {
      variables: {
        type: 'goal',
      },
    },
  );

  const [goalTypesRemove] = useMutation<RemoveMutationVariables>(
    gql(mutations.goalTypesRemove),
    {
      // refetchQueries: ['sections']
      refetchQueries: ['goalTypesMain'],
    },
  );

  const removeGoalTypes = (ids: string[]) => {
    confirm(__('Are you sure to delete selected goal?')).then(() => {
      goalTypesRemove({
        variables: { goalTypeIds: ids },
      })
        .then(() => {
          router.removeParams(history, 'goalId');
          Alert.success('You successfully deleted a goalType');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const sections = sectionsQuery?.data?.sections || [];
  const { list = [] } = goalsQuery?.data?.goalTypesMain || {};

  const updatedProps = {
    ...props,
    goals: list,
    sections,
    removeGoalTypes,
  };

  return <GoalSection {...updatedProps} />;
};

export default GoalSectionContainer;
