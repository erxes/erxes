import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  AddBalanceMutationResponse,
  AddBalanceMutationVariables,
  UpdateVerifyMutationResponse,
  UpdateVerifyMutationVariables,
  BalanceQueryResponse,
  VerifyQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';

import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import CustomerSideBar from '../components/CustomerSideBar';

type Props = {
  id: string;
};

type FinalProps = {
  getBalanceQuery: BalanceQueryResponse;
  isVerifiedQuery: VerifyQueryResponse;
} & Props &
  AddBalanceMutationResponse &
  UpdateVerifyMutationResponse;

const CustomerSideBarContainer = (props: FinalProps) => {
  const {
    getBalanceQuery,
    isVerifiedQuery,
    addBalanceMutation,
    updateVerifyMutation
  } = props;

  if (getBalanceQuery.loading || isVerifiedQuery.loading) {
    return <Spinner />;
  }

  const getBalance = getBalanceQuery.getBalance || 0;
  const verified = isVerifiedQuery.isVerified || 'false';

  const addBalance = (erxesCustomerId: string, amount: number) => {
    confirm(`Are you sure?`)
      .then(() => {
        addBalanceMutation({ variables: { erxesCustomerId, amount } })
          .then(() => {
            getBalanceQuery.refetch();
            Alert.success('You successfully add a balance');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updateVerify = (erxesCustomerId: string, isVerified: string) => {
    confirm(`Are you sure?`)
      .then(() => {
        updateVerifyMutation({ variables: { erxesCustomerId, isVerified } })
          .then(() => {
            Alert.success('You successfully update a verify');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,

    getBalance,
    verified,
    addBalance,
    updateVerify
  };

  return <CustomerSideBar {...updatedProps} />;
};

const getRefetchQueries = () => ({
  refetchQueries: [
    'totalInvestment',
    'getBalance',
    'isVerified',
    'investments',
    'totalInvestmentCount'
  ]
});

export default withProps<Props>(
  compose(
    graphql<Props, BalanceQueryResponse, { erxesCustomerId: string }>(
      gql(queries.getBalance),
      {
        name: 'getBalanceQuery',
        options: ({ id }) => ({
          fetchPolicy: 'network-only',
          variables: { erxesCustomerId: id }
        })
      }
    ),
    graphql<Props, VerifyQueryResponse, { erxesCustomerId: string }>(
      gql(queries.isVerified),
      {
        name: 'isVerifiedQuery',
        options: ({ id }) => ({
          fetchPolicy: 'network-only',
          variables: { erxesCustomerId: id }
        })
      }
    ),
    graphql<{}, AddBalanceMutationResponse, AddBalanceMutationVariables>(
      gql(mutations.addBalance),
      {
        name: 'addBalanceMutation',
        options: getRefetchQueries
      }
    ),
    graphql<{}, UpdateVerifyMutationResponse, UpdateVerifyMutationVariables>(
      gql(mutations.updateVerify),
      {
        name: 'updateVerifyMutation',
        options: getRefetchQueries
      }
    )
  )(CustomerSideBarContainer)
);
