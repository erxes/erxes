import gql from 'graphql-tag';
import { EmptyState } from 'modules/common/components';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../graphql';
import { RootBack, ScrolledContent } from '../styles/common';
import { IOptions, PipelineDetailQueryResponse } from '../types';
import Pipeline from './Pipeline';

type Props = {
  queryParams: any;
  options: IOptions;
};

type FinalProps = {
  pipelineDetailQuery: PipelineDetailQueryResponse;
} & Props;

const WithPipelinesQuery = (props: FinalProps) => {
  const { pipelineDetailQuery, queryParams, options } = props;

  if (!pipelineDetailQuery || !pipelineDetailQuery.pipelineDetail) {
    return (
      <EmptyState
        image="/images/actions/18.svg"
        text="Oh boy, looks like you need to get a head start on your board"
        size="small"
      />
    );
  }

  if (pipelineDetailQuery.loading) {
    return null;
  }

  const pipeline = pipelineDetailQuery.pipelineDetail;

  return (
    <RootBack style={{ backgroundColor: pipeline.bgColor }}>
      <ScrolledContent transparent={true}>
        <Pipeline
          options={options}
          pipeline={pipeline}
          key={pipeline._id}
          queryParams={queryParams}
        />
      </ScrolledContent>
    </RootBack>
  );
};

export default withProps<Props>(
  compose(
    graphql<Props, PipelineDetailQueryResponse, { _id?: string }>(
      gql(queries.pipelineDetail),
      {
        name: 'pipelineDetailQuery',
        skip: ({ queryParams }) => !queryParams.pipelineId,
        options: ({ queryParams }) => ({
          variables: { _id: queryParams && queryParams.pipelineId }
        })
      }
    )
  )(WithPipelinesQuery)
);
