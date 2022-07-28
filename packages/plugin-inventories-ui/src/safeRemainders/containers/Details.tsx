import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils';
import { IUser } from '@erxes/ui/src/auth/types';
import {
  ISafeRemainder,
  ISafeRemainderItem,
  RemoveSafeRemainderItemMutationResponse,
  SafeRemainderDetailQueryResponse,
  SafeRemainderItemsQueryResponse,
  UpdateSafeRemainderItemMutationResponse,
  SafeRemainderItemsCountQueryResponse
} from '../types';
import DetailsComponent from '../components/Details';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
  history: any;
  id: string;
};

type FinalProps = {
  safeRemainderQuery: SafeRemainderDetailQueryResponse;
  safeRemainderItemsQuery: SafeRemainderItemsQueryResponse;
  safeRemainderItemsCountQuery: SafeRemainderItemsCountQueryResponse;
  transactionAdd: any;
  currentUser: IUser;
} & Props &
  UpdateSafeRemainderItemMutationResponse &
  RemoveSafeRemainderItemMutationResponse;

class SafeRemainderDetailsContainer extends React.Component<FinalProps> {
  render() {
    const {
      safeRemainderQuery,
      safeRemainderItemsQuery,
      currentUser,
      safeRemainderItemsCountQuery,
      transactionAdd,
      updateSafeRemainderItem,
      removeSafeRemainderItem
    } = this.props;

    if (safeRemainderQuery.loading || safeRemainderItemsCountQuery.loading) {
      return <Spinner />;
    }

    const updateRemainderItem = (
      _id: string,
      remainder: number,
      status?: string
    ) => {
      updateSafeRemainderItem({ variables: { _id, remainder, status } })
        .then(() => {
          Alert.success('You successfully updated a census');
          safeRemainderItemsQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const removeRemainderItem = (item: ISafeRemainderItem) => {
      removeSafeRemainderItem({ variables: { _id: item._id } })
        .then(() => {
          Alert.success('You successfully deleted a census');
          safeRemainderItemsQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const createTransaction = (data: ISafeRemainderItem[]) => {
      let products: any = [];

      data.map((item: any) => {
        products.push({
          branchId: item.branchId,
          departmentId: item.departmentId,
          remainderId: item.remainderId,
          productId: item.productId,
          count: item.count,
          isDebit: true
        });
      });

      transactionAdd({
        variables: {
          contentType: 'safe remainder',
          contentId: 'safe_remainder_id',
          status: 'pog',
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

    const safeRemainder =
      safeRemainderQuery.safeRemainderDetail || ({} as ISafeRemainder);

    const totalCount =
      safeRemainderItemsCountQuery.safeRemainderItemsCount || 0;

    const updatedProps = {
      ...this.props,
      loading: safeRemainderItemsQuery.loading,
      safeRemainderItemsQuery,
      totalCount,
      safeRemainder,
      currentUser,
      createTransaction,
      updateRemainderItem,
      removeRemainderItem
    };

    return <DetailsComponent {...updatedProps} />;
  }
}

const getVariables = (id, queryParams) => {
  return {
    remainderId: id,
    status: queryParams.status,
    diffType: queryParams.diffType,
    productCategoryId: queryParams.productCategoryId
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, SafeRemainderDetailQueryResponse, { _id: string }>(
      gql(queries.safeRemainderDetail),
      {
        name: 'safeRemainderQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          }
        })
      }
    ),
    graphql<Props, SafeRemainderItemsQueryResponse, {}>(
      gql(queries.safeRemainderItems),
      {
        name: 'safeRemainderItemsQuery',
        options: ({ id, queryParams }) => ({
          variables: getVariables(id, queryParams),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, SafeRemainderItemsCountQueryResponse, {}>(
      gql(queries.safeRemainderItemsCount),
      {
        name: 'safeRemainderItemsCountQuery',
        options: ({ id, queryParams }) => ({
          variables: getVariables(id, queryParams),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, {}, { data: ISafeRemainderItem[] }>(
      gql(mutations.transactionAdd),
      {
        name: 'transactionAdd',
        options: () => ({
          refetchQueries: ['transactionAdd']
        })
      }
    ),
    graphql<Props, UpdateSafeRemainderItemMutationResponse, { _id: string }>(
      gql(mutations.updateSafeRemainderItem),
      {
        name: 'updateSafeRemainderItem',
        options: () => ({
          refetchQueries: ['safeRemainderItemsQuery']
        })
      }
    ),
    graphql<Props, RemoveSafeRemainderItemMutationResponse, { _id: string }>(
      gql(mutations.removeSafeRemainderItem),
      {
        name: 'removeSafeRemainderItem',
        options: () => ({
          refetchQueries: ['safeRemainderItemsQuery']
        })
      }
    )
  )(SafeRemainderDetailsContainer)
);
