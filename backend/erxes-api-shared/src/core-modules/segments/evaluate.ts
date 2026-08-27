import { normalizeSegmentOperator, SegmentOperator } from './fieldMeta';
import {
  SegmentFieldNode,
  SegmentNode,
  SegmentValue,
  segmentFieldRef,
  segmentRelationRef,
} from './nodes';

/**
 * Decides one subject's membership from an already-resolved value table.
 *
 * Pure on purpose: every read happens before this runs, so a segment with 53
 * conditions costs one batch of queries rather than 53 round trips, and the
 * whole condition language is testable without a database.
 */

export type SegmentEvaluationState = 'matched' | 'notMatched' | 'unknown';

export type SegmentDecideContext = {
  /** One subject's values, keyed by `segmentFieldRef` or `relationKey`. */
  values: ReadonlyMap<string, unknown>;
  /**
   * Keys whose owning plugin could not answer. A key missing from `values` is
   * a definite "unset"; a key listed here is undecidable, and the difference
   * decides whether membership may change at all.
   */
  unavailable?: ReadonlySet<string>;
  /** Evaluation instant for the relative-time operators. */
  now?: Date;
};

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

const toList = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [value];

/**
 * Mirrors an Elasticsearch `exists` check: null, undefined and an empty array
 * count as unset, an empty string does not.
 */
const isPresent = (value: unknown): boolean => {
  if (value === undefined || value === null) {
    return false;
  }

  return !(Array.isArray(value) && value.length === 0);
};

/** Position on a number line, so dates, numbers and numeric strings compare. */
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

/** Mongo's `$in`: true when the value, or any of its entries, is in the list. */
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

/**
 * The `wob*`/`woa*` operators match a whole bucket rather than a range: the
 * generated query used the same rounded instant for both bounds, so "3 days
 * ago" means that calendar day in UTC, not everything since.
 */
const matchesBucket = (
  value: unknown,
  expected: SegmentValue,
  now: Date,
  bucketMs: number,
  offset: 1 | -1,
): boolean => {
  const amount = toOrdinal(expected);

  if (amount === undefined) {
    return false;
  }

  const target = Math.floor(
    (now.getTime() + offset * amount * bucketMs) / bucketMs,
  );

  return toList(value).some((item) => {
    const left = toOrdinal(item);

    return left !== undefined && Math.floor(left / bucketMs) === target;
  });
};

const matchesOperator = (
  operator: SegmentOperator,
  value: unknown,
  expected: SegmentValue | undefined,
  now: Date,
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
    default:
      break;
  }

  if (expected === undefined) {
    return false;
  }

  switch (operator) {
    case SegmentOperator.Equals:
      return toList(value).some((item) => sameValue(item, expected));
    // An absent field satisfies a negative operator, matching the `must_not`
    // semantics the generated queries relied on.
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
      return matchesBucket(value, expected, now, MINUTE_MS, 1);
    case SegmentOperator.MinutesAgo:
      return matchesBucket(value, expected, now, MINUTE_MS, -1);
    case SegmentOperator.DaysFromNow:
      return matchesBucket(value, expected, now, DAY_MS, 1);
    case SegmentOperator.DaysAgo:
      return matchesBucket(value, expected, now, DAY_MS, -1);

    default:
      return false;
  }
};

const decideField = (
  node: SegmentFieldNode,
  context: SegmentDecideContext,
  now: Date,
): SegmentEvaluationState => {
  const ref = segmentFieldRef(node);

  if (context.unavailable?.has(ref)) {
    return 'unknown';
  }

  const operator = normalizeSegmentOperator(node.operator);

  return matchesOperator(operator, context.values.get(ref), node.value, now)
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

  if (node.kind === 'field') {
    return decideField(node, context, now);
  }

  if (node.kind === 'relation') {
    const ref = segmentRelationRef(node);

    if (context.unavailable?.has(ref)) {
      return 'unknown';
    }

    const resolved = context.values.get(ref);

    // The traversal is measured while values are resolved, so an unresolved
    // relation is undecidable rather than false.
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

    // The numeric measures compare through the same operator table as any
    // other number, so "at least three" means the same thing everywhere.
    if (!node.operator) {
      return 'unknown';
    }

    return matchesOperator(
      normalizeSegmentOperator(node.operator),
      resolved,
      node.value,
      now,
    )
      ? 'matched'
      : 'notMatched';
  }

  // An empty group would otherwise be vacuously true and sweep in every
  // record. Segments the migration emptied are exactly this shape.
  if (!node.children.length) {
    return 'unknown';
  }

  return combine(
    node.conjunction,
    node.children.map((child) => decideSegmentNode(child, context)),
  );
};
