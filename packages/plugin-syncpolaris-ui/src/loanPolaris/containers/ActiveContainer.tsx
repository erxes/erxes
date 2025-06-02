import React from 'react';
import { IContractDoc, savingHistoryQueryResponse } from '../types';
import { queries } from '../graphql';

import { gql } from '@apollo/client';
import { Spinner } from '@erxes/ui/src';

import { useQuery } from '@apollo/client';
import LoanActive from '../components/LoanActive';

type Props = {
  contract: IContractDoc;
  activeLoan: (contractNumber: string) => void;
};

const SavingActiveContainer = (props: Props) => {
  const { contract } = props;

  const savingHistoryQuery = useQuery<savingHistoryQueryResponse>(
    gql(queries.SyncSavingsData),
    {
      variables: {
        contentType: 'loans:contract',
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

  return <LoanActive {...updatedProps} />;
};

export default SavingActiveContainer;
