import gql from 'graphql-tag';
import { IQueryParams } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../graphql';
import { PipelineDetailQueryResponse } from '../types';

type Props = {
  queryParams: IQueryParams;
  pipelineDetailQuery: PipelineDetailQueryResponse;
};

const withPipelineDetail = Component => {
  const Container = (props: Props) => {
    const { pipelineDetailQuery } = props;

    if (pipelineDetailQuery.loading) {
      return null;
    }

    const updatedProps = {
      ...props,
      pipeline: pipelineDetailQuery.dealPipelineDetail || {}
    };

    return <Component {...updatedProps} />;
  };

  return withProps<{}>(
    compose(
      graphql<Props, PipelineDetailQueryResponse>(gql(queries.pipelineDetail), {
        name: 'pipelineDetailQuery',
        skip: ({ queryParams }) => !queryParams.pipelineId,
        options: ({ queryParams }) => ({
          variables: { _id: queryParams && queryParams.pipelineId }
        })
      })
    )(Container)
  );
};

export default withPipelineDetail;
