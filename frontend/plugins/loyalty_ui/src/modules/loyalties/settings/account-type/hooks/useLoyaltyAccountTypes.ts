import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { compactList } from '@/loyalties/utils/cursorList';
import { LOYALTY_ACCOUNT_TYPE_LIST } from '../graphql/loyaltyAccountTypeQueries';
import { TLoyaltyOwnerType, TLoyaltyAccountTypeStatus } from '../types';

export const useLoyaltyAccountTypes = (
  variables: {
    status?: TLoyaltyAccountTypeStatus;
    ownerType?: TLoyaltyOwnerType;
  } = {},
  skip = false,
) => {
  const { data, loading, error } = useQuery(LOYALTY_ACCOUNT_TYPE_LIST, {
    variables,
    skip,
  });
  const accounts = useMemo(
    () => compactList(data?.loyaltyAccountTypes),
    [data?.loyaltyAccountTypes],
  );

  return { accounts, loading, error };
};
