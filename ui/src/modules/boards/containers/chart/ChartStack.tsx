import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { queries } from '../../graphql';
import ChartStack from '../../components/chart/ChartStack';

type Props = {
  pipelineId: string;
};

export default function ChartStackContainer({ pipelineId }: Props) {
  const { data, loading } = useQuery(gql(queries.stagesByAssignedUser), {
    variables: {
      pipelineId
    }
  });

  if (loading) {
    return <div>...</div>;
  }

  const stages = data.stagesByAssignedUser.stages;
  const usersWithInfo = data.stagesByAssignedUser.usersWithInfo;

  return <ChartStack stages={stages} usersWithInfo={usersWithInfo} />;
}
