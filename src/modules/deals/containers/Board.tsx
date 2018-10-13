import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Spinner } from '../../common/components';
import { IPipeline } from '../../settings/deals/types';
import { queries } from '../graphql';
import Pipeline from './Pipeline';

const WithPipelinesQuery = ({ pipelineDetailQuery }) => {
  if (!pipelineDetailQuery) {
    return null;
  }

  if (pipelineDetailQuery.loading) {
    return <Spinner />;
  }

  const pipeline = pipelineDetailQuery.dealPipelineDetail;

  return <Pipeline pipeline={pipeline} key={pipeline._id} />;
};

export default compose(
  graphql(gql(queries.pipelineDetail), {
    name: 'pipelineDetailQuery',
    skip: ({ currentPipeline }: { currentPipeline: IPipeline }) =>
      !currentPipeline,
    options: ({ currentPipeline }: { currentPipeline: IPipeline }) => ({
      variables: { _id: currentPipeline._id }
    })
  })
)(WithPipelinesQuery);
