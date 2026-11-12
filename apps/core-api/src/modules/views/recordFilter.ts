import {
  type ConditionGroup,
  type ConditionRule,
  RecordFilter,
  type ViewRecordType,
} from '@erxes/core-contract';
import {
  companies,
  companyTags,
  customerCompanies,
  customers,
  customerTags,
  type Db,
  leadStages,
} from '@erxes/core-db';
import { and, inArray, not, or, type SQL, sql } from 'drizzle-orm';
import { valuesTable } from '~/modules/fields/fieldValues';
import type { Actor } from '~/http/auth';
import { type CustomSpec, type FieldSpec, filterFields, isCompanyList } from './filterFields';
import {
  COMPARE,
  compileDate,
  escapeLike,
  invalid,
  list,
  NEGATIVE,
  number,
  text,
  textArray,
} from './filterValues';

const cannotUse = (spec: FieldSpec, op: ConditionRule['op']) =>
  invalid(`“${spec.label}” can't use “${op}”`);

/** The lead stage: rules name stages, the column holds their ids. */
const compileStage = (x: SQL, rule: ConditionRule, actor: Actor) => {
  const { op } = rule;

  const names =(op === 'in' || op === 'not_in' ? list(rule.value) : [text(rule.value)]).map(
    (name) => name.toLowerCase(),
  );

  const ids = sql`(select ${leadStages.id} from ${leadStages} where ${leadStages.orgId} = ${actor.orgId} and lower(${leadStages.name}) = any(${textArray(names)}))`;

  return op === 'eq' || op === 'in' ? sql`${x} in ${ids}` : sql`(${x} is null or ${x} not in ${ids})`;
};

const compileMember = (x: SQL, rule: ConditionRule, actor: Actor) => {
  const id = (value: unknown) => (value === 'me' ? actor.userId : text(value));

  switch (rule.op) {
    case 'eq':
      return sql`${x} = ${id(rule.value)}`;

    case 'neq':
      return sql`(${x} is null or ${x} <> ${id(rule.value)})`;

    case 'in':
      return inArray(sql`${x}`, list(rule.value).map(id));

    case 'not_in':
      return sql`(${x} is null or not ${inArray(sql`${x}`, list(rule.value).map(id))})`;

    default:
      return undefined;
  }
};

const lowerList = (value: unknown) => textArray(list(value).map((item) => item.toLowerCase()));

const compileText = (spec: FieldSpec, rule: ConditionRule) => {
  const x = spec.expr;

  // With a trigram index, "is" as a wildcard-free ILIKE uses it; otherwise lower() = lower().
  const is = (value: string) =>
    spec.trigram ? sql`${x} ilike ${escapeLike(value)}` : sql`lower(${x}) = lower(${value})`;

  switch (rule.op) {
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
      return sql`lower(${x}) = any(${lowerList(rule.value)})`;

    case 'not_in':
      return sql`(${x} is null or not (lower(${x}) = any(${lowerList(rule.value)})))`;

    default:
      return undefined;
  }
};

const compileNumber = (x: SQL, rule: ConditionRule) => {
  if (rule.op === 'neq') return sql`(${x} is null or ${x} <> ${number(rule.value)})`;

  const compare = COMPARE[rule.op];

  return compare ? sql`${x} ${sql.raw(compare)} ${number(rule.value)}` : undefined;
};

/** A built-in column (or a linked company's). */
const compileValue = (spec: FieldSpec, rule: ConditionRule, actor: Actor): SQL => {
  const x = spec.expr;
  const { op } = rule;

  if (op === 'exists')
    return spec.type === 'text' ? sql`coalesce(${x}, '') <> ''` : sql`${x} is not null`;

  if (op === 'not_exists') return not(compileValue(spec, { ...rule, op: 'exists' }, actor));

  if (spec.stageLookup && ['eq', 'neq', 'in', 'not_in'].includes(op)) {
    return compileStage(x, rule, actor);
  }

  const compiled =
    spec.type === 'number'
      ? compileNumber(x, rule)
      : spec.type === 'date'
        ? compileDate(x, op, rule.value, Boolean(spec.dateOnly), spec.monthDay)
        : spec.type === 'member'
          ? compileMember(x, rule, actor)
          : spec.type === 'select' || spec.type === 'text'
            ? compileText(spec, rule)
            : undefined;

  if (!compiled) throw cannotUse(spec, op);

  return compiled;
};

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
const compileCustom = (spec: FieldSpec, custom: CustomSpec, rule: ConditionRule): SQL => {
  const v = valuesTable(custom.recordType);
  const record = custom.recordType === 'company' ? companies : customers;

  const has = (condition?: SQL) =>
    sql`exists (select 1 from ${v} where ${v.orgId} = ${record.orgId} and ${v.recordId} = ${record.id} and ${v.fieldId} = ${custom.fieldId}${condition ? sql` and ${condition}` : sql``})`;

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
      throw invalid(`Tags can't use “${rule.op}”`);
  }
};

const compileField = (spec: FieldSpec, rule: ConditionRule, actor: Actor) =>
  spec.custom ? compileCustom(spec, spec.custom, rule) : compileValue(spec, rule, actor);

interface Compiling {
  specs: Map<string, FieldSpec>;
  recordType: ViewRecordType;
  actor: Actor;
}

const compileRule = (rule: ConditionRule, { specs, recordType, actor }: Compiling): SQL => {
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
  compiling: Compiling,
  depth: number,
): SQL | undefined => {
  if (depth > 3) throw invalid('At most three levels of groups');

  const parts = group.rules
    .map((rule) =>
      'match' in rule ? compileGroup(rule, compiling, depth + 1) : compileRule(rule, compiling),
    )
    .filter((part): part is SQL => Boolean(part));

  if (!parts.length) return undefined;

  return group.match === 'all' ? and(...parts) : or(...parts);
};

const parseFilter = (filter: string | ConditionGroup) => {
  try {
    return RecordFilter.parse(typeof filter === 'string' ? JSON.parse(filter) : filter);
  } catch {
    throw invalid('The filter is not a valid condition group');
  }
};

/** A list's `filter` (JSON of a condition group) → one SQL condition on its table; 400 `INVALID_FILTER` when it doesn't fit. */
export const compileRecordFilter = async (
  client: Db,
  actor: Actor,
  recordType: ViewRecordType,
  filter: string | ConditionGroup | null | undefined,
) => {
  if (!filter) return undefined;

  const group = parseFilter(filter);

  const specs = new Map(
    (await filterFields(client, actor.orgId, recordType)).map((spec) => [spec.path, spec]),
  );

  return compileGroup(group, { specs, recordType, actor }, 1);
};
