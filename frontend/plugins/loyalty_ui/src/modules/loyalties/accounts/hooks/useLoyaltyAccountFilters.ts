import { useMultiQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { ACCOUNT_FILTER_KEYS } from '../constants/accountList';

type TAccountFilterQueries = Record<
  (typeof ACCOUNT_FILTER_KEYS)[keyof typeof ACCOUNT_FILTER_KEYS],
  string
>;

/** The accounts page filters, read from the URL, as query variables. */
export const useLoyaltyAccountFilters = () => {
  const [queries] = useMultiQueryState<TAccountFilterQueries>(
    Object.values(ACCOUNT_FILTER_KEYS),
  );
  const {
    searchValue,
    accountStatus,
    accountOwnerType,
    accountTypeId,
    accountTier,
  } = queries || {};

  return useMemo(
    () => ({
      searchValue: searchValue || undefined,
      status: accountStatus || undefined,
      ownerType: accountOwnerType || undefined,
      accountTypeId: accountTypeId || undefined,
      // A tier means nothing without its account type.
      tier: (accountTypeId && accountTier) || undefined,
    }),
    [searchValue, accountStatus, accountOwnerType, accountTypeId, accountTier],
  );
};
