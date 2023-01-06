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

export const APPLY_TYPES = {
  PRODUCT: 'product',
  CATEGORY: 'category',
  ALL: ['product', 'category']
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
