export const SCORE_ACTION = {
  ADD: 'add',
  SUBTRACT: 'subtract',
  REFUND: 'refund',
  ALL: ['add', 'subtract', 'refund'],
};

export const SCORE_CAMPAIGN_STATUSES = {
  PUBLISHED: 'published',
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
