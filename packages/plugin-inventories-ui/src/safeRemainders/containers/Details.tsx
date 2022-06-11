import * as compose from 'lodash.flowright';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import gql from 'graphql-tag';
import ProductDetails from '../components/Details';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { graphql } from 'react-apollo';
import { ISafeRemainder, SafeRemainderDetailQueryResponse } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { queries } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  id: string;
};

type FinalProps = {
  safeRemainderQuery: SafeRemainderDetailQueryResponse;
  currentUser: IUser;
} & Props;

const ProductDetailsContainer = (props: FinalProps) => {
  const { safeRemainderQuery, currentUser } = props;

  if (safeRemainderQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!safeRemainderQuery.safeRemainderDetail) {
    return (
      <EmptyState text="Product not found" image="/images/actions/24.svg" />
    );
  }

  const safeRemainder =
    safeRemainderQuery.safeRemainderDetail || ({} as ISafeRemainder);

  const updatedProps = {
    ...props,
    loading: safeRemainderQuery.loading,
    safeRemainder,
    currentUser
  };

  return <ProductDetails {...updatedProps} />;
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
    )
  )(ProductDetailsContainer)
);
