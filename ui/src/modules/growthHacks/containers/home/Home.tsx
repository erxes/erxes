import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries } from 'modules/boards/graphql';
import { BoardCountsQueryResponse } from 'modules/boards/types';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { queries as ghQueries } from 'modules/growthHacks/graphql';
import { StateCountsQueryResponse } from 'modules/growthHacks/types';
import React from 'react';
import { graphql } from 'react-apollo';
import Home from '../../components/home/Home';

type Props = {
  queryParams: any;
};

type FinalProps = {
  boardCountsQuery: BoardCountsQueryResponse;
  pipelineStateCountQuery: StateCountsQueryResponse;
} & Props;

class HomeContainer extends React.Component<FinalProps> {
  render() {
    const {
      boardCountsQuery,
      queryParams,
      pipelineStateCountQuery
    } = this.props;

    if (pipelineStateCountQuery.loading) {
      return <Spinner />;
    }

    const props = {
      queryParams,
      boardsWithCount: boardCountsQuery.boardCounts || [],
      counts: pipelineStateCountQuery.pipelineStateCount || {}
    };

    return <Home {...props} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, BoardCountsQueryResponse>(gql(queries.boardCounts), {
      name: 'boardCountsQuery',
      options: () => ({
        variables: { type: 'growthHack' },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props>(gql(ghQueries.pipelineStateCount), {
      name: 'pipelineStateCountQuery',
      options: ({ queryParams }) => ({
        variables: {
          boardId: queryParams && queryParams.id,
          type: 'growthHack'
        }
      })
    })
  )(HomeContainer)
);
