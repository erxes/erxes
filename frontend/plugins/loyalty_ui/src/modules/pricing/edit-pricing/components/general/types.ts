import { PricingPriorityFormValue } from '@/pricing/constants';
import { IPricingPlanDetail, PricingAppliesTo } from '@/pricing/types';

export type GeneralPricingStatus =
  | 'active'
  | 'archived'
  | 'draft'
  | 'completed';

export interface GeneralFormValues {
  name: string;
  status: GeneralPricingStatus;
  priority: PricingPriorityFormValue;
  startDate: string | null;
  endDate: string | null;
  appliesTo: PricingAppliesTo;
  productCategoryIds: string[];
  excludeCategoryIds: string[];
  excludeProductIds: string[];
  appliesProductIds: string[];
  segmentId: string | null;
  vendorCompanyIds: string[];
  productTagIds: string[];
  excludeTagIds: string[];
  bundleProductIds: string[];
}

export type GeneralPricingDocument = Partial<IPricingPlanDetail> & {
  _id: string;
};
