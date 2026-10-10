import { useQuery } from '@apollo/client';
import { isEnabled } from 'erxes-ui';
import { SALES_LOYALTY_TIER_WALLETS } from '../graphql/loyaltyRulesQueries';
import { TLoyaltyTier } from '../tierBands';

type TTierWallet = { _id: string; name: string; tiers?: TLoyaltyTier[] | null };

/** Customer wallets a purchase can set a tier in; none without loyalty. */
export const useLoyaltyTierWallets = () => {
  const enabled = isEnabled('loyalty');
  const { data, loading, error } = useQuery<{
    loyaltyAccountTypes?: TTierWallet[];
  }>(SALES_LOYALTY_TIER_WALLETS, {
    skip: !enabled,
    fetchPolicy: 'cache-and-network',
  });
  const wallets = (data?.loyaltyAccountTypes || []).filter(({ tiers }) =>
    (tiers || []).some(({ deprecated }) => !deprecated),
  );

  return {
    enabled,
    wallets,
    loading,
    error,
    walletName: (accountTypeId?: string | null) =>
      wallets.find(({ _id }) => _id === accountTypeId)?.name || '',
    tiersOf: (accountTypeId?: string | null) =>
      wallets.find(({ _id }) => _id === accountTypeId)?.tiers || [],
  };
};
