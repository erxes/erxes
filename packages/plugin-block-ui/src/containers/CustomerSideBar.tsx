import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  AddBalanceMutationResponse,
  UpdateVerifyMutationResponse,
  BalanceQueryResponse,
  VerifyQueryResponse,
} from '../types';
import { mutations, queries } from '../graphql';

import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import CustomerSideBar from '../components/CustomerSideBar';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  id: string;
};

const CustomerSideBarContainer = (props: Props) => {
  const { id } = props;

  const getBalanceQuery = useQuery<BalanceQueryResponse>(
    gql(queries.getBalance),
    {
      fetchPolicy: 'network-only',
      variables: { erxesCustomerId: id },
    },
  );
  const isVerifiedQuery = useQuery<VerifyQueryResponse>(
    gql(queries.isVerified),
    {
      fetchPolicy: 'network-only',
      variables: { erxesCustomerId: id },
    },
  );
  const [addBalanceMutation] = useMutation<AddBalanceMutationResponse>(
    gql(mutations.addBalance),
    {
      refetchQueries: [
        'totalInvestment',
        'getBalance',
        'isVerified',
        'investments',
        'totalInvestmentCount',
      ],
    },
  );
  const [updateVerifyMutation] = useMutation<UpdateVerifyMutationResponse>(
    gql(mutations.updateVerify),
    {
      refetchQueries: [
        'totalInvestment',
        'getBalance',
        'isVerified',
        'investments',
        'totalInvestmentCount',
      ],
    },
  );

  if (getBalanceQuery.loading || isVerifiedQuery.loading) {
    return <Spinner />;
  }

  const getBalance =
    (getBalanceQuery.data && getBalanceQuery.data.getBalance) || 0;
  const verified =
    (isVerifiedQuery.data && isVerifiedQuery.data.isVerified) || 'false';

  const addBalance = (erxesCustomerId: string, amount: number) => {
    confirm(`Are you sure?`)
      .then(() => {
        addBalanceMutation({ variables: { erxesCustomerId, amount } })
          .then(() => {
            getBalanceQuery.refetch();
            Alert.success('You successfully add a balance');
          })
          .catch((e) => {
            Alert.error(e.message);
          });
      })
      .catch((e) => {
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
          .catch((e) => {
            Alert.error(e.message);
          });
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,

    getBalance,
    verified,
    addBalance,
    updateVerify,
  };

  return <CustomerSideBar {...updatedProps} />;
};

export default CustomerSideBarContainer;
