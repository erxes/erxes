export const USER_TYPES = ['CRM', 'CP'] as const;
export type UserTypes = typeof USER_TYPES[number];
import * as _ from 'lodash';

export const ALL_CP_USER_LEVELS = {
  GUEST: 0,
  REGISTERED: 1,
  SUBSCRIBED: 2,
  NO_ONE: 999
} as const;

export type CpUserLevels = keyof typeof ALL_CP_USER_LEVELS;

export const WRITE_CP_USER_LEVELS = _.omit(ALL_CP_USER_LEVELS, 'GUEST');
export type WriteCpUserLevels = keyof typeof WRITE_CP_USER_LEVELS;

export const READ_CP_USER_LEVELS = { ...ALL_CP_USER_LEVELS };
export type ReadCpUserLevels = keyof typeof READ_CP_USER_LEVELS;
