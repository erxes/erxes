import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import EmptyState from 'modules/common/components/EmptyState';
import { queries } from '../../graphql';
import Spinner from 'modules/common/components/Spinner';
import ErrorMsg from 'modules/common/components/ErrorMsg';
import ChartRenderer from 'modules/boards/components/chart/ChartRenderer';

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
