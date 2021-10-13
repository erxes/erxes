import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { queries } from '../../graphql';
import ChartStack from '../../components/chart/ChartStack';

type Props = {
  pipelineId: string;
  type: string;
  stackBy: string;
};

export default function ChartStackContainer({
  pipelineId,
  type,
  stackBy
}: Props) {
  const { data, loading, error } = useQuery(
    gql(queries.itemsCountByAssignedUser),
    {
      variables: {
        pipelineId,
        type,
        stackBy: stackBy || 'stage'
      }
    }
  );

  if (loading) {
    return <div>...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  const bars = data.itemsCountByAssignedUser.groups || [];
  const usersWithInfo = data.itemsCountByAssignedUser.usersWithInfo || [];

  return <ChartStack bars={bars} usersWithInfo={usersWithInfo} />;
}
