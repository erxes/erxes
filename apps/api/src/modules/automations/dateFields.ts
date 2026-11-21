import { customers, type Db } from '@erxes/core-db';
import { type SQL, sql } from 'drizzle-orm';
import { alias, fieldsOf, qualified, tableOf } from '~/modules/dataExtensions/definitions';
import { DATA_PATH } from '~/modules/dataExtensions/hostFilters';
import { SUBJECT_TABLES, type SubjectType } from './subjects';

/**
 * The dates a date trigger fires around: a customer's birthday (`birthDate`), or a Data
 * Extensions date field of the customer or company (`data.<key>`).
 */

/** Each subject's Data Extensions record type. */
const DATA_TYPES = { customer: 'core.customer', company: 'core.company' } as const;

const X = alias('x');

/** The key of a trigger's Data Extensions field (`data.renewal` → `renewal`), or null. */
export const dateKeyOf = (field: string) =>
  field.startsWith(DATA_PATH) ? field.slice(DATA_PATH.length) : null;

/** The subject's active date field with this key, or undefined. */
export const dateFieldOf = async (client: Db, subject: SubjectType, key: string) =>
  (await fieldsOf(client, DATA_TYPES[subject])).find(
    (field) => field.key === key && field.type === 'date',
  );

/** Month * 100 + day of a `YYYY-MM-DD` day, as the birthday column holds it. */
const monthDayOf = (iso: string) => Number(iso.slice(5, 7)) * 100 + Number(iso.slice(8, 10));

const onDay = (column: SQL, iso: string, yearly: boolean) =>
  yearly
    ? sql`((extract(month from ${column}) * 100 + extract(day from ${column}))::smallint) = ${monthDayOf(iso)}`
    : sql`${column} = ${iso}::date`;

/** The records whose date is `iso` (with `yearly`, any year: its month and day). */
export const onDate = async (
  client: Db,
  trigger: { subject: SubjectType; field: string; yearly: boolean },
  iso: string,
): Promise<SQL> => {
  if (trigger.field === 'birthDate' && trigger.subject === 'customer') {
    return trigger.yearly
      ? sql`${customers.birthMonthDay} = ${monthDayOf(iso)}`
      : sql`${customers.birthDate} = ${iso}::date`;
  }

  const key = dateKeyOf(trigger.field);
  const field = key ? await dateFieldOf(client, trigger.subject, key) : undefined;
  const table = field?.column ? await tableOf(client, field.recordType) : null;

  if (!field?.column || !table) return sql`false`;

  const column = sql`${X}.${sql.identifier(field.column)}`;

  return sql`exists (select 1 from ${qualified(table)} ${X} where ${X}.record_id = ${SUBJECT_TABLES[trigger.subject].id} and ${onDay(column, iso, trigger.yearly)})`;
};
