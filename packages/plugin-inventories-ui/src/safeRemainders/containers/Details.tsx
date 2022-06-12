import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import ProductDetails from '../components/Details';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { graphql } from 'react-apollo';
import {
  ISafeRemainder,
  SafeRemainderDetailQueryResponse,
  SafeRemItemsQueryResponse
} from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { queries } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';
import { SafeRemItemsCountQueryResponse } from '../types';

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
} & Props;

const SafeRemainderDetailsContainer = (props: FinalProps) => {
  const {
    safeRemainderQuery,
    safeRemItemsQuery,
    currentUser,
    safeRemItemsCountQuery
  } = props;

  if (safeRemainderQuery.loading || safeRemItemsCountQuery.loading) {
    return <Spinner />;
  }

  const safeRemainder =
    safeRemainderQuery.safeRemainderDetail || ({} as ISafeRemainder);

  const totalCount = safeRemItemsCountQuery.safeRemItemsCount || 0;

  const updatedProps = {
    ...props,
    loading: safeRemItemsQuery.loading,
    safeRemItemsQuery,
    totalCount,
    safeRemainder,
    currentUser
  };

  return <ProductDetails {...updatedProps} />;
};

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
    )
  )(SafeRemainderDetailsContainer)
);
