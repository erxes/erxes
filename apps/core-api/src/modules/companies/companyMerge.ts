import { companies, customerCompanies, db, type Db } from '@erxes/core-db';
import { asc, inArray, sql } from 'drizzle-orm';
import { type Actor, requirePermission } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { combineContacts, combineCustomFields, fillEmpty } from '~/lib/merge';
import { contactsMerged } from '~/modules/activities/contactHistory';
import { saveCustomFields } from '~/modules/fields/fieldValues';
import { copyTags } from '~/modules/tags/tagLinks';
import { type CompanyRow, findCompany, inOrg, selectCompanies, toCompanyDto } from './companyRows';

const MERGE_FILLED = [
  'avatarUrl',
  'website',
  'industry',
  'size',
  'businessType',
  'code',
  'description',
  'ownerId',
] as const;

/** People links and tags move to the kept company before the others go. */
const moveRelations = async (tx: Db, orgId: string, keepId: string, otherIds: string[]) => {
  await tx.execute(sql`
    INSERT INTO ${customerCompanies} (org_id, customer_id, company_id)
    SELECT ${orgId}, customer_id, ${keepId} FROM ${customerCompanies}
    WHERE company_id IN (${sql.join(
      otherIds.map((id) => sql`${id}`),
      sql`, `,
    )})
    ON CONFLICT DO NOTHING
  `);
  await copyTags(tx, orgId, 'company', otherIds, keepId);
};

/** The kept company's columns after the merge: the others' names become extra names. */
const mergedColumns = (keep: CompanyRow, others: CompanyRow[]) => {
  const contacts = (pick: (row: CompanyRow) => { primary: string | null; list: string[] }) =>
    combineContacts(pick(keep), others.map(pick));

  const name = contacts((row) => ({ primary: row.primaryName, list: row.names }));
  const email = contacts((row) => ({ primary: row.primaryEmail, list: row.emails }));
  const phone = contacts((row) => ({ primary: row.primaryPhone, list: row.phones }));

  return {
    ...fillEmpty(keep, others, MERGE_FILLED),
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
export const mergeCompanies = async (actor: Actor, input: { ids: string[]; keepId: string }) => {
  requirePermission(actor, 'contacts.merge');

  const ids = unique(input.ids);

  if (ids.length < 2) {
    throw new HttpError(400, 'INVALID_INPUT', 'Choose at least two companies to merge');
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

  await moveRelations(tx, actor.orgId, keep.id, otherIds);
  await tx.delete(companies).where(inArray(companies.id, otherIds));

  await tx.update(companies).set(mergedColumns(keep, others)).where(inOrg(keep.id));

  const combined = combineCustomFields(
    keep.customFields,
    others.map((other) => other.customFields),
  );

  await saveCustomFields(tx, 'company', keep.id, combined, Object.keys(combined));

  const merged = await findCompany(tx, keep.id);

  await contactsMerged(tx, actor, 'company', merged, others);

  return toCompanyDto(merged);
};
