import type { HookSubject } from '@erxes/core-contract';
import { companies, customers, type Db } from '@erxes/core-db';
import { eq, type SQL, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { normalizeEmail, normalizePhone } from '~/lib/contacts';
import { text } from './actions/context';
import { valueAt } from './conditions';
import { loadSubjects } from './subjects';

const lookupBy = (subject: HookSubject, value: string): SQL => {
  if (subject.type === 'company')
    return subject.by === 'id'
      ? eq(companies.id, value)
      : sql`lower(${companies.primaryName}) = ${value.toLowerCase()}`;

  switch (subject.by) {
    case 'id':
      return eq(customers.id, value);
    case 'primaryEmail':
      return sql`lower(${customers.primaryEmail}) = ${normalizeEmail(value)}`;
    case 'primaryPhone':
      return eq(customers.primaryPhone, normalizePhone(value));
  }
};

export const findHookSubject = async (
  client: Db,
  subject: HookSubject,
  context: Record<string, unknown>,
) => {
  const value = text(valueAt(context, `event.payload.${subject.field}`))?.trim();

  if (!value) return null;

  const [found] = await loadSubjects(client, subject.type, lookupBy(subject, value), { limit: 1 });

  return found ?? null;
};

export const noHookSubject = () =>
  fail('SUBJECT_NOT_FOUND', 'No customer or company matches this request');
