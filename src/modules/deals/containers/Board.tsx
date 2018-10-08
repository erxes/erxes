import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../graphql';
import { IBoard } from '../types';
import Pipeline from './Pipeline';

const WithPipelinesQuery = ({ pipelinesQuery }) => {
  const pipelines = pipelinesQuery.dealPipelines || [];

  if (pipelines.length === 0) {
    return null;
  }

  return [pipelines[0]].map(pipeline => (
    <Pipeline pipeline={pipeline} key={pipeline._id} />
  ));
};

export default compose(
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ currentBoard }: { currentBoard: IBoard }) => ({
      variables: { boardId: currentBoard ? currentBoard._id : '' }
    })
  })
)(WithPipelinesQuery);
