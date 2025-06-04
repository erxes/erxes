import React from 'react';
import {
  IContractDoc,
  savingHistoryQueryResponse,
  LoanTransactionMutationResponse
} from '../types';
import { mutations, queries } from '../graphql';

import { gql, useApolloClient, useQuery, useMutation } from '@apollo/client';
import { Alert, Spinner } from '@erxes/ui/src';

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

  const [loanTransaction] = useMutation<LoanTransactionMutationResponse>(
    gql(mutations.loanGiveTransaction),
    {
      refetchQueries: ['contractDetail', 'syncSavingsData']
    }
  );

  const sentTransactionHandler = (data: any) => {
    loanTransaction({ variables: { data } })
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
