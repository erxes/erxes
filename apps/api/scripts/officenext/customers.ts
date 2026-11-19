/**
 * `customers` → `core_customers`, every state. Visitors (anonymous messenger and web visitors)
 * become leads with source `website`; the old state stays in `source_details`. An email or phone
 * another customer already has as primary stays in the customer's list but not as primary, since
 * core keeps one customer per primary email and phone.
 */
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
import {
  amount,
  createdOf,
  day,
  idOf,
  ids,
  optionalId,
  readOr,
  record,
  text,
  texts,
  when,
} from './values';

export const CustomerDocument = record({
  state: text,
  status: text,
  firstName: text,
  middleName: text,
  lastName: text,
  sex: amount,
  birthDate: day,
  position: text,
  department: text,
  primaryEmail: text,
  emails: texts,
  primaryPhone: text,
  phones: texts,
  avatar: text,
  code: text,
  description: text,
  ownerId: optionalId,
  integrationId: optionalId,
  leadStatus: text,
  lifecycleState: text,
  tagIds: ids,
  scopeBrandIds: ids,
  lastSeenAt: when,
  createdAt: when,
  updatedAt: when,
  modifiedAt: when,
});

export type CustomerDocument = z.infer<typeof CustomerDocument>;

interface State {
  state: 'lead' | 'customer';
  source: string | null;
}

const CUSTOMER: State = { state: 'customer', source: null };

const STATES: Record<string, State> = {
  customer: CUSTOMER,
  lead: { state: 'lead', source: null },
  visitor: { state: 'lead', source: 'website' },
};

/** The new state for an old one; no state was the old default, customer. Unknown is undefined. */
export const stateOf = (old: string | null): State | undefined => (old ? STATES[old] : CUSTOMER);

const SEXES = new Set([0, 1, 2, 9]);

interface Taken {
  emails: Map<string, string>;
  phones: Map<string, string>;
}

/** The customer's row; `taken` holds primary emails and phones other customers have. */
export const customerRow = (
  customer: CustomerDocument,
  found: Lookups,
  taken: Taken,
  merged: string[],
) => {
  const state = stateOf(customer.state) ?? CUSTOMER;
  const emails = emailsOf(customer.primaryEmail, customer.emails);
  const phones = phonesOf(customer.primaryPhone, customer.phones);
  const email = emails[0] ?? null;
  const phone = phones[0] ?? null;
  const emailOwner = email ? taken.emails.get(email) : undefined;
  const phoneOwner = phone ? taken.phones.get(phone) : undefined;
  const primaryEmail = emailOwner && emailOwner !== customer.id ? null : email;
  const primaryPhone = phoneOwner && phoneOwner !== customer.id ? null : phone;

  if (primaryEmail) taken.emails.set(primaryEmail, customer.id);

  if (primaryPhone) taken.phones.set(primaryPhone, customer.id);

  const lead = leadStageOf(found, customer.leadStatus);

  const details = Object.fromEntries(
    Object.entries({
      importedFrom: 'erxes 3',
      oldState: customer.state === 'visitor' ? 'visitor' : null,
      integrationId: customer.integrationId,
      lifecycleState: customer.lifecycleState,
      leadStatus: lead.unknown ? customer.leadStatus : null,
    }).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );

  const createdAt = createdOf(customer.id, customer.createdAt, customer.updatedAt);
  const updatedAt = customer.updatedAt ?? customer.modifiedAt ?? createdAt;

  return {
    demotedEmail: Boolean(email && !primaryEmail),
    demotedPhone: Boolean(phone && !primaryPhone),
    unknownSex: customer.sex !== null && !SEXES.has(customer.sex),
    row: [
      customer.id,
      state.state,
      customer.firstName,
      customer.middleName,
      customer.lastName,
      customer.avatar,
      primaryEmail,
      emails,
      primaryPhone,
      phones,
      customer.sex !== null && SEXES.has(customer.sex) ? customer.sex : null,
      customer.birthDate,
      customer.position,
      customer.department,
      customer.code,
      customer.description,
      memberOf(found, customer.ownerId),
      createdAt,
      updatedAt,
      merged,
      customer.lastSeenAt ?? updatedAt,
      lead.stageId,
      lead.reason,
      state.source ?? 'import',
      JSON.stringify(details),
    ],
  };
};

const COLUMNS = [
  'id',
  'state',
  'first_name',
  'middle_name',
  'last_name',
  'avatar_url',
  'primary_email',
  'emails',
  'primary_phone',
  'phones',
  'sex',
  'birth_date',
  'position',
  'department',
  'code',
  'description',
  'owner_id',
  'created_at',
  'updated_at',
  'merged_ids',
  'last_activity_at',
  'lead_stage_id',
  'disqualify_reason',
  'source',
  'source_details',
];

/** Primary emails and phones in the batch that other customers already hold. */
const takenBy = async (run: Run, customers: CustomerDocument[]): Promise<Taken> => {
  const emails = customers.flatMap((each) => emailsOf(each.primaryEmail, each.emails).slice(0, 1));
  const phones = customers.flatMap((each) => phonesOf(each.primaryPhone, each.phones).slice(0, 1));

  const { rows } = await run.pg.query<{ id: string; email: string | null; phone: string | null }>(
    `SELECT id, lower(primary_email) AS email, primary_phone AS phone FROM core_customers
      WHERE ${MINE} AND (lower(primary_email) = ANY($1::text[]) OR primary_phone = ANY($2::text[]))`,
    [emails, phones],
  );

  return {
    emails: new Map(rows.flatMap((row) => (row.email ? [[row.email, row.id]] : []))),
    phones: new Map(rows.flatMap((row) => (row.phone ? [[row.phone, row.id]] : []))),
  };
};

const writeBatch = async (
  run: Run,
  found: Lookups,
  customers: CustomerDocument[],
  merged: Map<string, string[]>,
) => {
  const taken = await takenBy(run, customers);

  const built = customers.map((customer) => {
    const result = customerRow(customer, found, taken, merged.get(customer.id) ?? []);

    if (result.demotedEmail)
      run.report.note(
        'customers',
        'primary email taken by another customer; kept in emails',
        customer.id,
      );

    if (result.demotedPhone)
      run.report.note(
        'customers',
        'primary phone taken by another customer; kept in phones',
        customer.id,
      );

    if (result.unknownSex) run.report.note('customers', 'sex not 0/1/2/9; left empty', customer.id);

    return result.row;
  });

  await insert(run, {
    collection: 'customers',
    table: 'core_customers',
    columns: COLUMNS,
    rows: built,
    keys: customers.map((customer) => customer.id),
  });
  await tagLinks(
    run,
    found,
    {
      collection: 'customers',
      table: 'core_customer_tags',
      column: 'customer_id',
      type: 'customer',
    },
    customers,
  );
};

export const importCustomers = async (run: Run) => {
  const collection = run.mongo.collection('customers');
  const survivors = await survivorsOf(collection);
  const merged = mergedInto(survivors);
  const found = await lookups(run);

  run.report.of('customers', 'core_customers');

  await eachBatch(run, collection, async (documents) => {
    const parsed = documents.flatMap((doc) => {
      const customer = readOr(CustomerDocument, doc);

      if (!customer) run.report.skip('customers', 'unreadable _id', idOf(doc));

      return customer ? [customer] : [];
    });

    const known = parsed.filter((customer) => {
      if (stateOf(customer.state)) return true;

      run.report.skip('customers', `unknown state ${customer.state ?? ''}`, customer.id);

      return false;
    });

    const live = await keepLive(run, 'customers', 'customer', known, survivors);

    await writeBatch(run, found, live, merged);
  });
};
