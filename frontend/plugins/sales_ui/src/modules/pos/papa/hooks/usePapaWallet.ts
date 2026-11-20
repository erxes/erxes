import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { SALES_PAPA_WALLET } from '../graphql/papaDocuments';
import { parsePapaWallet } from '../utils/papaJson';

/** The Papa business wallet balance; Papa reads it fresh on every request. */
export const usePapaWallet = (skip = false) => {
  const { data, loading, error, refetch } = useQuery(SALES_PAPA_WALLET, {
    skip,
    fetchPolicy: 'cache-and-network',
  });

  const wallet = useMemo(
    () => parsePapaWallet(data?.salesPapaWallet),
    [data?.salesPapaWallet],
  );

  return { wallet, loading, error, refetch };
};
