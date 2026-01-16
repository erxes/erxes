export const STATUS_TYPES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DRAFT: 'draft',
  COMPLETED: 'completed',
  ALL: ['active', 'draft', 'archived', 'completed'] as const
};

export const DISCOUNT_TYPES = {
  DEFAULT: 'default',
  FIXED: 'fixed',
  SUBTRACTION: 'subtraction',
  PERCENTAGE: 'percentage',
  BONUS: 'bonus',
  ALL: ['default', 'fixed', 'subtraction', 'percentage', 'bonus'] as const
};

export const PRICE_ADJUST_TYPES = {
  NONE: 'none',
  DEFAULT: 'default',
  ROUND: 'round',
  FLOOR: 'floor',
  CEIL: 'ceil',
  ENDSWITH9: 'endsWith9',
  ALL: ['none', 'default', 'round', 'floor', 'ceil', 'endsWith9'] as const
};

export const APPLY_TYPES = {
  PRODUCT: 'product',
  CATEGORY: 'category',
  BUNDLE: 'bundle',
  SEGMENT: 'segment',
  VENDOR: 'vendor',
  TAG: 'tag',
  ALL: ['product', 'category', 'bundle', 'segment', 'vendor', 'tag'] as const
};

export const RULE_TYPES = {
  MINIMUM: 'minimum',
  EXACT: 'exact',
  EVERY: 'every',
  ALL: ['minimum', 'exact', 'every'] as const
};

export const EXPIRY_TYPES = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL: ['hour', 'day', 'week', 'month', 'year'] as const
};
