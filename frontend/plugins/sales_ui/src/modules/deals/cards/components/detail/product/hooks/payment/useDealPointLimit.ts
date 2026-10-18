import { useQuery } from '@apollo/client';
import { SALES_DEAL_POINT_LIMIT } from '../../graphql/queries/DealPointLimitQueries';

/** What this deal may pay with points under the payment type's campaign. */
export const useDealPointLimit = ({
  campaignId,
  customerId,
  dealId,
  totalAmount,
}: {
  campaignId?: string;
  customerId?: string;
  dealId: string;
  totalAmount: number;
}) => {
  const { data, loading, error } = useQuery(SALES_DEAL_POINT_LIMIT, {
    variables:
      campaignId && customerId
        ? {
            campaignId,
            ownerType: 'customer',
            ownerId: customerId,
            totalAmount,
            targetId: dealId,
          }
        : undefined,
    skip: !campaignId || !customerId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    limit: data?.loyaltyScoreSpendLimit ?? undefined,
    loading,
    error,
  };
};
