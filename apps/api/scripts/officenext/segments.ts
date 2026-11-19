/**
 * `segments` → `core_views`: a named customer, lead or company segment becomes a shared saved
 * view whose filter is core's condition language, when every rule (sub-segments included) is a
 * plain property filter core can run. Rules on relative dates, events or fields core lacks keep
 * the segment out, with the reason. Unnamed segments were parts of other segments. Old segments
 * belonged to everyone, so each view is shared, made by the organisation's owner when its maker
 * isn't known.
 */
import { z } from 'zod';
import { pluginOf } from './conformities';
import { resolve } from './idMap';
import { idSet, insert, MINE, readAll, type Run, unit } from './run';
import { createdOf, field, optionalId, readOr, record, text, when } from './values';

const Condition = z.object({
  type: text,
  subSegmentId: optionalId,
  propertyName: text,
  propertyOperator: text,
  propertyValue: z.unknown().optional(),
});

const Segment = record({
  name: text,
  contentType: text,
  conditionsConjunction: text,
  conditions: field((value) =>
    Array.isArray(value) ? value.flatMap((item) => readOr(Condition, item) ?? []) : [],
  ),
  createdBy: optionalId,
  createdAt: when,
  updatedAt: when,
});

type Segment = NonNullable<ReturnType<typeof Segment.parse>>;

/** Old segment record types → core's view record types. */
const RECORD_TYPES: Record<string, string> = {
  'core:customer': 'customer',
  'core:contact.customer': 'customer',
  'core:contacts.customers': 'customer',
  'core:lead': 'lead',
  'core:contact.lead': 'lead',
  'core:contacts.leads': 'lead',
  'core:company': 'company',
  'core:contacts.companies': 'company',
  'core:product': 'product',
  'core:product.product': 'product',
  'products:product': 'product',
};

/** Old operators → core's, and whether the rule carries a value. */
const OPERATORS: Record<string, { op: string; value: boolean }> = {
  e: { op: 'eq', value: true },
  numbere: { op: 'eq', value: true },
  dne: { op: 'neq', value: true },
  numberdne: { op: 'neq', value: true },
  c: { op: 'contains', value: true },
  dnc: { op: 'not_contains', value: true },
  numberigt: { op: 'gt', value: true },
  numberilt: { op: 'lt', value: true },
  dateigt: { op: 'gt', value: true },
  dateilt: { op: 'lt', value: true },
  is: { op: 'exists', value: false },
  dateis: { op: 'exists', value: false },
  ins: { op: 'not_exists', value: false },
  dateins: { op: 'not_exists', value: false },
};

/** Old property names → core's filter paths, per record type. */
const BUILT_IN: Record<string, Record<string, string>> = {
  customer: {
    firstName: 'firstName',
    lastName: 'lastName',
    primaryEmail: 'primaryEmail',
    primaryPhone: 'primaryPhone',
    position: 'position',
    department: 'department',
    code: 'code',
    birthDate: 'birthDate',
    ownerId: 'ownerId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    lastSeenAt: 'lastActivityAt',
  },
  company: {
    primaryName: 'primaryName',
    primaryEmail: 'primaryEmail',
    primaryPhone: 'primaryPhone',
    website: 'website',
    industry: 'industry',
    size: 'size',
    businessType: 'businessType',
    code: 'code',
    ownerId: 'ownerId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
};

/** The core path of an old property, or null. Custom and tracked fields keep their field ids. */
export const pathOf = (recordType: string, property: string | null) => {
  if (!property) return null;

  const fieldsOf = recordType === 'lead' ? 'customer' : recordType;
  const contentType = fieldsOf === 'company' ? 'company' : 'customer';

  if (property.startsWith('customFieldsData.'))
    return `subject.customFields.${resolve('field', property.slice('customFieldsData.'.length))}`;

  if (property.startsWith('trackedData.')) {
    const name = property.slice('trackedData.'.length).replaceAll(/[^A-Za-z0-9]/g, '_');

    return `subject.customFields.tracked_${contentType}_${name}`;
  }

  const builtIn = BUILT_IN[fieldsOf]?.[property];

  return builtIn ? `subject.${builtIn}` : null;
};

type Group = {
  match: 'all' | 'any';
  rules: (Group | { path: string; op: string; value?: unknown })[];
};

/** The segment's filter, or why core can't run it. */
export const filterOf = (
  segment: Segment,
  recordType: string,
  byId: Map<string, Segment>,
  trail: Set<string> = new Set(),
): Group | { reason: string } => {
  const rules: Group['rules'] = [];

  for (const condition of segment.conditions) {
    if (condition.type === 'subSegment') {
      const sub = condition.subSegmentId && byId.get(condition.subSegmentId);

      if (!sub || trail.has(sub.id)) return { reason: 'a sub-segment is missing or loops' };

      const nested = filterOf(sub, recordType, byId, new Set([...trail, segment.id]));

      if ('reason' in nested) return nested;

      rules.push(nested);
      continue;
    }

    const operator = OPERATORS[condition.propertyOperator ?? ''];
    const path = pathOf(recordType, condition.propertyName);

    if (condition.type !== 'property')
      return { reason: `${condition.type ?? 'unknown'} rules (events, dates) core can't run` };

    if (!operator)
      return {
        reason: `operator ${condition.propertyOperator ?? '?'} (relative dates) has no core match`,
      };

    if (!path) return { reason: `property ${condition.propertyName ?? '?'} has no core filter` };

    rules.push(
      operator.value
        ? { path, op: operator.op, value: condition.propertyValue ?? null }
        : { path, op: operator.op },
    );
  }

  return rules.length
    ? { match: segment.conditionsConjunction === 'or' ? 'any' : 'all', rules }
    : { reason: 'no rules' };
};

/** Named core segments as shared views. */
export const importSegments = async (run: Run) => {
  const segments = (await readAll(run, 'segments')).flatMap((raw) => readOr(Segment, raw) ?? []);
  const byId = new Map(segments.map((segment) => [segment.id, segment]));

  const { rows: owners } = await run.pg.query<{ id: string }>(
    `SELECT id FROM core_users WHERE role = 'owner' AND ${MINE} ORDER BY created_at LIMIT 1`,
  );

  const owner = owners[0]?.id;
  const members = await idSet(run, 'core_users');

  run.report.of('segments', 'core_views');
  run.report.seen('segments', segments.length);

  const views = segments.flatMap((segment) => {
    const recordType = RECORD_TYPES[segment.contentType ?? ''];

    if (!segment.name) {
      run.report.note('segments', 'part of another segment (no name of its own)', segment.id);

      return [];
    }

    if (!recordType) {
      run.report.skip(
        'segments',
        pluginOf(segment.contentType)
          ? `plugin:${pluginOf(segment.contentType)} (segment of ${segment.contentType})`
          : `segment of ${segment.contentType ?? '?'}: core has no view of these records`,
        segment.id,
      );

      return [];
    }

    const filter = filterOf(segment, recordType, byId);

    if ('reason' in filter) {
      run.report.skip('segments', filter.reason, segment.id);

      return [];
    }

    const createdAt = createdOf(segment.id, segment.createdAt, segment.updatedAt);
    const maker = segment.createdBy && resolve('user', segment.createdBy);
    const by = maker && members.has(maker) ? maker : owner;

    return [
      [
        segment.id,
        recordType,
        segment.name,
        JSON.stringify(filter),
        true,
        by,
        createdAt,
        segment.updatedAt ?? createdAt,
      ],
    ];
  });

  await unit(run, () =>
    insert(run, {
      collection: 'segments',
      table: 'core_views',
      columns: [
        'id',
        'record_type',
        'name',
        'filter',
        'shared',
        'created_by',
        'created_at',
        'updated_at',
      ],
      rows: views,
      keys: views.map((row) => String(row[0])),
    }),
  );
};
