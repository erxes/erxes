import { LOYALTY_STATUSES, OWNER_TYPES } from '~/constants';

export type LOYALTY_CONDITIONS = Record<string, any>;

export type TARGET = Record<string, any>;

export type OWNER_TYPES = (typeof OWNER_TYPES)[keyof typeof OWNER_TYPES];

export type STATUSES = (typeof LOYALTY_STATUSES)[keyof typeof LOYALTY_STATUSES];
