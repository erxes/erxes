import React from 'react';

import { gql, useQuery } from '@apollo/client';

import Goal from '../../components/goal/Goal';
import { queries, mutations } from '../../graphql';
import { GoalTypesQueryResponse } from '../../types';

type Props = {
  history: any;
  queryParams: any;
};

const GoalContainer = (props: Props) => {
  const { queryParams } = props;
  const goalQuery = useQuery(gql(queries.goalTypesDetail), {
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
