export const STATUS_TYPES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DRAFT: 'draft',
  COMPLETED: 'completed',
  ALL: ['active', 'draft', 'archived', 'completed']
};

export const DISCOUNT_TYPES = {
  DEFAULT: 'default',
  FIXED: 'fixed',
  SUBTRACTION: 'subtraction',
  PERCENTAGE: 'percentage',
  BONUS: 'bonus',
  ALL: ['default', 'fixed', 'subtraction', 'percentage', 'bonus']
};

export const PRICE_ADJUST_TYPES = {
  NONE: 'none',
  DEFAULT: 'default',
  ROUND: 'round',
  FLOOR: 'floor',
  CEIL: 'ceil',
  ENDSWITH9: 'endsWith9',
  ALL: ['none', 'default', 'round', 'floor', 'ceil', 'endsWith9']
};

export const APPLY_TYPES = {
  PRODUCT: 'product',
  CATEGORY: 'category',
  BUNDLE: 'bundle',
  ALL: ['product', 'category', 'bundle']
};

export const RULE_TYPES = {
  MINIMUM: 'minimum',
  EXACT: 'exact',
  EVERY: 'every',
  ALL: ['minimum', 'exact', 'every']
};

export const EXPIRY_TYPES = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL: ['hour', 'day', 'week', 'month', 'year']
};
