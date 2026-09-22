export enum SegmentOperator {
  Equals = 'e',
  NotEquals = 'dne',
  Contains = 'c',
  NotContains = 'dnc',

  IsSet = 'is',
  IsNotSet = 'ins',

  IsTrue = 'it',
  IsFalse = 'if',

  In = 'in',
  NotIn = 'nin',

  NumberGt = 'numberigt',
  NumberLt = 'numberilt',

  DateGte = 'dateigt',
  DateLte = 'dateilt',

  MinutesFromNow = 'wobm',
  MinutesAgo = 'woam',
  DaysFromNow = 'wobd',
  DaysAgo = 'woad',

  AnniversaryToday = 'annt',
  AnniversaryFromNow = 'annfn',
  AnniversaryAgo = 'annago',

  DateIsSet = 'dateis',
  DateIsNotSet = 'dateins',
  NumberEquals = 'numbere',
  NumberNotEquals = 'numberdne',
  DateRelativeLt = 'drlt',
  DateRelativeGt = 'drgt',
}

export type SegmentOperatorInput = 'none' | 'field' | 'number';

export type SegmentOperatorSpec = {
  value: SegmentOperator;
  label: string;
  input: SegmentOperatorInput;
  hint?: string;
  deprecated?: SegmentOperator;
};

export const SEGMENT_OPERATOR_SPECS: Record<
  SegmentOperator,
  SegmentOperatorSpec
> = {
  [SegmentOperator.Equals]: {
    value: SegmentOperator.Equals,
    label: 'equals to',
    input: 'field',
  },
  [SegmentOperator.NotEquals]: {
    value: SegmentOperator.NotEquals,
    label: 'is not equal to',
    input: 'field',
  },
  [SegmentOperator.Contains]: {
    value: SegmentOperator.Contains,
    label: 'contains',
    input: 'field',
  },
  [SegmentOperator.NotContains]: {
    value: SegmentOperator.NotContains,
    label: 'does not contain',
    input: 'field',
  },
  [SegmentOperator.IsSet]: {
    value: SegmentOperator.IsSet,
    label: 'is set',
    input: 'none',
  },
  [SegmentOperator.IsNotSet]: {
    value: SegmentOperator.IsNotSet,
    label: 'is not set',
    input: 'none',
  },
  [SegmentOperator.IsTrue]: {
    value: SegmentOperator.IsTrue,
    label: 'is true',
    input: 'none',
  },
  [SegmentOperator.IsFalse]: {
    value: SegmentOperator.IsFalse,
    label: 'is false',
    input: 'none',
  },
  [SegmentOperator.In]: {
    value: SegmentOperator.In,
    label: 'is any of',
    input: 'field',
  },
  [SegmentOperator.NotIn]: {
    value: SegmentOperator.NotIn,
    label: 'is none of',
    input: 'field',
  },
  [SegmentOperator.NumberGt]: {
    value: SegmentOperator.NumberGt,
    label: 'is greater than or equal to',
    input: 'field',
  },
  [SegmentOperator.NumberLt]: {
    value: SegmentOperator.NumberLt,
    label: 'is less than or equal to',
    input: 'field',
  },
  [SegmentOperator.DateGte]: {
    value: SegmentOperator.DateGte,
    label: 'is on or after',
    input: 'field',
  },
  [SegmentOperator.DateLte]: {
    value: SegmentOperator.DateLte,
    label: 'is on or before',
    input: 'field',
  },
  [SegmentOperator.MinutesFromNow]: {
    value: SegmentOperator.MinutesFromNow,
    label: 'minute(s) before',
    input: 'number',
    hint: 'That one minute, not everything between now and then.',
  },
  [SegmentOperator.MinutesAgo]: {
    value: SegmentOperator.MinutesAgo,
    label: 'minute(s) later',
    input: 'number',
    hint: 'That one minute, not everything since.',
  },
  [SegmentOperator.DaysFromNow]: {
    value: SegmentOperator.DaysFromNow,
    label: 'day(s) before',
    input: 'number',
    hint: 'That one day, not everything between now and then.',
  },
  [SegmentOperator.DaysAgo]: {
    value: SegmentOperator.DaysAgo,
    label: 'day(s) later',
    input: 'number',
    hint: 'That one day, not everything since.',
  },

  [SegmentOperator.AnniversaryToday]: {
    value: SegmentOperator.AnniversaryToday,
    label: 'anniversary is today',
    input: 'none',
    hint: 'The day and month, in any year - a birthday rather than the date itself. Re-checked every night, so it holds only for the day.',
  },
  [SegmentOperator.AnniversaryFromNow]: {
    value: SegmentOperator.AnniversaryFromNow,
    label: 'anniversary in day(s)',
    input: 'number',
    hint: 'Counts forward to the next time that day and month come round, in any year.',
  },
  [SegmentOperator.AnniversaryAgo]: {
    value: SegmentOperator.AnniversaryAgo,
    label: 'day(s) since anniversary',
    input: 'number',
    hint: 'Counts back to the last time that day and month came round, in any year.',
  },

  [SegmentOperator.DateIsSet]: {
    value: SegmentOperator.DateIsSet,
    label: 'is set',
    input: 'none',
    deprecated: SegmentOperator.IsSet,
  },
  [SegmentOperator.DateIsNotSet]: {
    value: SegmentOperator.DateIsNotSet,
    label: 'is not set',
    input: 'none',
    deprecated: SegmentOperator.IsNotSet,
  },
  [SegmentOperator.NumberEquals]: {
    value: SegmentOperator.NumberEquals,
    label: 'equals to',
    input: 'field',
    deprecated: SegmentOperator.Equals,
  },
  [SegmentOperator.NumberNotEquals]: {
    value: SegmentOperator.NumberNotEquals,
    label: 'is not equal to',
    input: 'field',
    deprecated: SegmentOperator.NotEquals,
  },
  [SegmentOperator.DateRelativeLt]: {
    value: SegmentOperator.DateRelativeLt,
    label: 'is on or before',
    input: 'field',
    deprecated: SegmentOperator.DateLte,
  },
  [SegmentOperator.DateRelativeGt]: {
    value: SegmentOperator.DateRelativeGt,
    label: 'is on or after',
    input: 'field',
    deprecated: SegmentOperator.DateGte,
  },
};

export const SEGMENT_IMPLICIT_OPERATORS: SegmentOperator[] = [
  SegmentOperator.IsSet,
  SegmentOperator.IsNotSet,
];

export const normalizeSegmentOperator = (
  operator: SegmentOperator,
): SegmentOperator => SEGMENT_OPERATOR_SPECS[operator]?.deprecated || operator;
