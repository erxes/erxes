import React from 'react';
import { gql } from '@apollo/client';
import { withProps } from '@erxes/ui/src/utils';
import { queries } from '../../graphql';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import List from '../../components/item/ItemList';
import { ItemsCountQueryResponse, ItemsQueryResponse } from '../../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  itemsQuery: ItemsQueryResponse;
  itemsCountQuery: ItemsCountQueryResponse;
} & Props;

class ItemListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { itemsQuery, queryParams, itemsCountQuery } = this.props;

    const items = itemsQuery.items || [];

    const updatedProps = {
      ...this.props,
      queryParams,
      items,
      loading: itemsQuery.loading || itemsCountQuery.loading,
      itemsCount: itemsCountQuery.itemsTotalCount || 0,
    };

    return <List {...updatedProps} {...this.props} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ItemsQueryResponse, { page: number; perPage: number }>(
      gql(queries.items),
      {
        name: 'itemsQuery',
      },
    ),
    graphql<Props, ItemsCountQueryResponse>(gql(queries.itemsCount), {
      name: 'itemsCountQuery',
    }),
  )(ItemListContainer),
);
