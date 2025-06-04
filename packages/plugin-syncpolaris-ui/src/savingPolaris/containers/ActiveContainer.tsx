import React from 'react';
import { IContractDoc, savingHistoryQueryResponse } from '../types';
import { queries } from '../graphql';

import { gql } from '@apollo/client';
import { Spinner } from '@erxes/ui/src';

import { useQuery } from '@apollo/client';
import SavingActive from '../components/SavingActive';

type Props = {
  contract: IContractDoc;
  savingActive: (contractNumber: string) => void;
  depositActive: (contractNumber: string) => void;
};

const SavingActiveContainer = (props: Props) => {
  const { contract } = props;

  const savingHistoryQuery = useQuery<savingHistoryQueryResponse>(
    gql(queries.SyncSavingsData),
    {
      variables: {
        contentType: 'savings:contract',
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

  return <SavingActive {...updatedProps} />;
};

export default SavingActiveContainer;
