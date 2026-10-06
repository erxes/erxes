export const SCORE_ACTION = {
  ADD: 'add',
  SUBTRACT: 'subtract',
  REFUND: 'refund',
  SET: 'set',
  RETURN: 'return',
  EXPIRE: 'expire',
  ALL: ['add', 'subtract', 'set', 'refund', 'return', 'expire'],
};

export const SCORE_CAMPAIGN_STATUSES = {
  PUBLISHED: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
} as const;

export const SCORE_OWNER_TYPES = {
  customer: {
    pluginName: 'core',
    moduleName: 'customer',
  },
  company: {
    pluginName: 'core',
    moduleName: 'company',
  },
  user: {
    pluginName: 'core',
    moduleName: 'user',
  },
};

export const LOYALTY_ACCOUNT_TYPE_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;
