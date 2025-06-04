import React from 'react';
import { IContractDoc, savingHistoryQueryResponse } from '../types';
import { queries } from '../graphql';

import { gql } from '@apollo/client';
import { Spinner } from '@erxes/ui/src';

import { useQuery } from '@apollo/client';
import CollateralSection from '../components/CollateralSection';

type Props = {
  contract: IContractDoc;
  reSendCollateral: (data: any) => void;
};

const CollateralContainer = (props: Props) => {
  const { contract } = props;

  const savingHistoryQuery = useQuery<savingHistoryQueryResponse>(
    gql(queries.SyncSavingsData),
    {
      variables: {
        contentType: 'loans:contract',
        contentId: contract?.collateralsData?.[0]?.collateralId || ''
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

  return <CollateralSection {...updatedProps} />;
};

export default CollateralContainer;
