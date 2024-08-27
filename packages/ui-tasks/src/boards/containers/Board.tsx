import { ChartBack, RootBack, ScrolledContent } from '../styles/common';
import { EMPTY_CONTENT_PURCHASE } from '../constants';
import { IOptions, PipelineDetailQueryResponse } from '../types';
import { gql, useQuery } from '@apollo/client';

import ChartStack from './chart/ChartRenderer';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { IDateColumn } from '@erxes/ui/src/types';
import Pipeline from './Pipeline';
import PipelineActivity from './PipelineActivity';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import ViewGroupBy from './ViewGroupBy';
import { queries } from '../graphql';

type Props = {
  date?: IDateColumn;
} & WrapperProps;

type WrapperProps = {
  queryParams: any;
  options: IOptions;
  viewType?: string;
};

function Board(props: Props & WrapperProps) {
  const { queryParams, options, viewType } = props;

  const { loading, data } = useQuery<PipelineDetailQueryResponse>(
    gql(queries.pipelineDetail),
    {
      variables: { _id: queryParams && queryParams.pipelineId },
      skip: !queryParams.pipelineId,
    }
  );

  if (loading) {
    return <Spinner />;
  }

  if (!data || !data.tasksPipelineDetail) {
    const type = options.type;

    if (type === 'purchase') {
      return (
        <EmptyContent content={EMPTY_CONTENT_PURCHASE} maxItemWidth='400px' />
      );
    }

    return (
      <EmptyState
        image='/images/actions/18.svg'
        text='Oh boy, looks like you need to get a head start on your board'
        size='small'
        light={true}
      />
    );
  }

  const pipeline = data.tasksPipelineDetail;

  if (viewType === 'activity') {
    return (
      <PipelineActivity
        key={pipeline._id}
        options={options}
        pipeline={pipeline}
        queryParams={queryParams}
      />
    );
  }

  if (viewType === 'list' || viewType === 'gantt') {
    return (
      <ViewGroupBy
        key={pipeline._id}
        options={options}
        pipeline={pipeline}
        queryParams={queryParams}
        viewType={viewType}
      />
    );
  }

  if (viewType === 'chart') {
    return (
      <ChartBack>
        <ChartStack
          stackBy={queryParams.stackBy}
          type={options.type}
          pipelineId={pipeline._id}
          chartType={queryParams.chartType}
        />
      </ChartBack>
    );
  }

  if (viewType === 'time') {
    return (
      <RootBack style={{ backgroundColor: '#fff' }}>
        <ScrolledContent>
          <ViewGroupBy
            key={pipeline._id}
            options={options}
            pipeline={pipeline}
            queryParams={queryParams}
            viewType={viewType}
          />
        </ScrolledContent>
      </RootBack>
    );
  }

  return (
    <RootBack style={{ backgroundColor: pipeline.bgColor }}>
      <ScrolledContent>
        <Pipeline
          key={pipeline._id}
          options={options}
          pipeline={pipeline}
          queryParams={queryParams}
          navigate={''}
          location={''}
        />
      </ScrolledContent>
    </RootBack>
  );
}

export default Board;
