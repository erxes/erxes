import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import { ItemDetailQueryResponse, IItem } from './../../types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import ItemDetails from './../../components/item/ItemDetails';
import { queries } from './../../graphql';

type Props = {
  id: string;
};

type FinalProps = {
  itemDetailQuery: ItemDetailQueryResponse;
} & Props;

const ItemDetailsContainer = (props: FinalProps) => {
  const { itemDetailQuery } = props;

  if (itemDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!itemDetailQuery.itemsDetail) {
    return <EmptyState text="Item not found" image="/images/actions/24.svg" />;
  }

  const itemDetail = itemDetailQuery.itemsDetail || ({} as IItem);

  const updatedProps = {
    ...props,
    loading: itemDetailQuery.loading,
    item: itemDetail,
  };

  return <ItemDetails {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ItemDetailQueryResponse, { _id: string }>(
      gql(queries.itemsDetail),
      {
        name: 'itemDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id,
          },
          notifyOnNetworkStatusChange: true,
          fetchPolicy: 'network-only',
        }),
      },
    ),
  )(ItemDetailsContainer),
);
