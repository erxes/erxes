import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../../../graphql';
import Goals from '../../../components/insight/section/Goals';
import { Alert, __, confirm } from '@erxes/ui/src';

type Props = {
  queryParams: any;
  history: any;
};

const GoalsContainer = (props: Props) => {
  const goalsQuery = useQuery(gql(queries.goalsList));

  const [goalTypesRemove] = useMutation(gql(mutations.goalTypesRemove), {
    refetchQueries: ['goalTypesMain'],
  });

  const removeGoalTypes = (ids: string[]) => {
    goalTypesRemove({
      variables: { goalTypeIds: ids },
    })
      .then(() => {
        Alert.success('You successfully deleted a goalType');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const { list = [] } = goalsQuery?.data?.goalTypesMain || {};

  const updatedProps = {
    ...props,
    goals: list,
    removeGoalTypes,
  };

  return <Goals {...updatedProps} />;
};

export default GoalsContainer;
