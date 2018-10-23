import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Spinner } from '../../common/components';
import { withProps } from '../../common/utils';
import { queries } from '../graphql';
import { IPipeline } from '../types';
import Pipeline from './Pipeline';

type PipelineDetailQueryResponse = {
  dealPipelineDetail: IPipeline;
  loading: boolean;
};

type Props = {
  currentPipeline?: IPipeline;
};

type FinalProps = {
  pipelineDetailQuery: PipelineDetailQueryResponse;
} & Props;

const WithPipelinesQuery = (props: FinalProps) => {
  const { pipelineDetailQuery } = props;

  if (!pipelineDetailQuery) {
    return null;
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
