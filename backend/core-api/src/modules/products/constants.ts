export const PRODUCT_TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  UNIQUE: 'unique',
  SUBSCRIPTION: 'subscription',
  ALL: ['product', 'service', 'unique', 'subscription'],
};

export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted'],
};

export const PRODUCT_CATEGORY_STATUSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  ARCHIVED: 'archived',
  ALL: ['active', 'disabled', 'archived'],
};

export const PRODUCT_CATEGORY_MASK_TYPES = {
  ANY: '',
  SOFT: 'soft',
  HARD: 'hard',
  ALL: ['', 'soft', 'hard'],
};

export const TIMELY_TYPES = {
  ANY: '',
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  seasonally: 'seasonally',
  ALL: ['', 'daily', 'weekly', 'monthly', 'seasonally'],
};

export const PRODUCT_EXTEND_FIELDS = [
  {
    _id: Math.random(),
    name: 'barcodes',
    label: 'Barcodes',
    type: 'string',
  },
];
