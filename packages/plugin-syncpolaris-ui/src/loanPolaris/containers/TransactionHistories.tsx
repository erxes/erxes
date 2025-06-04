import React from 'react';
import { IContractDoc, savingHistoryQueryResponse } from '../types';
import { queries } from '../graphql';

import { gql, useQuery } from '@apollo/client';
import { Spinner } from '@erxes/ui/src';

import Transaction from '../components/Transaction/TransactionHistories';

type Props = {
  contract: IContractDoc;
};

const TransactionContainer = (props: Props) => {
  const { contract } = props;

  const savingHistoryQuery = useQuery<savingHistoryQueryResponse>(
    gql(queries.SyncSavingsData),
    {
      variables: {
        contentType: 'loans:transaction',
        contentId: contract.number
      }
    }
  );

  if (savingHistoryQuery.loading) {
    return <Spinner objective={true} />;
  }

  const savingHistories =
    savingHistoryQuery?.data?.syncSavingsData || ([] as any);

  const updatedProps = {
    ...props,
    savingHistories
  };

  return <Transaction {...updatedProps} />;
};

export default TransactionContainer;
