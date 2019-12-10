import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EmptyState from 'modules/common/components/EmptyState';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import { IOptions, PipelineDetailQueryResponse } from '../types';

type Props = {
  queryParams: any;
  options?: IOptions;
};

type ContainerProps = {
  pipelineDetailQuery: PipelineDetailQueryResponse;
} & Props;

const withPipeline = Component => {
  const Container = (props: ContainerProps) => {
    const { pipelineDetailQuery } = props;

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

    const updatedProps = {
      ...props,
      pipeline: pipelineDetailQuery.pipelineDetail
    };

    return <Component {...updatedProps} />;
  };

  return withProps<Props>(
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
    )(Container)
  );
};

export default withPipeline;
