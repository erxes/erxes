import { IPricing } from '@/pricing/types';
import { PRICING_PLANS } from '@/pricing/graphql/queries';
import { useQuery } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';

interface IPricingPlansQueryResult {
  pricingPlans: Array<{
    _id: string;
    name: string;
    status: string;
    isPriority: boolean;
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
}

interface PricingFilterVariables {
  status?: string;
  prioritizeRule?: string;
  branchId?: string;
  departmentId?: string;
  productId?: string;
  date?: string;
  isQuantityEnabled?: boolean;
  isPriceEnabled?: boolean;
  isExpiryEnabled?: boolean;
  isRepeatEnabled?: boolean;
}

export const usePricing = () => {
  const [queries] = useMultiQueryState<{
    status?: string | null;
    isPriority?: string | null;
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
    'isPriority',
    'branchId',
    'departmentId',
    'productId',
    'date',
    'isQuantityEnabled',
    'isPriceEnabled',
    'isExpiryEnabled',
    'isRepeatEnabled',
  ]);

  const variables: PricingFilterVariables = {};
  if (queries?.status) variables.status = queries.status;
  if (queries?.isPriority) variables.prioritizeRule = queries.isPriority;
  if (queries?.branchId) variables.branchId = queries.branchId;
  if (queries?.departmentId) variables.departmentId = queries.departmentId;
  if (queries?.productId) variables.productId = queries.productId;
  if (queries?.date) variables.date = queries.date;
  if (queries?.isQuantityEnabled === true) variables.isQuantityEnabled = true;
  if (queries?.isPriceEnabled === true) variables.isPriceEnabled = true;
  if (queries?.isExpiryEnabled === true) variables.isExpiryEnabled = true;
  if (queries?.isRepeatEnabled === true) variables.isRepeatEnabled = true;

  const { data, loading } = useQuery<IPricingPlansQueryResult>(PRICING_PLANS, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const pricing: IPricing[] =
    data?.pricingPlans?.map((plan) => ({
      _id: plan._id,
      name: plan.name,
      status: plan.status as IPricing['status'],
      isPriority: plan.isPriority,
      applyType: plan.applyType as IPricing['applyType'],
      createdBy:
        plan.createdUser?.details?.fullName ||
        plan.createdBy ||
        plan.createdUser?.email ||
        '',
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    })) || [];

  const totalCount = pricing.length;

  return {
    pricing,
    loading,
    totalCount,
  };
};
