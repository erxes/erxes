import { useQuery } from '@apollo/client';
import { usePermissionCheck } from 'ui-modules';
import type { SalesContactDealsQuery } from '~/gql/graphql';
import { SALES_CONTACT_DEALS } from './contactDeals';

const CONTACT_RECORDS_LIMIT = 50;

export type TContactDeal = NonNullable<
  NonNullable<NonNullable<SalesContactDealsQuery['deals']>['list']>[number]
>;

export const useContactDeals = ({
  customerId,
  companyId,
  excludeId,
}: {
  customerId?: string;
  companyId?: string;
  excludeId?: string;
}) => {
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canView = isLoaded && hasActionPermission('showDeals');
  const customerDeals = useQuery(SALES_CONTACT_DEALS, {
    variables: { customerId, limit: CONTACT_RECORDS_LIMIT },
    skip: !customerId || !canView,
  });
  const companyDeals = useQuery(SALES_CONTACT_DEALS, {
    variables: { companyId, limit: CONTACT_RECORDS_LIMIT },
    skip: !companyId || !canView,
  });

  const dealsById = new Map<string, TContactDeal>();
  [
    ...(customerDeals.data?.deals?.list || []),
    ...(companyDeals.data?.deals?.list || []),
  ].forEach((deal) => {
    if (deal && deal._id !== excludeId) dealsById.set(deal._id, deal);
  });

  return {
    dealsById,
    loading: !isLoaded || customerDeals.loading || companyDeals.loading,
  };
};
