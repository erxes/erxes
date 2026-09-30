import { IPricing, PricingPriority } from '@/pricing/types';
import { PRICING_PLANS } from '@/pricing/graphql/queries';
import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { EnumCursorDirection, useMultiQueryState } from 'erxes-ui';

const PRICING_PER_PAGE = 20;

interface IPricingPlansQueryResult {
  pricingPlans: Array<{
    _id: string;
    name: string;
    status: string;
    priority: PricingPriority;
    applyType: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    createdUser?: {
      details?: {
        fullName?: string;
      };
      email?: string;
    };
  }>;
  pricingPlansCount: number;
}

interface PricingFilterVariables {
  page?: number;
  perPage?: number;
  status?: string;
  priority?: string;
  branchId?: string;
  departmentId?: string;
  productId?: string;
  date?: string;
  isQuantityEnabled?: boolean;
  isPriceEnabled?: boolean;
  isExpiryEnabled?: boolean;
  isRepeatEnabled?: boolean;
}

interface HandleFetchMoreParams {
  direction?: EnumCursorDirection;
}

export const usePricing = () => {
  const [queries] = useMultiQueryState<{
    status?: string | null;
    priority?: string | null;
    branchId?: string | null;
    departmentId?: string | null;
    productId?: string | null;
    date?: string | null;
    isQuantityEnabled?: boolean | null;
    isPriceEnabled?: boolean | null;
    isExpiryEnabled?: boolean | null;
    isRepeatEnabled?: boolean | null;
    [key: string]: string | boolean | null | undefined;
  }>([
    'status',
    'priority',
    'branchId',
    'departmentId',
    'productId',
    'date',
    'isQuantityEnabled',
    'isPriceEnabled',
    'isExpiryEnabled',
    'isRepeatEnabled',
  ]);

  const variables = useMemo<PricingFilterVariables>(() => {
    const nextVariables: PricingFilterVariables = {
      page: 1,
      perPage: PRICING_PER_PAGE,
      status: 'all',
    };
    if (queries?.status) nextVariables.status = queries.status;
    if (queries?.priority) {
      nextVariables.priority =
        queries.priority === 'none' ? '' : queries.priority;
    }
    if (queries?.branchId) nextVariables.branchId = queries.branchId;
    if (queries?.departmentId)
      nextVariables.departmentId = queries.departmentId;
    if (queries?.productId) nextVariables.productId = queries.productId;
    if (queries?.date) nextVariables.date = queries.date;
    if (queries?.isQuantityEnabled === true) {
      nextVariables.isQuantityEnabled = true;
    }
    if (queries?.isPriceEnabled === true) nextVariables.isPriceEnabled = true;
    if (queries?.isExpiryEnabled === true)
      nextVariables.isExpiryEnabled = true;
    if (queries?.isRepeatEnabled === true)
      nextVariables.isRepeatEnabled = true;

    return nextVariables;
  }, [queries]);

  const { data, loading, fetchMore } = useQuery<IPricingPlansQueryResult>(
    PRICING_PLANS,
    {
      variables,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  const pricing: IPricing[] =
    data?.pricingPlans?.map((plan) => ({
      _id: plan._id,
      name: plan.name,
      status: plan.status as IPricing['status'],
      priority: plan.priority,
      applyType: plan.applyType as IPricing['applyType'],
      createdBy:
        plan.createdUser?.details?.fullName ||
        plan.createdBy ||
        plan.createdUser?.email ||
        '',
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    })) || [];

  const totalCount = data?.pricingPlansCount || 0;
  const hasNextPage = pricing.length < totalCount;

  const handleFetchMore = useCallback(
    ({ direction }: HandleFetchMoreParams = {}) => {
      if (direction && direction !== EnumCursorDirection.FORWARD) return;
      if (!hasNextPage) return;

      fetchMore({
        variables: {
          ...variables,
          page: Math.ceil(pricing.length / PRICING_PER_PAGE) + 1,
          perPage: PRICING_PER_PAGE,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult?.pricingPlans?.length) {
            return previousResult;
          }

          return {
            ...fetchMoreResult,
            pricingPlans: [
              ...(previousResult.pricingPlans || []),
              ...fetchMoreResult.pricingPlans,
            ],
            pricingPlansCount:
              fetchMoreResult.pricingPlansCount ??
              previousResult.pricingPlansCount,
          };
        },
      });
    },
    [fetchMore, hasNextPage, pricing.length, variables],
  );

  return {
    pricing,
    loading,
    totalCount,
    handleFetchMore,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: false,
    },
  };
};
