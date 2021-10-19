import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EmptyContent from 'modules/common/components/empty/EmptyContent';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { EMPTY_CONTENT_DEAL, EMPTY_CONTENT_TASK } from '../constants';
import { queries } from '../graphql';
import { RootBack, ScrolledContent } from '../styles/common';
import { IOptions, PipelineDetailQueryResponse } from '../types';
import Pipeline from './Pipeline';
import PipelineActivity from './PipelineActivity';
import ListPipeline from './ListPipeline';

type Props = {
  pipelineDetailQuery: PipelineDetailQueryResponse;
} & WrapperProps &
  IRouterProps;

class Board extends React.Component<Props> {
  render() {
    const { pipelineDetailQuery, queryParams, options, viewType } = this.props;

    if (pipelineDetailQuery && pipelineDetailQuery.loading) {
      return <Spinner />;
    }

    if (!pipelineDetailQuery || !pipelineDetailQuery.pipelineDetail) {
      const type = options.type;

      if (type === 'deal' || type === 'task') {
        return (
          <EmptyContent
            content={type === 'deal' ? EMPTY_CONTENT_DEAL : EMPTY_CONTENT_TASK}
            maxItemWidth="400px"
          />
        );
      }

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

    if (viewType === 'activity') {
      return (
        <PipelineActivity
          key={pipeline._id}
          options={options}
          pipeline={pipeline}
          queryParams={queryParams}
        />
      );
    }

    if (viewType === 'list') {
      return (
        <ListPipeline
          key={pipeline._id}
          options={options}
          pipeline={pipeline}
          queryParams={queryParams}
        />
      );
    }

    return (
      <RootBack style={{ backgroundColor: pipeline.bgColor }}>
        <ScrolledContent>
          <Pipeline
            key={pipeline._id}
            options={options}
            pipeline={pipeline}
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
  viewType?: string;
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
