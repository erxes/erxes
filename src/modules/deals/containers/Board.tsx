import { EmptyState } from 'modules/common/components';
import { IQueryParams } from 'modules/common/types';
import * as React from 'react';
import { PipelineContent } from '../styles/common';
import { IPipeline, PipelineDetailQueryResponse } from '../types';
import Pipeline from './Pipeline';

type Props = {
  backgroundColor?: string;
  queryParams: IQueryParams;
  pipeline: IPipeline;
};

const Board = (props: Props) => {
  const { pipeline, queryParams, backgroundColor } = props;

  if (!pipeline) {
    return (
      <EmptyState
        image="/images/actions/18.svg"
        text="Oh boy, looks like you need to get a head start on your deals"
        size="small"
        light={true}
      />
    );
  }

  const color = backgroundColor || pipeline.backgroundColor || '';

  return (
    <PipelineContent color={color}>
      <Pipeline
        key={pipeline._id}
        queryParams={queryParams}
        pipeline={pipeline}
      />
    </PipelineContent>
  );
};

export default Board;
