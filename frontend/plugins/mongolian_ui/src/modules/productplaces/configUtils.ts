
import { MNConfig, ConfigValueItem, NormalizedConfig } from './types';

// Convert array-based config to normalized object
export const normalizeConfig = (config: MNConfig): NormalizedConfig => {
  if (!config?.value || !Array.isArray(config.value)) {
    return {};
  }
  
  return config.value.reduce((acc: NormalizedConfig, item: ConfigValueItem) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
};

// Convert normalized object back to array-based config
export const denormalizeConfig = (normalized: NormalizedConfig): ConfigValueItem[] => {
  return Object.entries(normalized).map(([key, value]) => ({
    key,
    value
  }));
};

// Type-specific normalization helpers
export const normalizePrintConfig = (config: MNConfig): any => {
  const normalized = normalizeConfig(config);
  // Ensure conditions is always an array
  return {
    ...normalized,
    conditions: normalized.conditions || []
  };
};

export const normalizeSplitConfig = (config: MNConfig): any => {
  const normalized = normalizeConfig(config);
  return {
    ...normalized,
    productCategoryIds: normalized.productCategoryIds || [],
    excludeCategoryIds: normalized.excludeCategoryIds || [],
    productTagIds: normalized.productTagIds || [],
    excludeTagIds: normalized.excludeTagIds || [],
    excludeProductIds: normalized.excludeProductIds || [],
    segmentIds: normalized.segmentIds || []
  };
};

export const normalizePlaceConfig = (config: MNConfig): any => {
  const normalized = normalizeConfig(config);
  return {
    ...normalized,
    conditions: normalized.conditions || [],
    checkPricing: normalized.checkPricing || false
  };
};

// Create empty configs
export const createEmptyPrintConfig = (): ConfigValueItem[] => {
  return [
    { key: 'title', value: '' },
    { key: 'boardId', value: '' },
    { key: 'pipelineId', value: '' },
    { key: 'stageId', value: '' },
    { key: 'conditions', value: [] }
  ];
};

export const createEmptySplitConfig = (): ConfigValueItem[] => {
  return [
    { key: 'title', value: '' },
    { key: 'boardId', value: '' },
    { key: 'pipelineId', value: '' },
    { key: 'stageId', value: '' },
    { key: 'productCategoryIds', value: [] },
    { key: 'excludeCategoryIds', value: [] },
    { key: 'productTagIds', value: [] },
    { key: 'excludeTagIds', value: [] },
    { key: 'excludeProductIds', value: [] },
    { key: 'segmentIds', value: [] }
  ];
};

export const createEmptyPlaceConfig = (): ConfigValueItem[] => {
  return [
    { key: 'title', value: '' },
    { key: 'boardId', value: '' },
    { key: 'pipelineId', value: '' },
    { key: 'stageId', value: '' },
    { key: 'conditions', value: [] },
    { key: 'checkPricing', value: false }
  ];
};