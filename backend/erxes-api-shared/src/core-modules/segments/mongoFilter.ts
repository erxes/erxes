import {
  normalizeSegmentOperator,
  SegmentFieldMeta,
  SegmentFieldNamespace,
  SegmentOperator,
} from './fieldMeta';
import { SegmentFieldNode, SegmentNode, SegmentValue } from './nodes';

/**
 * Compiles a segment tree into a MongoDB filter.
 *
 * This is how a segment turns into a list: the owning plugin runs the filter
 * against its own collection. It has to agree with `decideSegmentNode` on every
 * operator - the same segment must give the same answer whether it is queried
 * or evaluated - so the two are checked against each other in the tests.
 */

export type SegmentMongoFilter = Record<string, unknown>;

export type SegmentCompileContext = {
  fields: SegmentFieldMeta[];
  namespaces?: SegmentFieldNamespace[];
  /** Evaluation instant for the relative-time operators. */
  now?: Date;
};

export type SegmentCompileResult = {
  filter: SegmentMongoFilter;
  /**
   * Nodes this filter could not express: derived values, fields owned by
   * another content type, relations. A caller that cannot resolve them another
   * way must treat the segment as undecidable rather than run a filter that
   * silently ignores part of the definition.
   */
  unsupported: string[];
};

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toArray = (value: SegmentValue): SegmentValue[] =>
  Array.isArray(value) ? value : [value];

const toNumber = (value: SegmentValue): number | undefined => {
  const parsed = Number(String(value).replace(/,/g, ''));

  return Number.isNaN(parsed) ? undefined : parsed;
};

const toDate = (value: SegmentValue): Date | undefined => {
  const parsed = value instanceof Date ? value : new Date(String(value));

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

/** `wob*`/`woa*` match one whole bucket, so they compile to a closed range. */
const bucketRange = (
  value: SegmentValue,
  now: Date,
  bucketMs: number,
  offset: 1 | -1,
): Record<string, Date> | undefined => {
  const amount = toNumber(value);

  if (amount === undefined) {
    return undefined;
  }

  const target =
    Math.floor((now.getTime() + offset * amount * bucketMs) / bucketMs) *
    bucketMs;

  return { $gte: new Date(target), $lte: new Date(target + bucketMs - 1) };
};

/**
 * The condition on one path. Returns `undefined` when the operator cannot be
 * expressed, so the caller can record it as unsupported.
 */
const compareOn = (
  operator: SegmentOperator,
  value: SegmentValue | undefined,
  now: Date,
): Record<string, unknown> | undefined => {
  switch (operator) {
    // Matching `isPresent`: null and an empty array are unset, "" is not.
    case SegmentOperator.IsSet:
      return { $nin: [null, []], $exists: true };
    case SegmentOperator.IsNotSet:
      return { $in: [null, []] };
    case SegmentOperator.IsTrue:
      return { $in: [true, 'true'] };
    case SegmentOperator.IsFalse:
      return { $in: [false, 'false'] };
    default:
      break;
  }

  if (value === undefined) {
    return undefined;
  }

  switch (operator) {
    // Mongo matches an array element with a plain equality, which is the same
    // "contains" the evaluator applies to a list value.
    case SegmentOperator.Equals:
      return { $eq: value };
    case SegmentOperator.NotEquals:
      return { $ne: value };
    case SegmentOperator.Contains:
      return { $regex: escapeRegex(String(value)), $options: 'i' };
    case SegmentOperator.NotContains:
      return {
        $not: new RegExp(escapeRegex(String(value)), 'i'),
      };

    // An empty list matches nothing, which is what a resolved condition with no
    // hits means - dropping it instead would widen the query.
    case SegmentOperator.In:
      return { $in: toArray(value) };
    case SegmentOperator.NotIn:
      return { $nin: toArray(value) };

    case SegmentOperator.NumberGt: {
      const parsed = toNumber(value);
      return parsed === undefined ? undefined : { $gte: parsed };
    }
    case SegmentOperator.NumberLt: {
      const parsed = toNumber(value);
      return parsed === undefined ? undefined : { $lte: parsed };
    }
    case SegmentOperator.DateGte: {
      const parsed = toDate(value);
      return parsed === undefined ? undefined : { $gte: parsed };
    }
    case SegmentOperator.DateLte: {
      const parsed = toDate(value);
      return parsed === undefined ? undefined : { $lte: parsed };
    }

    case SegmentOperator.MinutesFromNow:
      return bucketRange(value, now, MINUTE_MS, 1);
    case SegmentOperator.MinutesAgo:
      return bucketRange(value, now, MINUTE_MS, -1);
    case SegmentOperator.DaysFromNow:
      return bucketRange(value, now, DAY_MS, 1);
    case SegmentOperator.DaysAgo:
      return bucketRange(value, now, DAY_MS, -1);

    default:
      return undefined;
  }
};

const compileField = (
  node: SegmentFieldNode,
  context: SegmentCompileContext,
  now: Date,
): SegmentMongoFilter | undefined => {
  const operator = normalizeSegmentOperator(node.operator);

  const declared = context.fields.find((field) => field.key === node.fieldKey);

  if (declared) {
    if (declared.kind !== 'projected') {
      return undefined;
    }

    const comparison = compareOn(operator, node.value, now);

    return comparison ? { [declared.path]: comparison } : undefined;
  }

  const [prefix, ...rest] = node.fieldKey.split('.');
  const namespace = (context.namespaces || []).find(
    (candidate) => candidate.prefix === prefix,
  );

  if (!namespace || !rest.length) {
    return undefined;
  }

  const comparison = compareOn(operator, node.value, now);

  if (!comparison) {
    return undefined;
  }

  // One entry has to satisfy both the key and the comparison, so the two live
  // in a single `$elemMatch` rather than as two independent array conditions.
  return {
    [namespace.path]: {
      $elemMatch: {
        [namespace.keyPath]: rest.join('.'),
        [namespace.valuePath]: comparison,
      },
    },
  };
};

const compileNode = (
  node: SegmentNode,
  context: SegmentCompileContext,
  now: Date,
  unsupported: string[],
): SegmentMongoFilter | undefined => {
  if (node.kind === 'field') {
    const compiled = compileField(node, context, now);

    if (!compiled) {
      unsupported.push(`${node.contentType}.${node.fieldKey}`);
    }

    return compiled;
  }

  if (node.kind === 'relation') {
    unsupported.push(node.relationKey);
    return undefined;
  }

  const children = node.children
    .map((child) => compileNode(child, context, now, unsupported))
    .filter((child): child is SegmentMongoFilter => Boolean(child));

  if (!children.length) {
    return undefined;
  }

  if (children.length === 1) {
    return children[0];
  }

  return node.conjunction === 'or' ? { $or: children } : { $and: children };
};

export const compileSegmentMongoFilter = (
  node: SegmentNode,
  context: SegmentCompileContext,
): SegmentCompileResult => {
  const unsupported: string[] = [];
  const filter = compileNode(
    node,
    context,
    context.now || new Date(),
    unsupported,
  );

  return { filter: filter || {}, unsupported };
};
