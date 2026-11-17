import type { ConditionGroup, ConditionRule } from '@erxes/core-contract';
import { type Caller, type Db, runAs } from '@erxes/core-db';
import { type SQL, sql } from 'drizzle-orm';
import { inOrder } from '~/lib/sequence';
import { type SubjectCompiler, subjectCompiler } from '~/modules/views/recordFilter';
import { evaluateGroup, evaluateRule } from './conditions';
import { automationMember } from './runs';
import { isSubjectType, SUBJECT_TABLES, type SubjectType } from './subjects';

/** The record a check is about: its type (as events name it) and id. */
export interface SubjectRef {
  type: string;
  id: string;
}

/** A group to check, and what its rules on the event and earlier steps read. */
interface Check {
  group: ConditionGroup | undefined;
  context: Record<string, unknown>;
}

const isSubjectRule = (rule: ConditionRule) => rule.path.startsWith('subject.');

/** Whether a group has a rule on the record's fields. */
const readsSubject = (group: ConditionGroup | undefined): boolean =>
  Boolean(
    group?.rules.some((rule) => ('match' in rule ? readsSubject(rule) : isSubjectRule(rule))),
  );

/**
 * Checks automations' conditions the way lists filter: a rule on the record's fields
 * (`subject.*`) is the list filter's SQL on the record's table, so a condition means the same in
 * an automation as in a saved view, company and plugin relation fields included. Rules on the
 * event and earlier steps are known values, so they go into that SQL as `true` or `false`.
 *
 * One checker serves a job: each record type's fields are read once, as `as` gives (the member
 * who turned the automation on, so "me" and relation permissions are theirs; the caller when
 * absent). `as` is asked only when a group reads the record's fields.
 */
export const conditionChecker = (tx: Db, as?: () => Promise<Caller>) => {
  const compilers = new Map<SubjectType, Promise<SubjectCompiler>>();

  const compilerOf = (type: SubjectType) => {
    const known = compilers.get(type);

    if (known) return known;

    const made = as
      ? as().then((who) => runAs(who, () => subjectCompiler(tx, type)))
      : subjectCompiler(tx, type);

    compilers.set(type, made);

    return made;
  };

  /**
   * The group as one condition on `type`'s table, with the rest of `context` (the event, earlier
   * steps) decided now; undefined when it has no rules.
   */
  const where = async (
    type: SubjectType,
    group: ConditionGroup | undefined,
    context: Record<string, unknown>,
  ): Promise<SQL | undefined> => {
    if (!group?.rules.length) return undefined;

    return (await compilerOf(type)).compile(group, (rule) => evaluateRule(rule, context));
  };

  /**
   * Whether each group holds for the record, each with the context its other rules read, in one
   * query for all the groups that read the record's fields. Without a record (or once it is
   * deleted) its fields read as empty.
   */
  const check = async (subject: SubjectRef | null, checks: Check[]): Promise<boolean[]> => {
    const type = subject && isSubjectType(subject.type) ? subject.type : null;
    const reading = checks.flatMap(({ group }, index) => (readsSubject(group) ? [index] : []));

    const plain = (subjectValue?: unknown) =>
      checks.map(({ group, context }) =>
        evaluateGroup(
          group,
          subjectValue === undefined ? context : { ...context, subject: subjectValue },
        ),
      );

    if (!type || !subject || !reading.length) return plain();

    const table = SUBJECT_TABLES[type];
    const compiled: (SQL | undefined)[] = [];

    // One after another on the job's transaction.
    await inOrder(reading, async (index) => {
      const item = checks[index];

      compiled.push(item && (await where(type, item.group, item.context)));
    });

    const columns = compiled.map(
      (condition, at) =>
        sql`coalesce((${condition ?? sql`true`}), false) as ${sql.identifier(`c${at}`)}`,
    );

    const { rows } = await tx.execute<Record<string, boolean>>(
      sql`select ${sql.join(columns, sql`, `)} from ${table} where ${table.id} = ${subject.id}`,
    );

    const [row] = rows;

    if (!row) return plain(null);

    return checks.map(({ group, context }, index) => {
      const at = reading.indexOf(index);

      return at < 0 ? evaluateGroup(group, context) : row[`c${at}`] === true;
    });
  };

  /** Whether one group holds for the record. */
  const holds = async (
    subject: SubjectRef | null,
    group: ConditionGroup | undefined,
    context: Record<string, unknown>,
  ) => (await check(subject, [{ group, context }]))[0] === true;

  return { where, check, holds };
};

export type ConditionChecker = ReturnType<typeof conditionChecker>;

/** The checker of an automation's conditions: as the member who turned it on. */
export const automationChecker = (
  tx: Db,
  automation: { orgId: string; activatedBy: string | null },
) => conditionChecker(tx, () => automationMember(automation.orgId, automation.activatedBy));

/** Checkers for automations of one organisation, one per member who turned them on. */
export const checkersByMember = (tx: Db, orgId: string) => {
  const made = new Map<string | null, ConditionChecker>();

  return (activatedBy: string | null) => {
    const known = made.get(activatedBy);

    if (known) return known;

    const checker = automationChecker(tx, { orgId, activatedBy });

    made.set(activatedBy, checker);

    return checker;
  };
};
