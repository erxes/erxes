import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { SALES_LOYALTY_TIER_WALLETS } from '../graphql/loyaltyRulesQueries';
import { useLoyaltyEnabled } from './useLoyaltyEnabled';

/** Customer wallets a purchase can set a tier in; none without loyalty. */
export const useLoyaltyTierWallets = () => {
  const enabled = useLoyaltyEnabled();
  const { data, loading, error } = useQuery(SALES_LOYALTY_TIER_WALLETS, {
    skip: !enabled,
    fetchPolicy: 'cache-and-network',
  });
  const wallets = (data?.loyaltyAccountTypes?.filter(isDefined) || []).filter(
    ({ tiers }) =>
      (tiers?.filter(isDefined) || []).some(({ deprecated }) => !deprecated),
  );

  return {
    enabled,
    wallets,
    loading,
    error,
    walletName: (accountTypeId?: string | null) =>
      wallets.find(({ _id }) => _id === accountTypeId)?.name || '',
    tiersOf: (accountTypeId?: string | null) =>
      wallets
        .find(({ _id }) => _id === accountTypeId)
        ?.tiers?.filter(isDefined) || [],
  };
};
