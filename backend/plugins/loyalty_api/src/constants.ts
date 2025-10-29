export const OWNER_TYPES = {
  MEMBER: 'user',
  CUSTOMER: 'customer',
  COMPANY: 'company',
  CPUSER: 'cpUser',
  ALL: ['user', 'customer', 'company', 'cpUser'],
};

export const CAMPAIGN_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  ALL: ['expired', 'active', 'inactive'],
};

export const LOYALTY_STATUSES = {
  NEW: 'new',
  REDEEMED: 'redeemed',
  ALL: ['new', 'redeemed'],
};
