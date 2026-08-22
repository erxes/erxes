import type { PricingAppliesTo } from '@/pricing/types';

export type PricingTargetFieldName =
  | 'productCategoryIds'
  | 'appliesProductIds'
  | 'segmentId'
  | 'vendorCompanyIds'
  | 'productTagIds'
  | 'bundleProductIds';

export const PRICING_TARGET_FIELD_NAMES: PricingTargetFieldName[] = [
  'productCategoryIds',
  'appliesProductIds',
  'segmentId',
  'vendorCompanyIds',
  'productTagIds',
  'bundleProductIds',
];

interface PricingTargetValues {
  appliesTo: PricingAppliesTo;
  productCategoryIds: string[];
  appliesProductIds: string[];
  segmentId: string | null;
  vendorCompanyIds: string[];
  productTagIds: string[];
  bundleProductIds: string[];
}

export const getPricingTargetValidationError = (
  values: PricingTargetValues,
  t: (key: string) => string,
): { field: PricingTargetFieldName; message: string } | null => {
  switch (values.appliesTo) {
    case 'category':
      return values.productCategoryIds.length
        ? null
        : {
            field: 'productCategoryIds',
            message: t('select-at-least-one-category'),
          };
    case 'product':
      return values.appliesProductIds.length
        ? null
        : {
            field: 'appliesProductIds',
            message: t('select-at-least-one-product'),
          };
    case 'segment':
      return values.segmentId
        ? null
        : { field: 'segmentId', message: t('select-a-segment') };
    case 'vendor':
      return values.vendorCompanyIds.length
        ? null
        : {
            field: 'vendorCompanyIds',
            message: t('select-at-least-one-vendor'),
          };
    case 'tag':
      return values.productTagIds.length
        ? null
        : {
            field: 'productTagIds',
            message: t('select-at-least-one-tag'),
          };
    case 'bundle':
      return values.bundleProductIds.length
        ? null
        : {
            field: 'bundleProductIds',
            message: t('select-at-least-one-bundle-product'),
          };
  }

  return null;
};
