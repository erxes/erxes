import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries } from 'modules/boards/graphql';
import { BoardCountsQueryResponse } from 'modules/boards/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Home from '../../components/home/Home';

type Props = {
  queryParams: any;
};

type FinalProps = {
  boardCountsQuery: BoardCountsQueryResponse;
} & Props;

class HomeContainer extends React.Component<FinalProps> {
  render() {
    const { boardCountsQuery, queryParams } = this.props;

    const props = {
      queryParams,
      boardsWithCount: boardCountsQuery.boardCounts || []
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
    })
  )(HomeContainer)
);
