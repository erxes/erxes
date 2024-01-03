import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils/core';
import MovementItem from '../components/List';
import { queries } from '../graphql';
import {
  MovementItemsQueryResponse,
  MovementItemsTotalCountQueryResponse
} from '../../../common/types';
import { Spinner } from '@erxes/ui/src';
import { generateParams } from '../../../common/utils';

type Props = { queryParams: any; history: any };

type FinalProps = {
  itemsQuery: MovementItemsQueryResponse;
  itemsTotalCount: MovementItemsTotalCountQueryResponse;
} & Props;
class MovementItemsContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { itemsQuery, itemsTotalCount, history, queryParams } = this.props;

    if (itemsQuery.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      items: itemsQuery.assetMovementItems || [],
      totalCount: itemsTotalCount.assetMovementItemsTotalCount,
      history,
      queryParams
    };

    return <MovementItem {...updatedProps} />;
  }
}

export default withProps(
  compose(
    graphql<Props>(gql(queries.items), {
      name: 'itemsQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    }),
    graphql<Props>(gql(queries.itemsTotalCount), {
      name: 'itemsTotalCount',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    })
  )(MovementItemsContainer)
);
