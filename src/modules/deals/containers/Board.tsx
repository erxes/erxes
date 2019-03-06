import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { EmptyState, Spinner } from '../../common/components';
import { withProps } from '../../common/utils';
import { queries } from '../graphql';
import { IPipeline, PipelineDetailQueryResponse } from '../types';
import Pipeline from './Pipeline';

type Props = {
  currentPipeline?: IPipeline;
};

type FinalProps = {
  pipelineDetailQuery: PipelineDetailQueryResponse;
} & Props;

const WithPipelinesQuery = (props: FinalProps) => {
  const { pipelineDetailQuery } = props;

  if (!pipelineDetailQuery) {
    return (
      <EmptyState
        image="/images/actions/19.svg"
        text="Oh boy, looks like you need to get a head start on your deals"
        size="small"
      />
    );
  }

  if (pipelineDetailQuery.loading) {
    return <Spinner />;
  }

  const pipeline = pipelineDetailQuery.dealPipelineDetail;

  return <Pipeline pipeline={pipeline} key={pipeline._id} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, PipelineDetailQueryResponse, { _id?: string }>(
      gql(queries.pipelineDetail),
      {
        name: 'pipelineDetailQuery',
        skip: ({ currentPipeline }) => !currentPipeline,
        options: ({ currentPipeline }) => ({
          variables: { _id: currentPipeline && currentPipeline._id }
        })
      }
    )
  )(WithPipelinesQuery)
);
