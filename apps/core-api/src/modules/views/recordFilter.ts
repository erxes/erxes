import {
  type ConditionGroup,
  type ConditionRule,
  type FilterField,
  LEAD_SOURCES,
  RecordFilter,
  type ViewRecordType,
} from '@erxes/core-contract';
import {
  companies,
  companyTags,
  type ContentType,
  customerCompanies,
  customers,
  customerTags,
  type Db,
  fields,
  leadStages,
} from '@erxes/core-db';
import { and, asc, eq, inArray, not, or, type SQL, sql } from 'drizzle-orm';
import { valuesTable } from '~/modules/fields/fieldValues';
import type { Actor } from '~/http/auth';
import { HttpError } from '~/http/errors';

type FieldType = FilterField['type'];

/** A custom field, filtered through its typed value rows. */
interface CustomSpec {
  /** Whose values: the record's own, or (customers) the linked company's. */
  recordType: ContentType;
  fieldId: string;
  /** The value column. */
  storage: 'text' | 'number' | 'date' | 'bool';
}

/** One filterable thing: how it reads in SQL for the list's table. */
interface FieldSpec extends FilterField {
  /** The value as SQL (for `tags` and custom fields: unused; for `company.*`: a column of `core_companies`). */
  expr: SQL;
  custom?: CustomSpec;
  /** Only a day, no time (dates compare as dates so their indexes apply). */
  dateOnly?: boolean;
  /** Text with a trigram index: "is" is an ILIKE without wildcards so the index serves it. */
  trigram?: boolean;
  /** Birthday: "anniversary within" reads this stored month * 100 + day column. */
  monthDay?: SQL;
  /** Fields of the linked company: checked inside "has a company where …". */
  viaCompany?: boolean;
  /** The lead stage: rules name stages, the column holds their ids. */
  stageLookup?: boolean;
}

const invalid = (message: string) => new HttpError(400, 'INVALID_FILTER', message);

const STORAGE: Record<string, CustomSpec['storage']> = {
  number: 'number',
  date: 'date',
  boolean: 'bool',
};

const FILTER_TYPE: Record<string, FieldType> = {
  number: 'number',
  date: 'date',
  boolean: 'boolean',
  select: 'select',
  radio: 'select',
  multiselect: 'select',
  check: 'select',
};

/** Built-in fields, custom fields (`customFields.<id>`), the linked company's fields and activity. */
export const filterFields = async (
  client: Db,
  orgId: string,
  recordType: ViewRecordType,
): Promise<FieldSpec[]> => {
  const isCompany = recordType === 'company' || recordType === 'company_lead';
  const table = isCompany ? companies : customers;

  const f = (
    path: string,
    label: string,
    type: FieldType,
    expr: SQL,
    extra: Partial<FieldSpec> = {},
  ): FieldSpec => ({
    path: `subject.${path}`,
    label,
    type,
    expr,
    group: 'fields',
    ...extra,
  });

  const stageNames =
    recordType !== 'customer'
      ? (
          await client
            .select({ name: leadStages.name })
            .from(leadStages)
            .where(eq(leadStages.orgId, orgId))
            .orderBy(asc(leadStages.order))
        ).map((stage) => stage.name)
      : [];

  const builtIn: FieldSpec[] = isCompany
    ? [
        f('primaryName', 'Name', 'text', sql`${companies.primaryName}`, { trigram: true }),
        f('primaryEmail', 'Email', 'text', sql`${companies.primaryEmail}`),
        f('primaryPhone', 'Phone', 'text', sql`${companies.primaryPhone}`),
        f('website', 'Website', 'text', sql`${companies.website}`),
        f('industry', 'Industry', 'text', sql`${companies.industry}`),
        f('size', 'Employees', 'number', sql`${companies.size}`),
        f('businessType', 'Business type', 'text', sql`${companies.businessType}`),
        f('code', 'Code', 'text', sql`${companies.code}`),
      ]
    : [
        f('firstName', 'First name', 'text', sql`${customers.firstName}`, { trigram: true }),
        f('lastName', 'Last name', 'text', sql`${customers.lastName}`, { trigram: true }),
        f('primaryEmail', 'Email', 'text', sql`${customers.primaryEmail}`),
        f('primaryPhone', 'Phone', 'text', sql`${customers.primaryPhone}`, { trigram: true }),
        ...(recordType === 'customer'
          ? [
              f('state', 'State', 'select', sql`${customers.state}`, {
                options: ['lead', 'customer'],
              }),
            ]
          : []),
        f('birthDate', 'Birthday', 'date', sql`${customers.birthDate}`, {
          dateOnly: true,
          monthDay: sql`${customers.birthMonthDay}`,
        }),
        f('position', 'Position', 'text', sql`${customers.position}`),
        f('department', 'Department', 'text', sql`${customers.department}`),
        f('code', 'Code', 'text', sql`${customers.code}`),
      ];

  // People and companies share the lifecycle; the leads list has its stage fields, the companies list (leads and customers) all of them.
  const lifecycle: FieldSpec[] = [
    ...(recordType === 'company'
      ? [
          f('state', 'State', 'select', sql`${companies.state}`, {
            options: ['lead', 'customer'],
            group: 'lead',
          }),
        ]
      : []),
    f('source', 'Source', 'select', sql`${table.source}`, {
      options: [...LEAD_SOURCES],
      group: 'lead',
    }),
    f('convertedAt', 'Became a customer', 'date', sql`${table.convertedAt}`, { group: 'lead' }),
    ...(recordType !== 'customer'
      ? [
          f('leadStageId', 'Lead stage', 'select', sql`${table.leadStageId}`, {
            group: 'lead',
            stageLookup: true,
            options: stageNames,
          }),
          f('leadStageChangedAt', 'In this stage since', 'date', sql`${table.leadStageChangedAt}`, {
            group: 'lead',
          }),
          f('disqualifyReason', 'Disqualified because', 'text', sql`${table.disqualifyReason}`, {
            group: 'lead',
          }),
        ]
      : []),
  ];

  const common: FieldSpec[] = [
    f('ownerId', 'Owner', 'member', sql`${table.ownerId}`),
    f('tagIds', 'Tags', 'tags', sql`null`),
    f('createdAt', 'Created', 'date', sql`${table.createdAt}`),
    f('updatedAt', 'Updated', 'date', sql`${table.updatedAt}`),
    // Kept by the timeline itself (creation counts), so indexed.
    f('lastActivityAt', 'Last activity', 'date', sql`${table.lastActivityAt}`, {
      group: 'activity',
    }),
  ];

  const related: FieldSpec[] = isCompany
    ? [
        f(
          'customerCount',
          'Customers',
          'number',
          sql`(select count(*) from ${customerCompanies} where ${customerCompanies.orgId} = ${companies.orgId} and ${customerCompanies.companyId} = ${companies.id})`,
          { group: 'company' },
        ),
      ]
    : [
        f('company.primaryName', 'Company name', 'text', sql`${companies.primaryName}`, {
          group: 'company',
          viaCompany: true,
          trigram: true,
        }),
        f('company.industry', 'Company industry', 'text', sql`${companies.industry}`, {
          group: 'company',
          viaCompany: true,
        }),
        f('company.size', 'Company employees', 'number', sql`${companies.size}`, {
          group: 'company',
          viaCompany: true,
        }),
      ];

  // Customers also filter by their company's properties.
  const custom = await client
    .select({
      id: fields.id,
      contentType: fields.contentType,
      label: fields.label,
      type: fields.type,
      options: fields.options,
    })
    .from(fields)
    .where(and(eq(fields.orgId, orgId), isCompany ? eq(fields.contentType, 'company') : undefined))
    .orderBy(asc(fields.order));

  return [
    ...builtIn,
    ...lifecycle,
    ...common,
    ...related,
    ...custom.map((field): FieldSpec => {
      const ofCompany = field.contentType === 'company' && !isCompany;

      return {
        path: ofCompany
          ? `subject.company.customFields.${field.id}`
          : `subject.customFields.${field.id}`,
        label: ofCompany ? `Company ${field.label}` : field.label,
        group: ofCompany ? 'company' : 'custom',
        type: FILTER_TYPE[field.type] ?? 'text',
        options: field.options.length ? field.options : undefined,
        expr: sql`null`,
        dateOnly: field.type === 'date',
        viaCompany: ofCompany,
        custom: {
          recordType: field.contentType,
          fieldId: field.id,
          storage: STORAGE[field.type] ?? 'text',
        },
      };
    }),
  ];
};

// ─── Compiling ──────────────────────────────────────────────────────────────

/** A text array parameter (a JS array in a template becomes a list of parameters, not one array). */
const textArray = (values: string[]) =>
  sql`array[${sql.join(
    values.map((value) => sql`${value}`),
    sql`, `,
  )}]::text[]`;

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

const text = (value: unknown) => {
  if (typeof value !== 'string' && typeof value !== 'number')
    throw invalid('A text value is needed');

  return String(value);
};

const list = (value: unknown) => {
  if (!Array.isArray(value) || !value.length) throw invalid('Choose at least one value');

  return value.map(text);
};

const number = (value: unknown) => {
  const n = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(n)) throw invalid('A number is needed');

  return n;
};

const interval = (value: unknown): SQL => {
  const { amount, unit } = (value ?? {}) as { amount?: unknown; unit?: unknown };
  const n = number(amount);

  if (n < 0 || n > 3650) throw invalid('Between 0 and 3650');

  return unit === 'months'
    ? sql`make_interval(months => ${n}::int)`
    : unit === 'weeks'
      ? sql`make_interval(weeks => ${n}::int)`
      : sql`make_interval(days => ${n}::int)`;
};

/** Negative ops on a relation or a custom field: "none where …" rather than "one where not …". */
const NEGATIVE: Partial<Record<ConditionRule['op'], ConditionRule['op']>> = {
  neq: 'eq',
  not_contains: 'contains',
  not_in: 'in',
  not_exists: 'exists',
};

const COMPARE: Record<string, string> = {
  eq: '=',
  neq: '<>',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
};

/** Month * 100 + day, as the stored birthday and the value index compute it. */
const monthDayOf = (day: SQL) =>
  sql`((extract(month from ${day}) * 100 + extract(day from ${day}))::smallint)`;

/** "Within the next n days, any year", over a month-day expression; the window may run past 31 December. */
const anniversary = (monthDay: SQL, value: unknown) => {
  const days = number((value as { amount?: unknown } | undefined)?.amount);

  if (days < 0 || days > 366) throw invalid('Between 0 and 366 days');

  const from = monthDayOf(sql`current_date`);
  const to = monthDayOf(sql`(current_date + ${days}::int)`);

  return sql`(case when ${to} >= ${from} then ${monthDay} between ${from} and ${to} else (${monthDay} >= ${from} or ${monthDay} <= ${to}) end)`;
};

/** Date rules. Day-only values compare with days, so an index on them applies. */
const compileDate = (
  x: SQL,
  op: ConditionRule['op'],
  value: unknown,
  dateOnly: boolean,
  monthDay?: SQL,
): SQL | undefined => {
  const day = dateOnly ? x : sql`(${x})::date`;
  const today = dateOnly ? sql`current_date` : sql`now()`;

  const shift = (sign: '+' | '-') =>
    dateOnly
      ? sql`(current_date ${sql.raw(sign)} ${interval(value)})::date`
      : sql`now() ${sql.raw(sign)} ${interval(value)}`;

  switch (op) {
    case 'eq':
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
      return sql`${day} ${sql.raw(COMPARE[op]!)} ${text(value)}::date`;
    case 'neq':
      return sql`(${x} is null or ${day} <> ${text(value)}::date)`;
    case 'within_last':
      return sql`(${x} <= ${today} and ${x} >= ${shift('-')})`;
    case 'more_than_ago':
      return sql`${x} < ${shift('-')}`;
    case 'within_next':
      return sql`(${x} >= ${dateOnly ? sql`current_date` : sql`now()`} and ${x} <= ${shift('+')})`;
    case 'anniversary_within':
      return sql`(${x} is not null and ${anniversary(monthDay ?? monthDayOf(x), value)})`;
    default:
      return undefined;
  }
};

/** A built-in column (or a linked company's). */
const compileValue = (spec: FieldSpec, rule: ConditionRule, actor: Actor): SQL => {
  const x = spec.expr;
  const op = rule.op;

  if (op === 'exists')
    return spec.type === 'text' ? sql`coalesce(${x}, '') <> ''` : sql`${x} is not null`;

  if (op === 'not_exists') return not(compileValue(spec, { ...rule, op: 'exists' }, actor));

  if (spec.stageLookup && ['eq', 'neq', 'in', 'not_in'].includes(op)) {
    const names = (op === 'in' || op === 'not_in' ? list(rule.value) : [text(rule.value)]).map(
      (name) => name.toLowerCase(),
    );

    const ids = sql`(select ${leadStages.id} from ${leadStages} where ${leadStages.orgId} = ${actor.orgId} and lower(${leadStages.name}) = any(${textArray(names)}))`;

    return op === 'eq' || op === 'in'
      ? sql`${x} in ${ids}`
      : sql`(${x} is null or ${x} not in ${ids})`;
  }

  switch (spec.type) {
    case 'number': {
      if (op === 'neq') return sql`(${x} is null or ${x} <> ${number(rule.value)})`;

      if (COMPARE[op]) return sql`${x} ${sql.raw(COMPARE[op])} ${number(rule.value)}`;
      break;
    }

    case 'date': {
      const compiled = compileDate(x, op, rule.value, Boolean(spec.dateOnly), spec.monthDay);

      if (compiled) return compiled;
      break;
    }

    case 'member': {
      const id = (value: unknown) => (value === 'me' ? actor.userId : text(value));

      if (op === 'eq') return sql`${x} = ${id(rule.value)}`;

      if (op === 'neq') return sql`(${x} is null or ${x} <> ${id(rule.value)})`;

      if (op === 'in') return inArray(sql`${x}`, list(rule.value).map(id));

      if (op === 'not_in')
        return sql`(${x} is null or not ${inArray(sql`${x}`, list(rule.value).map(id))})`;
      break;
    }

    case 'select':
    case 'text': {
      // With a trigram index, "is" as a wildcard-free ILIKE uses it; otherwise lower() = lower().
      const is = (value: string) =>
        spec.trigram ? sql`${x} ilike ${escapeLike(value)}` : sql`lower(${x}) = lower(${value})`;

      switch (op) {
        case 'eq':
          return is(text(rule.value));
        case 'neq':
          return sql`(${x} is null or not ${is(text(rule.value))})`;
        case 'contains':
          return sql`${x} ilike ${`%${escapeLike(text(rule.value))}%`}`;
        case 'not_contains':
          return sql`(${x} is null or ${x} not ilike ${`%${escapeLike(text(rule.value))}%`})`;
        case 'starts_with':
          return sql`${x} ilike ${`${escapeLike(text(rule.value))}%`}`;
        case 'in':
          return sql`lower(${x}) = any(${textArray(list(rule.value).map((item) => item.toLowerCase()))})`;
        case 'not_in':
          return sql`(${x} is null or not (lower(${x}) = any(${textArray(list(rule.value).map((item) => item.toLowerCase()))})))`;
        default:
          break;
      }

      break;
    }

    default:
      break;
  }

  throw invalid(`“${spec.label}” can't use “${op}”`);
};

/**
 * A custom field: "has a value row where …" (an index lookup on the typed
 * column); negative rules are "has no value row where …", so a record without
 * a value counts as "is not X". Multi-choice fields match when any choice does.
 */
const compileCustom = (spec: FieldSpec, custom: CustomSpec, rule: ConditionRule): SQL => {
  const v = valuesTable(custom.recordType);
  const record = custom.recordType === 'company' ? companies : customers;

  const has = (condition?: SQL) =>
    sql`exists (select 1 from ${v} where ${v.orgId} = ${record.orgId} and ${v.recordId} = ${record.id} and ${v.fieldId} = ${custom.fieldId}${condition ? sql` and ${condition}` : sql``})`;

  const positive = NEGATIVE[rule.op];

  if (positive) return not(compileCustom(spec, custom, { ...rule, op: positive }));

  const op = rule.op;

  if (op === 'exists') return has();

  switch (custom.storage) {
    case 'bool': {
      const wanted = rule.value === true || rule.value === 'true';

      // No value reads as "no".
      if (op === 'eq') return wanted ? has(sql`${v.boolValue}`) : not(has(sql`${v.boolValue}`));
      break;
    }

    case 'number':
      if (COMPARE[op])
        return has(sql`${v.numberValue} ${sql.raw(COMPARE[op])} ${number(rule.value)}`);
      break;
    case 'date': {
      const compiled = compileDate(sql`${v.dateValue}`, op, rule.value, true);

      if (compiled) return has(compiled);
      break;
    }

    case 'text': {
      const x = v.textValue;

      switch (op) {
        case 'eq':
          return has(sql`lower(${x}) = lower(${text(rule.value)})`);
        // A choice field "contains" an option; a text or list field contains text.
        case 'contains':
          return spec.type === 'select'
            ? has(sql`lower(${x}) = lower(${text(rule.value)})`)
            : has(sql`${x} ilike ${`%${escapeLike(text(rule.value))}%`}`);
        case 'starts_with':
          return has(sql`${x} ilike ${`${escapeLike(text(rule.value))}%`}`);
        case 'in':
          return has(
            sql`lower(${x}) = any(${textArray(list(rule.value).map((item) => item.toLowerCase()))})`,
          );
        default:
          break;
      }

      break;
    }
  }

  throw invalid(`“${spec.label}” can't use “${op}”`);
};

const compileTags = (recordType: ViewRecordType, rule: ConditionRule): SQL => {
  const isCompany = recordType === 'company' || recordType === 'company_lead';
  const links = isCompany ? companyTags : customerTags;
  const record = isCompany ? companies.id : customers.id;

  const anyOf = (ids: string[]) =>
    sql`exists (select 1 from ${links} where ${links.recordId} = ${record} and ${inArray(links.tagId, ids)})`;

  const any = sql`exists (select 1 from ${links} where ${links.recordId} = ${record})`;

  switch (rule.op) {
    case 'contains':
    case 'eq':
      return anyOf([text(rule.value)]);
    case 'not_contains':
    case 'neq':
      return not(anyOf([text(rule.value)]));
    case 'in':
      return anyOf(list(rule.value));
    case 'not_in':
      return not(anyOf(list(rule.value)));
    case 'exists':
      return any;
    case 'not_exists':
      return not(any);
    default:
      throw invalid(`Tags can't use “${rule.op}”`);
  }
};

const compileField = (spec: FieldSpec, rule: ConditionRule, actor: Actor) =>
  spec.custom ? compileCustom(spec, spec.custom, rule) : compileValue(spec, rule, actor);

const compileRule = (
  rule: ConditionRule,
  specs: Map<string, FieldSpec>,
  recordType: ViewRecordType,
  actor: Actor,
): SQL => {
  const spec = specs.get(rule.path);

  if (!spec) throw invalid(`Unknown field: ${rule.path}`);

  if (spec.type === 'tags') return compileTags(recordType, rule);

  if (spec.viaCompany) {
    const positive = NEGATIVE[rule.op];
    const inner = compileField(spec, positive ? { ...rule, op: positive } : rule, actor);
    const linked = sql`exists (select 1 from ${customerCompanies} join ${companies} on ${companies.id} = ${customerCompanies.companyId} and ${companies.orgId} = ${customerCompanies.orgId} where ${customerCompanies.orgId} = ${customers.orgId} and ${customerCompanies.customerId} = ${customers.id} and ${inner})`;

    return positive ? not(linked) : linked;
  }

  return compileField(spec, rule, actor);
};

const compileGroup = (
  group: ConditionGroup,
  specs: Map<string, FieldSpec>,
  recordType: ViewRecordType,
  actor: Actor,
  depth: number,
): SQL | undefined => {
  if (depth > 3) throw invalid('At most three levels of groups');

  const parts = group.rules
    .map((rule) =>
      'match' in rule
        ? compileGroup(rule, specs, recordType, actor, depth + 1)
        : compileRule(rule, specs, recordType, actor),
    )
    .filter((part): part is SQL => Boolean(part));

  if (!parts.length) return undefined;

  return group.match === 'all' ? and(...parts) : or(...parts);
};

/** A list's `filter` (JSON of a condition group) → one SQL condition on its table; 400 `INVALID_FILTER` when it doesn't fit. */
export const compileRecordFilter = async (
  client: Db,
  actor: Actor,
  recordType: ViewRecordType,
  filter: string | ConditionGroup | null | undefined,
) => {
  if (!filter) return undefined;

  let group: ConditionGroup;

  try {
    group = RecordFilter.parse(typeof filter === 'string' ? JSON.parse(filter) : filter);
  } catch {
    throw invalid('The filter is not a valid condition group');
  }

  const specs = new Map(
    (await filterFields(client, actor.orgId, recordType)).map((spec) => [spec.path, spec]),
  );

  return compileGroup(group, specs, recordType, actor, 1);
};
