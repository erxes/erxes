import {
  type ConditionGroup,
  type ConditionRule,
  RecordFilter,
  type ViewRecordType,
} from '@erxes/core-contract';
import {
  callerUserId,
  companies,
  companyTags,
  customerCompanies,
  customers,
  customerTags,
  type Db,
  type FieldContentType,
  products,
} from '@erxes/core-db';
import {
  COMPARE,
  compileColumn,
  compileDate,
  compileGroup,
  escapeLike,
  type FilterContext,
  invalidFilter,
  list,
  lowerList,
  NEGATIVE,
  number,
  text,
} from '@erxes/plugin-sdk/filter';
import { inArray, not, type SQL, sql } from 'drizzle-orm';
import { valuesTable } from '~/modules/fields/fieldValues';
import type { CustomSpec, FieldSpec } from './fieldSpec';
import { filterFields, isCompanyList } from './filterFields';

const cannotUse = (spec: FieldSpec, op: ConditionRule['op']) =>
  invalidFilter(`“${spec.label}” can't use “${op}”`);

/** Rules name records (a lead stage, a category); the column holds their ids. */
const compileLookup = (x: SQL, rule: ConditionRule, lookup: (names: string[]) => SQL) => {
  const { op } = rule;
  const ids = lookup(op === 'in' || op === 'not_in' ? list(rule.value) : [text(rule.value)]);

  return op === 'eq' || op === 'in'
    ? sql`${x} = any(${ids})`
    : sql`(${x} is null or not (${x} = any(${ids})))`;
};

const LOOKUP_OPS: ConditionRule['op'][] = ['eq', 'neq', 'in', 'not_in'];

/** A built-in column (or a linked company's). */
const compileValue = (spec: FieldSpec, rule: ConditionRule, context: FilterContext) =>
  spec.lookup && LOOKUP_OPS.includes(rule.op)
    ? compileLookup(spec.expr, rule, spec.lookup)
    : compileColumn(spec, spec.path, rule, context);

/** A custom field's text values: a choice field "contains" an option; a text or list field contains text. */
const customText = (x: SQL, spec: FieldSpec, rule: ConditionRule) => {
  switch (rule.op) {
    case 'eq':
      return sql`lower(${x}) = lower(${text(rule.value)})`;

    case 'contains':
      return spec.type === 'select'
        ? sql`lower(${x}) = lower(${text(rule.value)})`
        : sql`${x} ilike ${`%${escapeLike(text(rule.value))}%`}`;

    case 'starts_with':
      return sql`${x} ilike ${`${escapeLike(text(rule.value))}%`}`;

    case 'in':
      return sql`lower(${x}) = any(${lowerList(rule.value)})`;

    default:
      return undefined;
  }
};

/**
 * A custom field: "has a value row where …" (an index lookup on the typed
 * column); negative rules are "has no value row where …", so a record without
 * a value counts as "is not X". Multi-choice fields match when any choice does.
 */
const RECORDS = { customer: customers, company: companies, product: products } satisfies Record<
  FieldContentType,
  unknown
>;

const compileCustom = (spec: FieldSpec, custom: CustomSpec, rule: ConditionRule): SQL => {
  const v = valuesTable(custom.recordType);
  const record = RECORDS[custom.recordType];

  const has = (condition?: SQL) =>
    sql`exists (select 1 from ${v} where ${v.recordId} = ${record.id} and ${v.fieldId} = ${custom.fieldId}${condition ? sql` and ${condition}` : sql``})`;

  const positive = NEGATIVE[rule.op];

  if (positive) return not(compileCustom(spec, custom, { ...rule, op: positive }));

  const { op } = rule;

  if (op === 'exists') return has();

  // No value reads as "no".
  if (custom.storage === 'bool' && op === 'eq') {
    const yes = has(sql`${v.boolValue}`);

    return rule.value === true || rule.value === 'true' ? yes : not(yes);
  }

  const compare = COMPARE[op];

  const condition =
    custom.storage === 'number'
      ? compare && sql`${v.numberValue} ${sql.raw(compare)} ${number(rule.value)}`
      : custom.storage === 'date'
        ? compileDate(sql`${v.dateValue}`, op, rule.value, true)
        : custom.storage === 'text'
          ? customText(sql`${v.textValue}`, spec, rule)
          : undefined;

  if (!condition) throw cannotUse(spec, op);

  return has(condition);
};

const compileTags = (recordType: ViewRecordType, rule: ConditionRule): SQL => {
  const isCompany = isCompanyList(recordType);
  const links = isCompany ? companyTags : customerTags;
  const record = isCompany ? companies.id : customers.id;

  const tagged = (ids: string[]) =>
    sql`exists (select 1 from ${links} where ${links.recordId} = ${record} and ${inArray(links.tagId, ids)})`;

  const any = sql`exists (select 1 from ${links} where ${links.recordId} = ${record})`;

  switch (rule.op) {
    case 'contains':
    case 'eq':
      return tagged([text(rule.value)]);

    case 'not_contains':
    case 'neq':
      return not(tagged([text(rule.value)]));

    case 'in':
      return tagged(list(rule.value));

    case 'not_in':
      return not(tagged(list(rule.value)));

    case 'exists':
      return any;

    case 'not_exists':
      return not(any);

    default:
      throw invalidFilter(`Tags can't use “${rule.op}”`);
  }
};

interface Compiling {
  specs: Map<string, FieldSpec>;
  recordType: ViewRecordType;
  context: FilterContext;
}

const compileField = (spec: FieldSpec, rule: ConditionRule, context: FilterContext) =>
  spec.custom ? compileCustom(spec, spec.custom, rule) : compileValue(spec, rule, context);

const compileRule = (rule: ConditionRule, { specs, recordType, context }: Compiling): SQL => {
  const spec = specs.get(rule.path);

  if (!spec) throw invalidFilter(`Unknown field: ${rule.path}`);

  if (spec.type === 'tags') return compileTags(recordType, rule);

  if (spec.viaCompany) {
    const positive = NEGATIVE[rule.op];
    const inner = compileField(spec, positive ? { ...rule, op: positive } : rule, context);
    const linked = sql`exists (select 1 from ${customerCompanies} join ${companies} on ${companies.id} = ${customerCompanies.companyId} and ${companies.orgId} = ${customerCompanies.orgId} where ${customerCompanies.orgId} = ${customers.orgId} and ${customerCompanies.customerId} = ${customers.id} and ${inner})`;

    return positive ? not(linked) : linked;
  }

  return compileField(spec, rule, context);
};

const parseFilter = (filter: string | ConditionGroup) => {
  try {
    return RecordFilter.parse(typeof filter === 'string' ? JSON.parse(filter) : filter);
  } catch {
    throw invalidFilter('The filter is not a valid condition group');
  }
};

/** A list's `filter` (JSON of a condition group) → one SQL condition on its table; 400 `INVALID_FILTER` when it doesn't fit. */
export const compileRecordFilter = async (
  client: Db,
  recordType: ViewRecordType,
  filter: string | ConditionGroup | null | undefined,
) => {
  if (!filter) return undefined;

  const group = parseFilter(filter);

  const specs = new Map((await filterFields(client, recordType)).map((spec) => [spec.path, spec]));
  const compiling = { specs, recordType, context: { me: callerUserId() } };

  return compileGroup(group, (rule) => compileRule(rule, compiling));
};
