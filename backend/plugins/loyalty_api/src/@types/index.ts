export enum OWNER_TYPES {
  MEMBER = 'member',
  CUSTOMER = 'customer',
  COMPANY = 'company',
  CPUSER = 'cpUser',
}

export enum STATUSES {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

export type LOYALTY_CONDITIONS = Record<string, any>;

export type TARGET = Record<string, any>;
