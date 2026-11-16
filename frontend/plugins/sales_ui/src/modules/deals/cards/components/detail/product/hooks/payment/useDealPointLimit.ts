import { useQuery } from '@apollo/client';
import { useLoyaltyEnabled } from '@/deals/loyaltyRules/hooks/useLoyaltyEnabled';
import { SALES_DEAL_POINT_LIMIT } from '../../graphql/queries/DealPointLimitQueries';

/** What this deal may pay from the payment type's loyalty wallet. */
export const useDealPointLimit = ({
  accountTypeId,
  customerId,
  dealId,
  totalAmount,
}: {
  accountTypeId?: string;
  customerId?: string;
  dealId: string;
  totalAmount: number;
}) => {
  // Loyalty is a remote plugin: without it there is no limit to ask for.
  const enabled = useLoyaltyEnabled();
  const { data, loading, error } = useQuery(SALES_DEAL_POINT_LIMIT, {
    variables:
      accountTypeId && customerId
        ? {
            accountTypeId,
            ownerType: 'customer',
            ownerId: customerId,
            totalAmount,
            targetId: dealId,
          }
        : undefined,
    skip: !enabled || !accountTypeId || !customerId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    enabled,
    limit: data?.loyaltyScoreSpendLimit ?? undefined,
    loading,
    error,
  };
};
