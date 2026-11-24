import type { CompanyMerge } from '@erxes/core-contract';
import { companies, customerCompanies, db, type Db } from '@erxes/core-db';
import { COMPANY_MERGE_FIELDS } from '@erxes/core-db/enums';
import { asc, inArray, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { combineContacts, combineCustomFields, pickedRow, pickFields } from '~/lib/merge';
import { contactsMerged } from '~/modules/activities/contactHistory';
import { saveCustomFields } from '~/modules/fields/fieldValues';
import { copyTags } from '~/modules/tags/tagLinks';
import { type CompanyRow, findCompany, inOrg, selectCompanies } from './companyRows';

/** Fields taken whole from one company; names, emails and phones are combined. */
const MERGE_FILLED = COMPANY_MERGE_FIELDS.filter(
  (field) => field !== 'primaryName' && field !== 'primaryEmail' && field !== 'primaryPhone',
);

/** People links and tags move to the kept company before the others go. */
const moveRelations = async (tx: Db, keepId: string, otherIds: string[]) => {
  await tx.execute(sql`
    INSERT INTO ${customerCompanies} (customer_id, company_id)
    SELECT customer_id, ${keepId} FROM ${customerCompanies}
    WHERE company_id IN (${sql.join(
      otherIds.map((id) => sql`${id}`),
      sql`, `,
    )})
    ON CONFLICT DO NOTHING
  `);
  await copyTags(tx, 'company', otherIds, keepId);
};

/** The kept company's columns after the merge: the others' names become extra names. */
const mergedColumns = (keep: CompanyRow, others: CompanyRow[], picks: CompanyMerge['fields']) => {
  const contacts = (
    field: 'primaryName' | 'primaryEmail' | 'primaryPhone',
    list: (row: CompanyRow) => string[],
  ) => {
    const of = (row: CompanyRow) => ({ primary: row[field], list: list(row) });

    return combineContacts(of(keep), others.map(of), pickedRow(keep, others, picks[field])[field]);
  };

  const name = contacts('primaryName', (row) => row.names);
  const email = contacts('primaryEmail', (row) => row.emails);
  const phone = contacts('primaryPhone', (row) => row.phones);

  return {
    ...pickFields(keep, others, MERGE_FILLED, picks),
    primaryName: name.primary ?? keep.primaryName,
    names: name.list,
    primaryEmail: email.primary,
    emails: email.list,
    primaryPhone: phone.primary,
    phones: phone.list,
    mergedIds: unique([
      ...keep.mergedIds,
      ...others.map((other) => other.id),
      ...others.flatMap((other) => other.mergedIds),
    ]),
    updatedAt: sql`now()`,
  };
};

/** Merges companies into `keepId`, as `mergeCustomers` does; the others' names become extra names. */
export const mergeCompanies = async (input: CompanyMerge) => {
  const ids = unique(input.ids);

  if (ids.length < 2) {
    throw fail('INVALID_INPUT', 'Choose at least two companies to merge', {
      issues: [{ path: ['ids'], message: 'Choose at least two companies to merge' }],
    });
  }

  const tx = db();

  const rows = await selectCompanies(tx)
    .where(inArray(companies.id, ids))
    .orderBy(asc(companies.createdAt))
    .for('update');

  const byId = new Map(rows.map((row) => [row.id, row]));
  const keep = byId.get(input.keepId);

  if (rows.length !== ids.length || !keep) {
    throw notFound('Company');
  }

  const others = ids.filter((id) => id !== keep.id).flatMap((id) => byId.get(id) ?? []);
  const otherIds = others.map((other) => other.id);

  await moveRelations(tx, keep.id, otherIds);
  await tx.delete(companies).where(inArray(companies.id, otherIds));

  await tx
    .update(companies)
    .set(mergedColumns(keep, others, input.fields))
    .where(inOrg(keep.id));

  const combined = combineCustomFields(
    keep.customFields,
    others.map((other) => other.customFields),
  );

  await saveCustomFields(tx, 'company', keep.id, combined, Object.keys(combined));

  const merged = await findCompany(tx, keep.id);

  await contactsMerged(tx, 'company', merged, others);

  return merged;
};
