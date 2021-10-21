import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import EmptyState from 'modules/common/components/EmptyState';
import { queries } from '../../graphql';
import ChartLine from 'modules/boards/components/chart/ChartLine';
import ChartBar from 'modules/boards/components/chart/ChartBar';
import ChartArea from 'modules/boards/components/chart/ChartArea';
import ChartBarStack from 'modules/boards/components/chart/ChartBarStack';
import Spinner from 'modules/common/components/Spinner';
import ErrorMsg from 'modules/common/components/ErrorMsg';

type Props = {
  pipelineId: string;
  type: string;
  stackBy: string;
  chartType: string;
};

export default function ChartStackContainer({
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
    return <EmptyState text="this data is empty" icon="piechart" />;
  }

  if (chartType === 'line') {
    return <ChartLine items={items} assignees={assignees} />;
  }

  if (chartType === 'simpleBar') {
    return <ChartBar items={items} assignees={assignees} />;
  }

  if (chartType === 'area') {
    return <ChartArea items={items} assignees={assignees} />;
  }

  return <ChartBarStack items={items} assignees={assignees} />;
}
