import { SegmentOperator, normalizeSegmentOperator } from './operators';
import { SegmentFieldMeta, SegmentFieldNamespace } from './fieldMeta';
import {
  SEGMENT_MEMBERSHIP_FIELD,
  SegmentFieldNode,
  SegmentNode,
  SegmentValue,
} from './nodes';
import {
  anniversaryRanges,
  DEFAULT_SEGMENT_TIME_ZONE,
  shiftZonedDays,
  zonedDate,
  zonedDayStart,
} from './zonedTime';

export type SegmentMongoFilter = Record<string, unknown>;

export type SegmentCompileContext = {
  fields: SegmentFieldMeta[];
  namespaces?: SegmentFieldNamespace[];
  now?: Date;
  timeZone?: string;
};

export type SegmentCompileResult = {
  filter: SegmentMongoFilter;
  unsupported: string[];
};

const MINUTE_MS = 60_000;

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toArray = (value: SegmentValue): SegmentValue[] =>
  Array.isArray(value) ? value : [value];

const toNumber = (value: SegmentValue | undefined): number | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(String(value).replace(/,/g, ''));

  return Number.isNaN(parsed) ? undefined : parsed;
};

const toDate = (value: SegmentValue): Date | undefined => {
  const parsed = value instanceof Date ? value : new Date(String(value));

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const minuteBucket = (
  value: SegmentValue,
  now: Date,
  offset: 1 | -1,
): Record<string, Date> | undefined => {
  const amount = toNumber(value);

  if (amount === undefined) {
    return undefined;
  }

  const target =
    Math.floor((now.getTime() + offset * amount * MINUTE_MS) / MINUTE_MS) *
    MINUTE_MS;

  return { $gte: new Date(target), $lte: new Date(target + MINUTE_MS - 1) };
};

const dayBucket = (
  value: SegmentValue,
  now: Date,
  timeZone: string,
  offset: 1 | -1,
): Record<string, Date> | undefined => {
  const amount = toNumber(value);

  if (amount === undefined) {
    return undefined;
  }

  const day = shiftZonedDays(zonedDate(now, timeZone), offset * amount);

  return {
    $gte: zonedDayStart(day, timeZone),
    $lt: zonedDayStart(shiftZonedDays(day, 1), timeZone),
  };
};

const anniversaryOn = (
  path: string,
  value: SegmentValue | undefined,
  now: Date,
  timeZone: string,
  offset: 0 | 1 | -1,
): SegmentMongoFilter | undefined => {
  const amount = offset === 0 ? 0 : toNumber(value);

  if (amount === undefined) {
    return undefined;
  }

  const target = shiftZonedDays(zonedDate(now, timeZone), offset * amount);

  return {
    $or: anniversaryRanges(target, timeZone).map((range) => ({
      [path]: { $gte: range.gte, $lt: range.lt },
    })),
  };
};

const ANNIVERSARY_OFFSETS: Partial<Record<SegmentOperator, 0 | 1 | -1>> = {
  [SegmentOperator.AnniversaryToday]: 0,
  [SegmentOperator.AnniversaryFromNow]: 1,
  [SegmentOperator.AnniversaryAgo]: -1,
};

const compareOn = (
  operator: SegmentOperator,
  value: SegmentValue | undefined,
  now: Date,
  timeZone: string,
): Record<string, unknown> | undefined => {
  switch (operator) {
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
      return minuteBucket(value, now, 1);
    case SegmentOperator.MinutesAgo:
      return minuteBucket(value, now, -1);
    case SegmentOperator.DaysFromNow:
      return dayBucket(value, now, timeZone, 1);
    case SegmentOperator.DaysAgo:
      return dayBucket(value, now, timeZone, -1);

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
  const timeZone = context.timeZone || DEFAULT_SEGMENT_TIME_ZONE;
  const anniversary = ANNIVERSARY_OFFSETS[operator];

  const declared = context.fields.find((field) => field.key === node.fieldKey);

  if (declared) {
    if (declared.kind !== 'projected') {
      return undefined;
    }

    if (anniversary !== undefined) {
      return anniversaryOn(
        declared.path,
        node.value,
        now,
        timeZone,
        anniversary,
      );
    }

    const comparison = compareOn(operator, node.value, now, timeZone);

    return comparison ? { [declared.path]: comparison } : undefined;
  }

  const [prefix, ...rest] = node.fieldKey.split('.');
  const namespace = (context.namespaces || []).find(
    (candidate) => candidate.prefix === prefix,
  );

  if (!namespace || !rest.length) {
    return undefined;
  }

  // The values are one object keyed by field id, so a namespaced field is the
  // dotted path it reads as - the same shape any stored field compiles to.
  const path = `${namespace.path}.${rest.join('.')}`;

  if (anniversary !== undefined) {
    const branches = anniversaryOn(
      path,
      node.value,
      now,
      timeZone,
      anniversary,
    );

    return branches ? branches : undefined;
  }

  const comparison = compareOn(operator, node.value, now, timeZone);

  return comparison ? { [path]: comparison } : undefined;
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

  if (node.kind === 'segment') {
    return {
      [SEGMENT_MEMBERSHIP_FIELD]: node.exclude
        ? { $ne: node.segmentId }
        : node.segmentId,
    };
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
