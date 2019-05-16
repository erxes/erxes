import gql from 'graphql-tag';
import { EmptyState } from 'modules/common/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../graphql';
import { PipelineDetailQueryResponse } from '../types';
import { withProps } from '../utils';
import Pipeline from './Pipeline';

type Props = {
  queryParams: any;
  type: string;
};

type FinalProps = {
  pipelineDetailQuery: PipelineDetailQueryResponse;
} & Props;

const WithPipelinesQuery = (props: FinalProps) => {
  const { pipelineDetailQuery, queryParams, type } = props;

  if (!pipelineDetailQuery || !pipelineDetailQuery[type + 'PipelineDetail']) {
    return (
      <EmptyState
        image="/images/actions/18.svg"
        text="Oh boy, looks like you need to get a head start on your deals"
        size="small"
        light={true}
      />
    );
  }

  if (pipelineDetailQuery.loading) {
    return null;
  }

  const pipeline = pipelineDetailQuery[type + 'PipelineDetail'];

  return (
    <Pipeline
      pipeline={pipeline}
      key={pipeline._id}
      queryParams={queryParams}
      type={type}
    />
  );
};

export default (props: Props) =>
  withProps<Props>(
    props,
    compose(
      graphql<Props, PipelineDetailQueryResponse, { _id?: string }>(
        gql(queries[props.type + 'PipelineDetail']),
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
