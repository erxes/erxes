import {
  PRICING_APPLIES_TO_OPTIONS,
  priorityFromFormValue,
  priorityToFormValue,
} from '@/pricing/constants';
import { IPricingPlanDetail } from '@/pricing/types';
import {
  GeneralFormValues,
  GeneralPricingDocument,
  GeneralPricingStatus,
} from '@/pricing/edit-pricing/components/general/types';

export const GENERAL_FORM_ID = 'pricing-general-form';

export const GENERAL_FORM_DEFAULT_VALUES: GeneralFormValues = {
  name: '',
  status: 'active',
  priority: 'none',
  startDate: null,
  endDate: null,
  appliesTo: 'category',
  productCategoryIds: [],
  excludeCategoryIds: [],
  excludeProductIds: [],
  appliesProductIds: [],
  segmentId: null,
  vendorCompanyIds: [],
  productTagIds: [],
  excludeTagIds: [],
  bundleProductIds: [],
};

const GENERAL_PRICING_STATUSES: GeneralPricingStatus[] = [
  'active',
  'archived',
  'draft',
  'completed',
];

const getGeneralPricingStatus = (status: string): GeneralPricingStatus =>
  GENERAL_PRICING_STATUSES.find((item) => item === status) || 'active';

const getPricingAppliesTo = (applyType: string) =>
  PRICING_APPLIES_TO_OPTIONS.find(({ value }) => value === applyType)?.value ||
  'category';

export const normalizeMultipleValue = (value: string | string[]) =>
  Array.isArray(value) ? value : [value];

export const getGeneralFormValues = (
  pricingDetail: IPricingPlanDetail,
): GeneralFormValues => ({
  name: pricingDetail.name || '',
  status: getGeneralPricingStatus(pricingDetail.status),
  priority: priorityToFormValue(pricingDetail.priority),
  startDate:
    pricingDetail.isStartDateEnabled && pricingDetail.startDate
      ? pricingDetail.startDate.slice(0, 10)
      : null,
  endDate:
    pricingDetail.isEndDateEnabled && pricingDetail.endDate
      ? pricingDetail.endDate.slice(0, 10)
      : null,
  appliesTo: getPricingAppliesTo(pricingDetail.applyType),
  productCategoryIds: pricingDetail.categories || [],
  excludeCategoryIds: pricingDetail.categoriesExcluded || [],
  excludeProductIds: pricingDetail.productsExcluded || [],
  appliesProductIds: pricingDetail.products || [],
  segmentId: pricingDetail.segments?.[0] || null,
  vendorCompanyIds: pricingDetail.vendors || [],
  productTagIds: pricingDetail.tags || [],
  excludeTagIds: pricingDetail.tagsExcluded || [],
  bundleProductIds: pricingDetail.productsBundle?.[0] || [],
});

export const getGeneralPricingDocument = (
  pricingId: string,
  values: GeneralFormValues,
): GeneralPricingDocument => {
  const document: GeneralPricingDocument = {
    _id: pricingId,
    name: values.name.trim(),
    status: values.status,
    applyType: values.appliesTo,
    priority: priorityFromFormValue(values.priority),
    isStartDateEnabled: Boolean(values.startDate),
    isEndDateEnabled: Boolean(values.endDate),
  };

  if (values.startDate) {
    document.startDate = values.startDate;
  }

  if (values.endDate) {
    document.endDate = values.endDate;
  }

  if (values.appliesTo === 'category') {
    document.categories = values.productCategoryIds;
    document.categoriesExcluded = values.excludeCategoryIds;
    document.productsExcluded = values.excludeProductIds;
  }

  if (values.appliesTo === 'product') {
    document.products = values.appliesProductIds;
  }

  if (values.appliesTo === 'segment' && values.segmentId) {
    document.segments = [values.segmentId];
  }

  if (values.appliesTo === 'vendor') {
    document.vendors = values.vendorCompanyIds;
  }

  if (values.appliesTo === 'tag') {
    document.tags = values.productTagIds;
    document.tagsExcluded = values.excludeTagIds;
    document.productsExcluded = values.excludeProductIds;
  }

  if (values.appliesTo === 'bundle' && values.bundleProductIds.length) {
    document.productsBundle = [values.bundleProductIds];
  }

  return document;
};
