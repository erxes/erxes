import React from 'react';
import { gql } from '@apollo/client';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { mutations, queries } from '../../graphql';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import List from '../../components/item/ItemList';
import {
  IItemC,
  ItemRemoveMutationResponse,
  ItemsCountQueryResponse,
  ItemDetailQueryResponse,
  ItemsQueryResponse,
} from '../../types';
import Bulk from '@erxes/ui/src/components/Bulk';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  itemsQuery: ItemsQueryResponse;
  itemsCountQuery: ItemsCountQueryResponse;
  itemsDetailQuery: ItemDetailQueryResponse;
} & Props &
  ItemRemoveMutationResponse;

function ItemListContainer(props: FinalProps) {
  const {
    itemsQuery,
    queryParams,
    itemsCountQuery,
    itemsRemove,
    itemsDetailQuery,
  } = props;

  const items = itemsQuery.items || [];

  // remove action
  const remove = ({ itemIds }, emptyBulk) => {
    console.log(itemIds);

    itemsRemove({
      variables: { itemIds },
    })
      .then((removeStatus) => {
        emptyBulk();

        const status = removeStatus.data.itemsRemove;

        status === 'deleted'
          ? Alert.success('You successfully deleted an item')
          : Alert.warning('Item status deleted');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const searchValue = props.queryParams.searchValue || '';

  const updatedProps = {
    ...props,
    queryParams,
    items,
    remove,
    searchValue,
    loading: itemsQuery.loading || itemsCountQuery.loading,
    itemsTotalCount: itemsCountQuery.itemsTotalCount || 0,
  };

  const itemList = (props) => {
    return <List {...updatedProps} {...props} />;
  };

  const refetch = () => {
    props.itemsQuery.refetch();
  };

  return <Bulk content={itemList} refetch={refetch} />;
}

const getRefetchQueries = () => {
  return ['items', 'itemsTotalCount'];
};

const options = () => ({
  refetchQueries: getRefetchQueries(),
});

export default withProps<Props>(
  compose(
    graphql<Props, ItemsQueryResponse, { page: number; perPage: number }>(
      gql(queries.items),
      {
        name: 'itemsQuery',
        options: ({ queryParams }) => ({
          variables: {
            searchValue: queryParams.searchValue,
            ids: queryParams.ids && queryParams.ids.split(','),
            ...generatePaginationParams(queryParams),
          },
          fetchPolicy: 'network-only',
        }),
      },
    ),
    graphql<Props, ItemsCountQueryResponse>(gql(queries.itemsTotalCount), {
      name: 'itemsCountQuery',
      options: ({ queryParams }) => ({
        variables: {
          searchValue: queryParams.searchValue,
          ids: queryParams.ids && queryParams.ids.split(','),
        },
        fetchPolicy: 'network-only',
      }),
    }),
    graphql<Props, ItemRemoveMutationResponse, { itemIds: string[] }>(
      gql(mutations.itemsRemove),
      {
        name: 'itemsRemove',
        options,
      },
    ),
    graphql<Props, ItemDetailQueryResponse>(gql(queries.itemsDetail), {
      name: 'itemsDetailQuery',
      options: ({ queryParams }) => ({
        variables: {
          _id: queryParams._id,
        },
      }),
    }),
  )(ItemListContainer),
);
