export const USER_TYPES = ['CRM', 'CP'] as const;
export type UserTypes = typeof USER_TYPES[number];
import * as _ from 'lodash';

export const ALL_CP_USER_LEVELS = {
  GUEST: 0,
  REGISTERED: 1,
  SUBSCRIBED: 2,
  NO_ONE: 999
} as const;

export const ALL_CP_USER_LEVEL_REQUIREMENT_ERROR_MESSAGES: {
  [x in keyof typeof ALL_CP_USER_LEVELS]: string;
} = {
  GUEST: 'Everyone is allowed',
  REGISTERED: 'Login is required',
  SUBSCRIBED: 'Subscription is required',
  NO_ONE: 'No one is allowed'
} as const;

export type CpUserLevels = keyof typeof ALL_CP_USER_LEVELS;

export const WRITE_CP_USER_LEVELS = _.omit(ALL_CP_USER_LEVELS, 'GUEST');
export type WriteCpUserLevels = keyof typeof WRITE_CP_USER_LEVELS;

export const READ_CP_USER_LEVELS = { ...ALL_CP_USER_LEVELS };
export type ReadCpUserLevels = keyof typeof READ_CP_USER_LEVELS;

export const PERMISSIONS = [
  'READ_POST',
  'WRITE_POST',
  'WRITE_COMMENT'
] as const;
export type Permissions = typeof PERMISSIONS[number];

/**
years = y
months = M
weeks = w
days = d
hours = h
minutes = m
seconds = s
milliseconds = ms
 */
export const TIME_DURATION_UNITS = [
  'seconds',
  'minutes',
  'hours',
  'days',
  'weeks',
  'months',
  'years',
  'y',
  'M',
  'w',
  'd',
  'h',
  'm',
  's',
  'ms'
] as const;

export type TimeDurationUnit = typeof TIME_DURATION_UNITS[number];
