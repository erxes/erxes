import * as compose from 'lodash.flowright';
import Alert from '@erxes/ui/src/utils/Alert';
import gql from 'graphql-tag';
import ProductDetails from '../components/Details';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { graphql } from 'react-apollo';
import {
  ISafeRemainder,
  ISafeRemItem,
  RemoveSafeRemItemMutationResponse,
  SafeRemainderDetailQueryResponse,
  SafeRemItemsQueryResponse,
  UpdateSafeRemItemMutationResponse
} from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { mutations, queries } from '../graphql';
import { SafeRemItemsCountQueryResponse } from '../types';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  queryParams: any;
  history: any;
  id: string;
};

type FinalProps = {
  safeRemainderQuery: SafeRemainderDetailQueryResponse;
  safeRemItemsQuery: SafeRemItemsQueryResponse;
  safeRemItemsCountQuery: SafeRemItemsCountQueryResponse;
  currentUser: IUser;
} & Props &
  UpdateSafeRemItemMutationResponse &
  RemoveSafeRemItemMutationResponse;

class SafeRemainderDetailsContainer extends React.Component<FinalProps> {
  render() {
    const {
      safeRemainderQuery,
      safeRemItemsQuery,
      currentUser,
      safeRemItemsCountQuery,
      updateSafeRemItem,
      removeSafeRemItem
    } = this.props;

    if (safeRemainderQuery.loading || safeRemItemsCountQuery.loading) {
      return <Spinner />;
    }

    const updateRemItem = (_id: string, remainder: number, status?: string) => {
      updateSafeRemItem({ variables: { _id, remainder, status } })
        .then(() => {
          Alert.success('You successfully updated a census');
          safeRemItemsQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const removeRemItem = (item: ISafeRemItem) => {
      removeSafeRemItem({ variables: { _id: item._id } })
        .then(() => {
          Alert.success('You successfully deleted a census');
          safeRemItemsQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const safeRemainder =
      safeRemainderQuery.safeRemainderDetail || ({} as ISafeRemainder);

    const totalCount = safeRemItemsCountQuery.safeRemItemsCount || 0;

    const updatedProps = {
      ...this.props,
      loading: safeRemItemsQuery.loading,
      safeRemItemsQuery,
      updateRemItem,
      removeRemItem,
      totalCount,
      safeRemainder,
      currentUser
    };

    return <ProductDetails {...updatedProps} />;
  }
}

const getStatuses = queryParams => {
  const result: string[] = [];

  if (queryParams.isTemp) {
    result.push('temp');
  }

  return result;
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
    graphql<Props, SafeRemItemsQueryResponse, {}>(gql(queries.safeRemItems), {
      name: 'safeRemItemsQuery',
      options: ({ id, queryParams }) => ({
        variables: {
          remainderId: id,
          statuses: getStatuses(queryParams)
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, SafeRemItemsCountQueryResponse, {}>(
      gql(queries.safeRemItemsCount),
      {
        name: 'safeRemItemsCountQuery',
        options: ({ id, queryParams }) => ({
          variables: {
            remainderId: id,
            statuses: getStatuses(queryParams)
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, UpdateSafeRemItemMutationResponse, { _id: string }>(
      gql(mutations.updateSafeRemItem),
      {
        name: 'updateSafeRemItem',
        options: () => ({
          refetchQueries: ['safeRemItemsQuery']
        })
      }
    ),
    graphql<Props, RemoveSafeRemItemMutationResponse, { _id: string }>(
      gql(mutations.removeSafeRemItem),
      {
        name: 'removeSafeRemItem',
        options: () => ({
          refetchQueries: ['safeRemItemsQuery']
        })
      }
    )
  )(SafeRemainderDetailsContainer)
);
