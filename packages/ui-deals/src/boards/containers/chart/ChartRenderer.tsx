import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { queries } from '../../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import ErrorMsg from '@erxes/ui/src/components/ErrorMsg';
import ChartRenderer from '../../components/chart/ChartRenderer';

type Props = {
  pipelineId: string;
  type: string;
  stackBy: string;
  chartType: string;
};

export default function ChartRendererContainer({
  pipelineId,
  type,
  stackBy,
  chartType
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
    return <Spinner />;
  }

  if (error) {
    return <ErrorMsg>{error.message}</ErrorMsg>;
  }

  const items = data.itemsCountByAssignedUser.groups || [];
  const assignees = data.itemsCountByAssignedUser.usersWithInfo || [];

  if (items.length === 0) {
    return <EmptyState text="No data" icon="piechart" />;
  }

  return (
    <ChartRenderer chartType={chartType} items={items} assignees={assignees} />
  );
}
