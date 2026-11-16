import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useLoyaltyEnabled } from '@/deals/loyaltyRules/hooks/useLoyaltyEnabled';
import { SALES_LOYALTY_PAYMENT_WALLETS } from '../graphql/loyaltyPaymentQueries';

/** Customer wallets a purchase may pay from; none without loyalty. */
export const useLoyaltyPaymentWallets = () => {
  const enabled = useLoyaltyEnabled();
  const { data, loading, error } = useQuery(SALES_LOYALTY_PAYMENT_WALLETS, {
    skip: !enabled,
    fetchPolicy: 'cache-and-network',
  });

  return {
    enabled,
    wallets: data?.loyaltyAccountTypes?.filter(isDefined) || [],
    loading,
    error,
  };
};
