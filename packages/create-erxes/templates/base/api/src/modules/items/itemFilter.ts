import { ConditionGroup, type ConditionRule } from '@erxes/core-contract';
import { ORPCError } from '@orpc/server';
import { and, ilike, inArray, or, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { items } from '#/db/schema.ts';

export const escapeLike = (text: string) => text.replaceAll(/[\\%_]/g, '\\$&');

/**
 * The list's filter bar (erxes-ui's `ListFilter`) sends core's condition group as JSON, its
 * rules on the fields the UI gives it: `subject.name` and `subject.createdBy`.
 */
export const ItemFilter = z
  .string()
  .transform((text, context) => {
    try {
      const parsed: unknown = JSON.parse(text);

      return parsed;
    } catch {
      context.addIssue({ code: 'custom', message: 'filter is not JSON' });

      return z.NEVER;
    }
  })
  .pipe(ConditionGroup);

const Values = z.array(z.string());

/** One rule as SQL; `me` is the member asking. A rule the list has no field for is refused. */
const ruleSql = (rule: ConditionRule, userId: string): SQL | undefined => {
  if (rule.path === 'subject.name' && rule.op === 'contains' && typeof rule.value === 'string') {
    return ilike(items.name, `%${escapeLike(rule.value)}%`);
  }

  const picked = Values.safeParse(rule.op === 'in' ? rule.value : [rule.value]);

  if (
    rule.path === 'subject.createdBy' &&
    (rule.op === 'in' || rule.op === 'eq') &&
    picked.success
  ) {
    return inArray(
      items.createdBy,
      picked.data.map((id) => (id === 'me' ? userId : id)),
    );
  }

  throw new ORPCError('BAD_REQUEST', {
    message: `Items can't be filtered by ${rule.path} ${rule.op}`,
  });
};

/** The filter's rules as SQL: all of them, or any (a group from the advanced filter). */
export const filterSql = (group: ConditionGroup, userId: string): SQL | undefined => {
  const parts = group.rules.map((part) =>
    'rules' in part ? filterSql(part, userId) : ruleSql(part, userId),
  );

  return group.match === 'any' ? or(...parts) : and(...parts);
};
