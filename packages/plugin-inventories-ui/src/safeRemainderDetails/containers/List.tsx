import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import queryString from 'query-string';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
// erxes
import Alert from '@erxes/ui/src/utils/Alert';
// local
import { queries, mutations } from '../graphql';
import ListComponent from '../components/List';

function ListContainer() {
  // Hooks
  const location = useLocation();
  const { id } = useParams();

  const queryParams = queryString.parse(location.search);

  /**
   * Queries
   */
  const safeRemainderDetailQuery = useQuery(gql(queries.safeRemainderDetail), {
    notifyOnNetworkStatusChange: true,
    variables: { _id: id }
  });
  const safeRemainderItemsQuery = useQuery(gql(queries.safeRemainderItems), {
    fetchPolicy: 'network-only',
    variables: {
      remainderId: id,
      status: queryParams.status,
      diffType: queryParams.diffType,
      productCategoryId: queryParams.productCategoryId
    }
  });
  const safeRemainderItemsCountQuery = useQuery(
    gql(queries.safeRemainderItemsCount),
    {
      fetchPolicy: 'network-only',
      variables: {
        remainderId: id,
        status: queryParams.status,
        diffType: queryParams.diffType,
        productCategoryId: queryParams.productCategoryId
      }
    }
  );

  /**
   * Mutations
   */
  const [safeRemainderSubmit] = useMutation(
    gql(mutations.safeRemainderSubmit),
    {
      refetchQueries: ['safeRemainderItemsQuery']
    }
  );
  const [safeRemainderItemEdit] = useMutation(
    gql(mutations.safeRemainderItemEdit),
    {
      refetchQueries: ['safeRemainderItemsQuery']
    }
  );
  const [safeRemainderItemRemove] = useMutation(
    gql(mutations.safeRemainderItemRemove),
    {
      refetchQueries: ['safeRemainderItemsQuery']
    }
  );

  /**
   * Methods
   */
  const updateItem = (_id: string, remainder: number, status?: string) => {
    safeRemainderItemEdit({ variables: { _id, remainder, status } })
      .then(() => {
        Alert.success('You successfully updated a census');
        safeRemainderItemsQuery.refetch();
      })
      .catch((error: any) => Alert.error(error.message));
  };

  const removeItem = (item: any) => {
    safeRemainderItemRemove({ variables: { _id: item._id } })
      .then(() => {
        Alert.success('You successfully updated a census');
        safeRemainderItemsQuery.refetch();
      })
      .catch((error: any) => Alert.error(error.message));
  };

  const submitItems = (data: any) => {
    let products: any = [];

    for (let item of data) {
      if (item.count - item.preCount !== 0)
        products.push({
          productId: item.productId,
          count: item.count,
          preCount: item.preCount,
          uomId: item.uomId,
          isDebit: true
        });
    }

    if (products.length === 0) {
      Alert.error('No recent changes to submit!');
      return;
    }

    safeRemainderSubmit({
      variables: {
        branchId: safeRemainder.branchId,
        departmentId: safeRemainder.departmentId,
        contentType: 'safe remainder',
        contentId: 'safe_remainder_id',
        status: 'checked',
        products: products
      }
    })
      .then(() => {
        Alert.success('Success!');
        safeRemainderItemsQuery.refetch();
      })
      .catch((error: any) => {
        Alert.error(error.message);
      });
  };

  /**
   * Definitions
   */
  const safeRemainder =
    (safeRemainderDetailQuery.data &&
      safeRemainderDetailQuery.data.safeRemainderDetail) ||
    {};

  const safeRemainderItems =
    (safeRemainderItemsQuery.data &&
      safeRemainderItemsQuery.data.safeRemainderItems) ||
    [];

  const totalCount =
    (safeRemainderItemsCountQuery.data &&
      safeRemainderItemsCountQuery.data.safeRemainderItemsCount) ||
    0;

  const componentProps = {
    loading: safeRemainderItemsQuery.loading,
    safeRemainder,
    safeRemainderItems,
    totalCount,
    submitItems,
    updateItem,
    removeItem
  };

  return <ListComponent {...componentProps} />;
}

export default compose()(ListContainer);
