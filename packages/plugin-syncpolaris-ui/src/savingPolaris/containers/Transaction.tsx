import React from 'react';
import {
  IContractDoc,
  savingHistoryQueryResponse,
  SavingTransactionMutationResponse
} from '../types';
import { mutations, queries } from '../graphql';

import { gql, useApolloClient } from '@apollo/client';
import { Alert, Spinner } from '@erxes/ui/src';

import { useQuery, useMutation } from '@apollo/client';
import Transaction from '../components/Transaction/Transaction';

type Props = {
  contract: IContractDoc;
};

const TransactionContainer = (props: Props) => {
  const client = useApolloClient();
  const { contract } = props;

  const savingHistoryQuery = useQuery<savingHistoryQueryResponse>(
    gql(queries.SyncSavingsData),
    {
      variables: {
        contentType: 'savings:transaction',
        contentId: contract.number
      }
    }
  );

  const [savingTransaction] = useMutation<SavingTransactionMutationResponse>(
    gql(mutations.syncSavingTransactions),
    {
      refetchQueries: ['savingsContractDetail', 'syncSavingsData']
    }
  );

  const sentTransactionHandler = (data: any) => {
    savingTransaction({ variables: { data } })
      .then(() => {
        Alert.success('Successfully synced');
      })
      .catch((error) => {
        Alert.error(error.message);

        client.refetchQueries({
          include: ['syncSavingsData']
        });
      });
  };

  if (savingHistoryQuery.loading) {
    return <Spinner objective={true} />;
  }

  const savingHistories =
    savingHistoryQuery?.data?.syncSavingsData || ([] as any);

  const updatedProps = {
    ...props,
    sentTransaction: sentTransactionHandler,
    savingHistories
  };

  return <Transaction {...updatedProps} />;
};

export default TransactionContainer;
