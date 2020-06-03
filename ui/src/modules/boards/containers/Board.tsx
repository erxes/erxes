import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EmptyState from 'modules/common/components/EmptyState';
import { IRouterProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React, { useEffect } from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { queries, subscriptions } from '../graphql';
import { RootBack, ScrolledContent } from '../styles/common';
import { IOptions, PipelineDetailQueryResponse } from '../types';
import Pipeline from './Pipeline';

type Props = {
  pipelineDetailQuery: PipelineDetailQueryResponse;
} & WrapperProps &
  IRouterProps;

const Board = (props: Props) => {
  const { pipelineDetailQuery, queryParams, options } = props;

  useEffect(() => {
    const pipelineId = queryParams.pipelineId;

    return (
      pipelineDetailQuery &&
      pipelineDetailQuery.subscribeToMore({
        document: gql(subscriptions.pipelinesChanged),
        variables: { _id: pipelineId },
        updateQuery: () => {
          console.log('received'); // tslint:disable-line
        }
      })
    );
  });

  const pipeline = pipelineDetailQuery && pipelineDetailQuery.pipelineDetail;

  if (!pipeline) {
    return (
      <EmptyState
        image="/images/actions/18.svg"
        text="Oh boy, looks like you need to get a head start on your board"
        size="small"
        light={true}
      />
    );
  }

  return (
    <RootBack style={{ backgroundColor: pipeline.bgColor }}>
      <ScrolledContent>
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

type WrapperProps = {
  queryParams: any;
  options: IOptions;
};

export default withProps<WrapperProps>(
  compose(
    graphql<WrapperProps, PipelineDetailQueryResponse, { _id?: string }>(
      gql(queries.pipelineDetail),
      {
        name: 'pipelineDetailQuery',
        skip: ({ queryParams }) => !queryParams.pipelineId,
        options: ({ queryParams }) => ({
          variables: { _id: queryParams && queryParams.pipelineId }
        })
      }
    )
  )(withRouter(Board))
);
