import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EmptyState from 'modules/common/components/EmptyState';
import { IRouterProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { queries } from '../graphql';
import { RootBack, ScrolledContent } from '../styles/common';
import { IOptions, PipelineDetailQueryResponse } from '../types';
import Pipeline from './Pipeline';

type Props = {
  pipelineDetailQuery: PipelineDetailQueryResponse;
} & WrapperProps &
  IRouterProps;

class Board extends React.Component<Props> {
  render() {
    const { pipelineDetailQuery, queryParams, options } = this.props;

    if (!pipelineDetailQuery || !pipelineDetailQuery.pipelineDetail) {
      return (
        <EmptyState
          image="/images/actions/18.svg"
          text="Oh boy, looks like you need to get a head start on your board"
          size="small"
          light={true}
        />
      );
    }

    const pipeline = pipelineDetailQuery.pipelineDetail;

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
  }
}

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
