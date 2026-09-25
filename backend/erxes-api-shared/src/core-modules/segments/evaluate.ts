import {
  segmentFieldRef,
  segmentReferenceRef,
  segmentRelationRef,
} from './nodeRefs';
import { SegmentOperator, normalizeSegmentOperator } from './operators';

import { SegmentFieldNode, SegmentNode, SegmentValue } from './nodes';
import {
  DEFAULT_SEGMENT_TIME_ZONE,
  isAnniversary,
  shiftZonedDays,
  zonedDate,
} from './zonedTime';

export type SegmentEvaluationState = 'matched' | 'notMatched' | 'unknown';

export type SegmentDecideContext = {
  subjectType?: string;
  values: ReadonlyMap<string, unknown>;
  unavailable?: ReadonlySet<string>;
  now?: Date;
  timeZone?: string;
};

const MINUTE_MS = 60_000;

const toList = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [value];

const isPresent = (value: unknown): boolean => {
  if (value === undefined || value === null) {
    return false;
  }

  return !(Array.isArray(value) && value.length === 0);
};

const toOrdinal = (value: unknown): number | undefined => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const numeric = Number(value.replace(/,/g, ''));

    if (!Number.isNaN(numeric)) {
      return numeric;
    }

    const parsed = Date.parse(value);

    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
};

const sameValue = (value: unknown, expected: SegmentValue): boolean => {
  const left = toOrdinal(value);
  const right = toOrdinal(expected);

  if (left !== undefined && right !== undefined) {
    return left === right;
  }

  return String(value) === String(expected);
};

const anyInCommon = (value: unknown, expected: SegmentValue): boolean =>
  toList(expected).some((candidate) =>
    toList(value).some((item) => sameValue(item, candidate as SegmentValue)),
  );

const containsText = (value: unknown, expected: SegmentValue): boolean =>
  String(value).toLowerCase().includes(String(expected).toLowerCase());

const compareOrdinal = (
  value: unknown,
  expected: SegmentValue,
  direction: 'gte' | 'lte',
): boolean => {
  const right = toOrdinal(expected);

  if (right === undefined) {
    return false;
  }

  return toList(value).some((item) => {
    const left = toOrdinal(item);

    if (left === undefined) {
      return false;
    }

    return direction === 'gte' ? left >= right : left <= right;
  });
};

const matchesMinuteBucket = (
  value: unknown,
  expected: SegmentValue,
  now: Date,
  offset: 1 | -1,
): boolean => {
  const amount = toOrdinal(expected);

  if (amount === undefined) {
    return false;
  }

  const target = Math.floor(
    (now.getTime() + offset * amount * MINUTE_MS) / MINUTE_MS,
  );

  return toList(value).some((item) => {
    const left = toOrdinal(item);

    return left !== undefined && Math.floor(left / MINUTE_MS) === target;
  });
};

const matchesDayBucket = (
  value: unknown,
  expected: SegmentValue,
  now: Date,
  timeZone: string,
  offset: 1 | -1,
): boolean => {
  const amount = toOrdinal(expected);

  if (amount === undefined) {
    return false;
  }

  const target = shiftZonedDays(zonedDate(now, timeZone), offset * amount);

  return toList(value).some((item) => {
    const at = toOrdinal(item);

    if (at === undefined) {
      return false;
    }

    const on = zonedDate(new Date(at), timeZone);

    return (
      on.year === target.year &&
      on.month === target.month &&
      on.day === target.day
    );
  });
};

const matchesAnniversary = (
  value: unknown,
  expected: SegmentValue | undefined,
  now: Date,
  timeZone: string,
  offset: 0 | 1 | -1,
): boolean => {
  const amount = offset === 0 ? 0 : toOrdinal(expected);

  if (amount === undefined) {
    return false;
  }

  const target = shiftZonedDays(zonedDate(now, timeZone), offset * amount);

  return toList(value).some((item) => {
    const at = toOrdinal(item);

    return at !== undefined && isAnniversary(new Date(at), target, timeZone);
  });
};

const matchesOperator = (
  operator: SegmentOperator,
  value: unknown,
  expected: SegmentValue | undefined,
  now: Date,
  timeZone: string,
): boolean => {
  switch (operator) {
    case SegmentOperator.IsSet:
      return isPresent(value);
    case SegmentOperator.IsNotSet:
      return !isPresent(value);
    case SegmentOperator.IsTrue:
      return toList(value).some((item) => item === true || item === 'true');
    case SegmentOperator.IsFalse:
      return toList(value).some((item) => item === false || item === 'false');
    case SegmentOperator.AnniversaryToday:
      return matchesAnniversary(value, expected, now, timeZone, 0);
    default:
      break;
  }

  if (expected === undefined) {
    return false;
  }

  switch (operator) {
    case SegmentOperator.Equals:
      return toList(value).some((item) => sameValue(item, expected));
    case SegmentOperator.NotEquals:
      return !toList(value).some((item) => sameValue(item, expected));
    case SegmentOperator.Contains:
      return (
        isPresent(value) && toList(value).some((i) => containsText(i, expected))
      );
    case SegmentOperator.NotContains:
      return !toList(value).some((item) => containsText(item, expected));

    case SegmentOperator.In:
      return anyInCommon(value, expected);
    case SegmentOperator.NotIn:
      return !anyInCommon(value, expected);

    case SegmentOperator.NumberGt:
    case SegmentOperator.DateGte:
      return compareOrdinal(value, expected, 'gte');
    case SegmentOperator.NumberLt:
    case SegmentOperator.DateLte:
      return compareOrdinal(value, expected, 'lte');

    case SegmentOperator.MinutesFromNow:
      return matchesMinuteBucket(value, expected, now, 1);
    case SegmentOperator.MinutesAgo:
      return matchesMinuteBucket(value, expected, now, -1);
    case SegmentOperator.DaysFromNow:
      return matchesDayBucket(value, expected, now, timeZone, 1);
    case SegmentOperator.DaysAgo:
      return matchesDayBucket(value, expected, now, timeZone, -1);

    case SegmentOperator.AnniversaryFromNow:
      return matchesAnniversary(value, expected, now, timeZone, 1);
    case SegmentOperator.AnniversaryAgo:
      return matchesAnniversary(value, expected, now, timeZone, -1);

    default:
      return false;
  }
};

const decideField = (
  node: SegmentFieldNode,
  context: SegmentDecideContext,
  now: Date,
  timeZone: string,
): SegmentEvaluationState => {
  const ref = segmentFieldRef(node);

  if (context.unavailable?.has(ref)) {
    return 'unknown';
  }

  const operator = normalizeSegmentOperator(node.operator);

  return matchesOperator(
    operator,
    context.values.get(ref),
    node.value,
    now,
    timeZone,
  )
    ? 'matched'
    : 'notMatched';
};

const combine = (
  conjunction: 'and' | 'or',
  states: SegmentEvaluationState[],
): SegmentEvaluationState => {
  if (conjunction === 'and') {
    if (states.includes('notMatched')) {
      return 'notMatched';
    }

    return states.every((state) => state === 'matched') ? 'matched' : 'unknown';
  }

  if (states.includes('matched')) {
    return 'matched';
  }

  return states.every((state) => state === 'notMatched')
    ? 'notMatched'
    : 'unknown';
};

export const decideSegmentNode = (
  node: SegmentNode,
  context: SegmentDecideContext,
): SegmentEvaluationState => {
  const now = context.now || new Date();
  const timeZone = context.timeZone || DEFAULT_SEGMENT_TIME_ZONE;

  if (node.kind === 'field') {
    return decideField(node, context, now, timeZone);
  }

  if (node.kind === 'segment') {
    if (!context.subjectType) {
      return 'unknown';
    }

    const ref = segmentReferenceRef(context.subjectType);

    if (context.unavailable?.has(ref)) {
      return 'unknown';
    }

    const member = toList(context.values.get(ref)).some(
      (id) => id === node.segmentId,
    );

    return (node.exclude ? !member : member) ? 'matched' : 'notMatched';
  }

  if (node.kind === 'relation') {
    const ref = segmentRelationRef(node);

    if (context.unavailable?.has(ref)) {
      return 'unknown';
    }

    const resolved = context.values.get(ref);

    if (resolved === undefined) {
      return 'unknown';
    }

    if (node.measure.op === 'exists' || node.measure.op === 'none') {
      if (typeof resolved !== 'boolean') {
        return 'unknown';
      }

      const present = node.measure.op === 'exists' ? resolved : !resolved;

      return present ? 'matched' : 'notMatched';
    }

    if (!node.operator) {
      return 'unknown';
    }

    return matchesOperator(
      normalizeSegmentOperator(node.operator),
      resolved,
      node.value,
      now,
      timeZone,
    )
      ? 'matched'
      : 'notMatched';
  }

  if (!node.children.length) {
    return 'unknown';
  }

  return combine(
    node.conjunction,
    node.children.map((child) => decideSegmentNode(child, context)),
  );
};
