import {
  type ConditionGroup,
  type ConditionRule,
  RecordFilter,
  type ViewRecordType,
} from '@erxes/core-contract';
import {
  callerUserId,
  companies,
  customerCompanies,
  customers,
  type Db,
  type FieldContentType,
  products,
} from '@erxes/core-db';
import {
  compileColumn,
  compileGroup,
  type FilterContext,
  invalidFilter,
  list,
  NEGATIVE,
  text,
} from '@erxes/plugin-sdk/filter';
import { not, type SQL, sql } from 'drizzle-orm';
import { hasAnyTag } from '~/modules/tags/tagLinks';
import type { FieldSpec } from './fieldSpec';
import { filterFields, isCompanyList, type SubjectType, subjectFilterFields } from './filterFields';
import { compileRelated, type RelationViews, relationViews } from './relationFilter';

/** Rules name records (a lead stage, a category); the column holds their ids. */
const compileLookup = (x: SQL, rule: ConditionRule, lookup: (names: string[]) => SQL) => {
  const { op } = rule;
  const ids = lookup(op === 'in' || op === 'not_in' ? list(rule.value) : [text(rule.value)]);

  return op === 'eq' || op === 'in'
    ? sql`${x} = any(${ids})`
    : sql`(${x} is null or not (${x} = any(${ids})))`;
};

const LOOKUP_OPS: ConditionRule['op'][] = ['eq', 'neq', 'in', 'not_in'];

/** A built-in column, a Data Extensions field, or the linked company's. */
const compileValue = (spec: FieldSpec, rule: ConditionRule, context: FilterContext) =>
  spec.lookup && LOOKUP_OPS.includes(rule.op)
    ? compileLookup(spec.expr, rule, spec.lookup)
    : compileColumn(spec, spec.path, rule, context);

/** Each record type's table, for its tags. */
const RECORDS = { customer: customers, company: companies, product: products } satisfies Record<
  FieldContentType,
  unknown
>;

const tagType = (recordType: ViewRecordType): FieldContentType =>
  recordType === 'product' ? 'product' : isCompanyList(recordType) ? 'company' : 'customer';

const compileTags = (recordType: ViewRecordType, rule: ConditionRule): SQL => {
  const type = tagType(recordType);
  const record = RECORDS[type].id;
  const tagged = (ids: string[]) => hasAnyTag(type, record, ids);
  const any = hasAnyTag(type, record);

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
  views: RelationViews;
}

const compileRule = (rule: ConditionRule, compiling: Compiling): SQL => {
  const { specs, recordType, context, views } = compiling;
  const spec = specs.get(rule.path);

  if (!spec) throw invalidFilter(`Unknown field: ${rule.path}`);

  const { related } = spec;

  if (related) {
    return compileRelated({ ...spec, related }, rule, {
      company: isCompanyList(recordType),
      views,
      context,
    });
  }

  if (rule.where) throw invalidFilter(`“${spec.label}” has no related records to narrow`);

  if (spec.type === 'tags') return compileTags(recordType, rule);

  if (spec.viaCompany) {
    const positive = NEGATIVE[rule.op];
    const inner = compileValue(spec, positive ? { ...rule, op: positive } : rule, context);
    const linked = sql`exists (select 1 from ${customerCompanies} join ${companies} on ${companies.id} = ${customerCompanies.companyId} and ${companies.orgId} = ${customerCompanies.orgId} where ${customerCompanies.orgId} = ${customers.orgId} and ${customerCompanies.customerId} = ${customers.id} and ${inner})`;

    return positive ? not(linked) : linked;
  }

  return compileValue(spec, rule, context);
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
  const views = await relationViews(client, specs, group);
  const compiling = { specs, recordType, context: { me: callerUserId() }, views };

  return compileGroup(group, (rule) => compileRule(rule, compiling));
};

/**
 * Conditions on one customer's or company's fields as SQL on its table, the way its lists
 * compile them, for automations. The fields (and "me", the member who runs them) are read once,
 * so one compiler serves a job's every check. A rule on anything else (the event, earlier steps,
 * a field the record doesn't have) is decided by `outside` and goes in as `true` or `false`.
 */
export const subjectCompiler = async (client: Db, subject: SubjectType) => {
  const specs = new Map(
    (await subjectFilterFields(client, subject)).map((spec) => [spec.path, spec]),
  );

  const context = { me: callerUserId() };

  return {
    fields: specs,
    /** Undefined when the group has no rules (it holds for every record). */
    compile: async (group: ConditionGroup, outside: (rule: ConditionRule) => boolean) => {
      const compiling = {
        specs,
        recordType: subject,
        context,
        views: await relationViews(client, specs, group),
      };

      return compileGroup(group, (rule) =>
        specs.has(rule.path)
          ? compileRule(rule, compiling)
          : outside(rule)
            ? sql`true`
            : sql`false`,
      );
    },
  };
};

export type SubjectCompiler = Awaited<ReturnType<typeof subjectCompiler>>;
