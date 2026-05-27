export const SCORE_ACTION = {
  ADD: 'add',
  SUBTRACT: 'subtract',
  SET: 'set',
  REFUND: 'refund',
  ALL: ['add', 'subtract', 'set', 'refund'],
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
