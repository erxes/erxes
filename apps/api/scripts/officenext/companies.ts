/**
 * `companies` → `core_companies`. Core keeps company names unique, so a second company with a
 * name already used gets its code or the end of its id after the name; a company without a name
 * takes its first other name, email, website or id. Parent companies have no column.
 */
import type { Document } from 'mongodb';
import type { z } from 'zod';
import {
  emailsOf,
  keepLive,
  leadStageOf,
  lookups,
  type Lookups,
  memberOf,
  mergedInto,
  phonesOf,
  survivorsOf,
  tagLinks,
} from './contacts';
import { eachBatch, insert, MINE, type Run } from './run';
import { mainSource } from './sources';
import {
  amount,
  createdOf,
  field,
  idOf,
  ids,
  optionalId,
  readOr,
  record,
  text,
  texts,
  when,
} from './values';

export const CompanyDocument = record({
  status: text,
  primaryName: text,
  names: texts,
  avatar: text,
  primaryEmail: text,
  emails: texts,
  primaryPhone: text,
  phones: texts,
  website: text,
  industry: field((value) => texts.parse(value)[0] ?? text.parse(value)),
  size: amount,
  businessType: text,
  code: text,
  description: text,
  ownerId: optionalId,
  parentCompanyId: optionalId,
  leadStatus: text,
  tagIds: ids,
  scopeBrandIds: ids,
  createdAt: when,
  updatedAt: when,
  modifiedAt: when,
});

export type CompanyDocument = z.infer<typeof CompanyDocument>;

/** The name the company shows, before making it unique. */
const companyName = (company: CompanyDocument) =>
  company.primaryName ??
  company.names[0] ??
  company.primaryEmail ??
  company.website ??
  `Company ${company.id}`;

/** A name no other company has (case-insensitive); `taken` maps lower name → company id. */
export const uniqueName = (taken: Map<string, string>, company: CompanyDocument) => {
  const base = companyName(company);

  const options = [
    base,
    `${base} (${company.code ?? company.id.slice(-5)})`,
    `${base} (${company.id})`,
  ];

  const name =
    options.find((option) => {
      const owner = taken.get(option.toLowerCase());

      return !owner || owner === company.id;
    }) ?? `${base} (${company.id})`;

  taken.set(name.toLowerCase(), company.id);

  return name;
};

export const companyRow = (
  company: CompanyDocument,
  found: Lookups,
  name: string,
  merged: string[],
) => {
  const createdAt = createdOf(company.id, company.createdAt, company.updatedAt);
  const updatedAt = company.updatedAt ?? company.modifiedAt ?? createdAt;
  const emails = emailsOf(company.primaryEmail, company.emails);
  const phones = phonesOf(company.primaryPhone, company.phones);
  const lead = leadStageOf(found, company.leadStatus);

  return [
    company.id,
    name,
    // The name before it was made unique stays findable.
    [...new Set([name, companyName(company), ...company.names])],
    company.avatar,
    emails[0] ?? null,
    emails,
    phones[0] ?? null,
    phones,
    company.website,
    company.industry,
    company.size === null ? null : Math.round(company.size),
    company.businessType,
    company.code,
    company.description,
    memberOf(found, company.ownerId),
    merged,
    createdAt,
    updatedAt,
    updatedAt,
    lead.stageId ? 'lead' : 'customer',
    lead.stageId,
    lead.reason,
    'import',
    JSON.stringify({
      importedFrom: 'erxes 3',
      ...(company.parentCompanyId ? { parentCompanyId: company.parentCompanyId } : {}),
    }),
  ];
};

const COLUMNS = [
  'id',
  'primary_name',
  'names',
  'avatar_url',
  'primary_email',
  'emails',
  'primary_phone',
  'phones',
  'website',
  'industry',
  'size',
  'business_type',
  'code',
  'description',
  'owner_id',
  'merged_ids',
  'created_at',
  'updated_at',
  'last_activity_at',
  'state',
  'lead_stage_id',
  'disqualify_reason',
  'source',
  'source_details',
];

/** Companies of `source`: `erxes`'s, or those only the v1 copy has. */
export const importCompanies = async (run: Run, source = mainSource(run, 'companies')) => {
  const label = source.name;
  const collection = source.db.collection(source.collection);
  const survivors = await survivorsOf(collection);
  const merged = mergedInto(survivors);
  const found = await lookups(run);

  const { rows } = await run.pg.query<{ id: string; name: string }>(
    `SELECT id, lower(primary_name) AS name FROM core_companies WHERE ${MINE}`,
  );

  const taken = new Map(rows.map((row) => [row.name, row.id]));

  run.report.of(label, 'core_companies');

  const handle = async (documents: Document[]) => {
    const parsed = documents.flatMap((doc) => {
      const company = readOr(CompanyDocument, doc);

      if (!company) run.report.skip(label, 'unreadable _id', idOf(doc));

      return company ? [company] : [];
    });

    const live = await keepLive(run, label, 'company', parsed, survivors);

    const built = live.map((company) => {
      const name = uniqueName(taken, company);

      if (name !== company.primaryName)
        run.report.note(label, 'name missing or taken; made unique', company.id);

      if (company.parentCompanyId)
        run.report.note(label, 'parent company kept in source_details (no column)', company.id);

      return companyRow(company, found, name, merged.get(company.id) ?? []);
    });

    await insert(run, {
      collection: label,
      table: 'core_companies',
      columns: COLUMNS,
      rows: built,
      keys: live.map((company) => company.id),
    });
    await tagLinks(
      run,
      found,
      { collection: label, table: 'core_company_tags', column: 'company_id', type: 'company' },
      live,
    );
  };

  await eachBatch(run, collection, handle, source.filter, label);
};
