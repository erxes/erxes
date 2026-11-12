import { type ConditionGroup, type ConditionRule, type FilterField, RecordFilter, type ViewRecordType } from '@erxes/core-contract';
import { activities, companies, companyTags, customerCompanies, customers, customerTags, type Db, fields } from '@erxes/core-db';
import { and, eq, inArray, not, or, type SQL, sql } from 'drizzle-orm';
import type { Actor } from '~/http/auth';
import { HttpError } from '~/http/errors';

type FieldType = FilterField['type'];

/** One filterable thing: how it reads in SQL for the list's table. */
interface FieldSpec extends FilterField {
  /** The value as SQL (for `tags`: unused; for `company.*`: a column of `core_companies`). */
  expr: SQL;
  /** Custom multi-select / checkbox values are JSON arrays. */
  array?: boolean;
  /** Fields of the linked company: checked inside "has a company where …". */
  viaCompany?: boolean;
}

const invalid = (message: string) => new HttpError(400, 'INVALID_FILTER', message);

/** Built-in fields, custom fields (`customFields.<id>`), the linked company's fields and activity. */
export const filterFields = async (client: Db, orgId: string, recordType: ViewRecordType): Promise<FieldSpec[]> => {
  const isCompany = recordType === 'company';
  const table = isCompany ? companies : customers;
  const f = (path: string, label: string, type: FieldType, expr: SQL, extra: Partial<FieldSpec> = {}): FieldSpec => ({
    path: `subject.${path}`,
    label,
    type,
    expr,
    group: 'fields',
    ...extra,
  });
  const builtIn: FieldSpec[] = isCompany
    ? [
        f('primaryName', 'Name', 'text', sql`${companies.primaryName}`),
        f('primaryEmail', 'Email', 'text', sql`${companies.primaryEmail}`),
        f('primaryPhone', 'Phone', 'text', sql`${companies.primaryPhone}`),
        f('website', 'Website', 'text', sql`${companies.website}`),
        f('industry', 'Industry', 'text', sql`${companies.industry}`),
        f('size', 'Employees', 'number', sql`${companies.size}`),
        f('businessType', 'Business type', 'text', sql`${companies.businessType}`),
        f('code', 'Code', 'text', sql`${companies.code}`),
      ]
    : [
        f('firstName', 'First name', 'text', sql`${customers.firstName}`),
        f('lastName', 'Last name', 'text', sql`${customers.lastName}`),
        f('primaryEmail', 'Email', 'text', sql`${customers.primaryEmail}`),
        f('primaryPhone', 'Phone', 'text', sql`${customers.primaryPhone}`),
        ...(recordType === 'customer' ? [f('state', 'State', 'select', sql`${customers.state}`, { options: ['lead', 'customer'] })] : []),
        f('birthDate', 'Birthday', 'date', sql`${customers.birthDate}`),
        f('position', 'Position', 'text', sql`${customers.position}`),
        f('department', 'Department', 'text', sql`${customers.department}`),
        f('code', 'Code', 'text', sql`${customers.code}`),
      ];
  const common: FieldSpec[] = [
    f('ownerId', 'Owner', 'member', sql`${table.ownerId}`),
    f('tagIds', 'Tags', 'tags', sql`null`),
    f('createdAt', 'Created', 'date', sql`${table.createdAt}`),
    f('updatedAt', 'Updated', 'date', sql`${table.updatedAt}`),
    f(
      'lastActivityAt',
      'Last activity',
      'date',
      sql`(select max(${activities.createdAt}) from ${activities} where ${activities.orgId} = ${table.orgId} and ${activities.targetType} = ${isCompany ? 'company' : 'customer'} and ${activities.targetId} = ${table.id})`,
      { group: 'activity' },
    ),
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
        f('company.primaryName', 'Company name', 'text', sql`${companies.primaryName}`, { group: 'company', viaCompany: true }),
        f('company.industry', 'Company industry', 'text', sql`${companies.industry}`, { group: 'company', viaCompany: true }),
        f('company.size', 'Company employees', 'number', sql`${companies.size}`, { group: 'company', viaCompany: true }),
      ];
  const custom = await client
    .select({ id: fields.id, label: fields.label, type: fields.type, options: fields.options })
    .from(fields)
    .where(and(eq(fields.orgId, orgId), eq(fields.contentType, isCompany ? 'company' : 'customer')));

  return [
    ...builtIn,
    ...common,
    ...related,
    ...custom.map((field): FieldSpec => {
      const key = sql.raw(`'${field.id.replace(/'/g, "''")}'`);
      const raw = sql`(${table.customFields} ->> ${key})`;
      const options = Array.isArray(field.options)
        ? (field.options as unknown[]).map((option) =>
            typeof option === 'object' && option ? String((option as { value?: unknown; label?: unknown }).value ?? (option as { label?: unknown }).label) : String(option),
          )
        : undefined;
      const spec = { path: `subject.customFields.${field.id}`, label: field.label, group: 'custom' as const, options };

      switch (field.type) {
        case 'number':
          return { ...spec, type: 'number', expr: sql`(case when jsonb_typeof(${table.customFields} -> ${key}) = 'number' then ${raw}::numeric end)` };
        case 'date':
          return { ...spec, type: 'date', expr: sql`(case when ${raw} ~ '^\\d{4}-\\d{2}-\\d{2}' then ${raw}::date end)` };
        case 'boolean':
          return { ...spec, type: 'boolean', expr: sql`(${table.customFields} -> ${key})` };
        case 'multiselect':
        case 'check':
        case 'list':
          return { ...spec, type: 'select', expr: sql`(${table.customFields} -> ${key})`, array: true };
        case 'select':
        case 'radio':
          return { ...spec, type: 'select', expr: raw };
        default:
          return { ...spec, type: 'text', expr: raw };
      }
    }),
  ];
};

// ─── Compiling ──────────────────────────────────────────────────────────────

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

const text = (value: unknown) => {
  if (typeof value !== 'string' && typeof value !== 'number') throw invalid('A text value is needed');

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

  return unit === 'months' ? sql`make_interval(months => ${n}::int)` : unit === 'weeks' ? sql`make_interval(weeks => ${n}::int)` : sql`make_interval(days => ${n}::int)`;
};

/** NEGATED ops on relations: "no linked company where …" rather than "a company where not …". */
const NEGATIVE: Partial<Record<ConditionRule['op'], ConditionRule['op']>> = {
  neq: 'eq',
  not_contains: 'contains',
  not_in: 'in',
  not_exists: 'exists',
};

const compileValue = (spec: FieldSpec, rule: ConditionRule, actor: Actor): SQL => {
  const x = spec.expr;
  const op = rule.op;

  if (op === 'exists') {
    return spec.array ? sql`coalesce(jsonb_array_length(case when jsonb_typeof(${x}) = 'array' then ${x} end), 0) > 0` : spec.type === 'text' ? sql`coalesce(${x}, '') <> ''` : sql`${x} is not null`;
  }
  if (op === 'not_exists') return not(compileValue(spec, { ...rule, op: 'exists' }, actor));

  switch (spec.type) {
    case 'boolean': {
      const wanted = rule.value === true || rule.value === 'true';

      if (op === 'eq') return sql`coalesce(${x}, 'false'::jsonb) = ${wanted ? sql`'true'::jsonb` : sql`'false'::jsonb`}`;
      if (op === 'neq') return sql`coalesce(${x}, 'false'::jsonb) <> ${wanted ? sql`'true'::jsonb` : sql`'false'::jsonb`}`;
      break;
    }
    case 'number': {
      const ops: Record<string, string> = { eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=' };

      if (ops[op]) return op === 'neq' ? sql`(${x} is null or ${x} <> ${number(rule.value)})` : sql`${x} ${sql.raw(ops[op]!)} ${number(rule.value)}`;
      break;
    }
    case 'date': {
      const day = sql`(${x})::date`;

      switch (op) {
        case 'eq':
          return sql`${day} = ${text(rule.value)}::date`;
        case 'neq':
          return sql`(${x} is null or ${day} <> ${text(rule.value)}::date)`;
        case 'gt':
          return sql`${day} > ${text(rule.value)}::date`;
        case 'gte':
          return sql`${day} >= ${text(rule.value)}::date`;
        case 'lt':
          return sql`${day} < ${text(rule.value)}::date`;
        case 'lte':
          return sql`${day} <= ${text(rule.value)}::date`;
        case 'within_last':
          return sql`(${x} <= now() and ${x} >= now() - ${interval(rule.value)})`;
        case 'more_than_ago':
          return sql`${x} < now() - ${interval(rule.value)}`;
        case 'within_next':
          return sql`(${x} >= current_date and ${x} <= now() + ${interval(rule.value)})`;
        case 'anniversary_within': {
          // By day and month, whatever the year; the window may run past 31 December.
          const days = number((rule.value as { amount?: unknown } | undefined)?.amount);
          const md = sql`to_char(${x}, 'MMDD')`;
          const from = sql`to_char(current_date, 'MMDD')`;
          const to = sql`to_char(current_date + ${days}::int, 'MMDD')`;

          return sql`(${x} is not null and case when ${to} >= ${from} then ${md} between ${from} and ${to} else (${md} >= ${from} or ${md} <= ${to}) end)`;
        }
        default:
          break;
      }
      break;
    }
    case 'member': {
      const id = (value: unknown) => (value === 'me' ? actor.userId : text(value));

      if (op === 'eq') return sql`${x} = ${id(rule.value)}`;
      if (op === 'neq') return sql`(${x} is null or ${x} <> ${id(rule.value)})`;
      if (op === 'in') return inArray(sql`${x}`, list(rule.value).map(id));
      if (op === 'not_in') return sql`(${x} is null or not ${inArray(sql`${x}`, list(rule.value).map(id))})`;
      break;
    }
    case 'select':
    case 'text': {
      if (spec.array) {
        if (op === 'eq' || op === 'contains') return sql`coalesce(${x}, '[]'::jsonb) ? ${text(rule.value)}`;
        if (op === 'neq' || op === 'not_contains') return sql`not (coalesce(${x}, '[]'::jsonb) ? ${text(rule.value)})`;
        if (op === 'in') return sql`coalesce(${x}, '[]'::jsonb) ?| ${list(rule.value)}::text[]`;
        if (op === 'not_in') return sql`not (coalesce(${x}, '[]'::jsonb) ?| ${list(rule.value)}::text[])`;
        break;
      }

      switch (op) {
        case 'eq':
          return sql`lower(${x}) = lower(${text(rule.value)})`;
        case 'neq':
          return sql`(${x} is null or lower(${x}) <> lower(${text(rule.value)}))`;
        case 'contains':
          return sql`${x} ilike ${`%${escapeLike(text(rule.value))}%`}`;
        case 'not_contains':
          return sql`(${x} is null or ${x} not ilike ${`%${escapeLike(text(rule.value))}%`})`;
        case 'starts_with':
          return sql`${x} ilike ${`${escapeLike(text(rule.value))}%`}`;
        case 'in':
          return sql`lower(${x}) = any(${list(rule.value).map((item) => item.toLowerCase())}::text[])`;
        case 'not_in':
          return sql`(${x} is null or not (lower(${x}) = any(${list(rule.value).map((item) => item.toLowerCase())}::text[])))`;
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

const compileTags = (recordType: ViewRecordType, rule: ConditionRule): SQL => {
  const isCompany = recordType === 'company';
  const links = isCompany ? companyTags : customerTags;
  const record = isCompany ? companies.id : customers.id;
  const anyOf = (ids: string[]) => sql`exists (select 1 from ${links} where ${links.recordId} = ${record} and ${inArray(links.tagId, ids)})`;
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

const compileRule = (rule: ConditionRule, specs: Map<string, FieldSpec>, recordType: ViewRecordType, actor: Actor): SQL => {
  const spec = specs.get(rule.path);

  if (!spec) throw invalid(`Unknown field: ${rule.path}`);
  if (spec.type === 'tags') return compileTags(recordType, rule);

  if (spec.viaCompany) {
    const positive = NEGATIVE[rule.op];
    const inner = compileValue(spec, positive ? { ...rule, op: positive } : rule, actor);
    const linked = sql`exists (select 1 from ${customerCompanies} join ${companies} on ${companies.id} = ${customerCompanies.companyId} and ${companies.orgId} = ${customerCompanies.orgId} where ${customerCompanies.orgId} = ${customers.orgId} and ${customerCompanies.customerId} = ${customers.id} and ${inner})`;

    return positive ? not(linked) : linked;
  }

  return compileValue(spec, rule, actor);
};

const compileGroup = (group: ConditionGroup, specs: Map<string, FieldSpec>, recordType: ViewRecordType, actor: Actor, depth: number): SQL | undefined => {
  if (depth > 3) throw invalid('At most three levels of groups');

  const parts = group.rules
    .map((rule) => ('match' in rule ? compileGroup(rule, specs, recordType, actor, depth + 1) : compileRule(rule, specs, recordType, actor)))
    .filter((part): part is SQL => Boolean(part));

  if (!parts.length) return undefined;

  return group.match === 'all' ? and(...parts) : or(...parts);
};

/** A list's `filter` (JSON of a condition group) → one SQL condition on its table; 400 `INVALID_FILTER` when it doesn't fit. */
export const compileRecordFilter = async (client: Db, actor: Actor, recordType: ViewRecordType, filter: string | ConditionGroup | null | undefined) => {
  if (!filter) return undefined;

  let group: ConditionGroup;

  try {
    group = RecordFilter.parse(typeof filter === 'string' ? JSON.parse(filter) : filter);
  } catch {
    throw invalid('The filter is not a valid condition group');
  }

  const specs = new Map((await filterFields(client, actor.orgId, recordType)).map((spec) => [spec.path, spec]));

  return compileGroup(group, specs, recordType, actor, 1);
};
