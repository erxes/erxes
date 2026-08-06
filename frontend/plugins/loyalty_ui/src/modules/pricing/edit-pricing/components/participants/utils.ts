import type { IPricingPlanDetail } from '@/pricing/types';

export interface CustomerBrokerFormValues {
  customerIds: string[];
  customerTags: string[];
  customerExcludeTags: string[];
  customerSegmentId: string | null;
  companyIds: string[];
  companyTags: string[];
  companyExcludeTags: string[];
  companySegmentId: string | null;
  userIds: string[];
  userPositions: string[];
  userSegmentId: string | null;
  brokerCustomerIds: string[];
  brokerCustomerTags: string[];
  brokerCustomerExcludeTags: string[];
  brokerCustomerSegmentId: string | null;
  brokerCompanyIds: string[];
  brokerCompanyTags: string[];
  brokerCompanyExcludeTags: string[];
  brokerCompanySegmentId: string | null;
  brokerUserIds: string[];
  brokerUserPositions: string[];
  brokerUserSegmentId: string | null;
}

export const CUSTOMER_BROKER_DEFAULTS: CustomerBrokerFormValues = {
  customerIds: [],
  customerTags: [],
  customerExcludeTags: [],
  customerSegmentId: null,
  companyIds: [],
  companyTags: [],
  companyExcludeTags: [],
  companySegmentId: null,
  userIds: [],
  userPositions: [],
  userSegmentId: null,
  brokerCustomerIds: [],
  brokerCustomerTags: [],
  brokerCustomerExcludeTags: [],
  brokerCustomerSegmentId: null,
  brokerCompanyIds: [],
  brokerCompanyTags: [],
  brokerCompanyExcludeTags: [],
  brokerCompanySegmentId: null,
  brokerUserIds: [],
  brokerUserPositions: [],
  brokerUserSegmentId: null,
};

export const customerBrokerFromDetail = (
  detail: IPricingPlanDetail,
): CustomerBrokerFormValues => ({
  customerIds: detail.customerIds || [],
  customerTags: detail.customerTags || [],
  customerExcludeTags: detail.customerExcludeTags || [],
  customerSegmentId: detail.customerSegmentIds?.[0] || null,
  companyIds: detail.companyIds || [],
  companyTags: detail.companyTags || [],
  companyExcludeTags: detail.companyExcludeTags || [],
  companySegmentId: detail.companySegmentIds?.[0] || null,
  userIds: detail.userIds || [],
  userPositions: detail.userPositions || [],
  userSegmentId: detail.userSegmentIds?.[0] || null,
  brokerCustomerIds: detail.brokerCustomerIds || [],
  brokerCustomerTags: detail.brokerCustomerTags || [],
  brokerCustomerExcludeTags: detail.brokerCustomerExcludeTags || [],
  brokerCustomerSegmentId: detail.brokerCustomerSegmentIds?.[0] || null,
  brokerCompanyIds: detail.brokerCompanyIds || [],
  brokerCompanyTags: detail.brokerCompanyTags || [],
  brokerCompanyExcludeTags: detail.brokerCompanyExcludeTags || [],
  brokerCompanySegmentId: detail.brokerCompanySegmentIds?.[0] || null,
  brokerUserIds: detail.brokerUserIds || [],
  brokerUserPositions: detail.brokerUserPositions || [],
  brokerUserSegmentId: detail.brokerUserSegmentIds?.[0] || null,
});

const toSegmentArray = (id: string | null): string[] => (id ? [id] : []);

export const customerBrokerToDoc = (
  values: CustomerBrokerFormValues,
): Partial<IPricingPlanDetail> => ({
  customerIds: values.customerIds,
  customerTags: values.customerTags,
  customerExcludeTags: values.customerExcludeTags,
  customerSegmentIds: toSegmentArray(values.customerSegmentId),
  companyIds: values.companyIds,
  companyTags: values.companyTags,
  companyExcludeTags: values.companyExcludeTags,
  companySegmentIds: toSegmentArray(values.companySegmentId),
  userIds: values.userIds,
  userPositions: values.userPositions,
  userSegmentIds: toSegmentArray(values.userSegmentId),
  brokerCustomerIds: values.brokerCustomerIds,
  brokerCustomerTags: values.brokerCustomerTags,
  brokerCustomerExcludeTags: values.brokerCustomerExcludeTags,
  brokerCustomerSegmentIds: toSegmentArray(values.brokerCustomerSegmentId),
  brokerCompanyIds: values.brokerCompanyIds,
  brokerCompanyTags: values.brokerCompanyTags,
  brokerCompanyExcludeTags: values.brokerCompanyExcludeTags,
  brokerCompanySegmentIds: toSegmentArray(values.brokerCompanySegmentId),
  brokerUserIds: values.brokerUserIds,
  brokerUserPositions: values.brokerUserPositions,
  brokerUserSegmentIds: toSegmentArray(values.brokerUserSegmentId),
});
