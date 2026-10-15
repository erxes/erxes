import { isRecord } from '@/loyalties/utils/isRecord';

export type TCampaignRestrictions = {
  minimumSpend?: number;
  maximumSpend?: number;
  categoryIds: string[];
  excludeCategoryIds: string[];
  productIds: string[];
  excludeProductIds: string[];
  tag: string[];
  orExcludeTag: string[];
};

const toNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
};

const toStrings = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return value ? [value] : [];
  }

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
};

export const parseCampaignRestrictions = (
  value: unknown,
): TCampaignRestrictions => {
  const restrictions = isRecord(value) ? value : {};

  return {
    minimumSpend: toNumber(restrictions.minimumSpend),
    maximumSpend: toNumber(restrictions.maximumSpend),
    categoryIds: toStrings(restrictions.categoryIds),
    excludeCategoryIds: toStrings(restrictions.excludeCategoryIds),
    productIds: toStrings(restrictions.productIds),
    excludeProductIds: toStrings(restrictions.excludeProductIds),
    tag: toStrings(restrictions.tag),
    orExcludeTag: toStrings(restrictions.orExcludeTag),
  };
};
