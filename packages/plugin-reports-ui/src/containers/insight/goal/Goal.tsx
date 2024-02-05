import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../../../graphql';
import Goal from '../../../components/insight/goal/Goal';
import { Alert, __, confirm } from '@erxes/ui/src';

type Props = {
  queryParams: any;
  history: any;
};

const GoalContainer = (props: Props) => {
  const { queryParams } = props;

  const goalQuery = useQuery(gql(queries.goalDetail), {
    skip: !queryParams.goalId,
    variables: {
      id: queryParams.goalId,
    },
  });

  const goal = goalQuery?.data?.goalDetail || {};
  const loading = goalQuery.loading;

  const updatedProps = {
    ...props,
    goal,
    loading,
  };

  return <Goal {...updatedProps} />;
};

export default GoalContainer;
