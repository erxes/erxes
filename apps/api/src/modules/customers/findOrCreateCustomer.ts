import type { CUSTOMER_STATES } from '@erxes/core-db/enums';
import {
  callerUserId,
  customers,
  type Db,
  db,
  newId,
  requestOrgId,
  runAs,
  system,
} from '@erxes/core-db';
import { arrayContains, eq, or, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { normalizeEmail, normalizePhone, unique } from '~/lib/contacts';
import { lockKeys } from '~/lib/locks';
import { oneRow } from '~/lib/rows';
import { contactCreated, contactUpdated } from '~/modules/activities/contactHistory';
import { planLeadOnCreate, recordLeadSteps } from '~/modules/leads/lifecycle';
import { assertUnitsInReach, limitedReach } from '~/modules/reach/reach';
import { findCustomer } from './customerRows';

interface Contact {
  primaryEmail?: string;
  primaryPhone?: string;
  firstName?: string;
  lastName?: string;
  state?: (typeof CUSTOMER_STATES)[number];
  source?: string | null;
  sourceDetails?: Record<string, string>;
}

/** The customer with this email or phone, as a primary one or among the others. */
const findByContact = async (client: Db, email: string | null, phone: string | null) => {
  const [found] = await client
    .select({ id: customers.id })
    .from(customers)
    .where(
      or(
        email
          ? or(eq(customers.primaryEmail, email), arrayContains(customers.emails, [email]))
          : undefined,
        phone
          ? or(eq(customers.primaryPhone, phone), arrayContains(customers.phones, [phone]))
          : undefined,
      ),
    )
    .orderBy(sql`${customers.primaryEmail} = ${email ?? ''} DESC`)
    .limit(1);

  return found;
};

/**
 * Where a find-or-create happens: the unit it names (one the caller reaches), else the units
 * of a calling member whose role reaches only units. Nowhere for everyone else.
 */
const placeOf = async (client: Db, unitId: string | undefined) => {
  if (unitId) {
    await assertUnitsInReach(client, [unitId]);

    return [unitId];
  }

  const reach = limitedReach();

  return reach && reach.level !== 'own' ? [...reach.unitIds] : [];
};

/**
 * The customer someone else already has is found whoever asks: an email and a phone are one
 * customer's in the whole organisation. They are put in the units it happens at too (the store
 * that serves them now), read and written as core since the caller may not reach them yet.
 */
const findAnywhere = (email: string | null, phone: string | null, unitIds: string[]) =>
  runAs(system('customer lookup'), async () => {
    const tx = db();
    const found = await findByContact(tx, email, phone);

    if (!found) return null;

    const before = await findCustomer(tx, found.id);
    const merged = unique([...before.unitIds, ...unitIds]);

    if (merged.length === before.unitIds.length) return { id: found.id, shared: null };

    await tx
      .update(customers)
      .set({ unitIds: merged, updatedAt: sql`now()` })
      .where(eq(customers.id, found.id));

    return { id: found.id, shared: { before, after: await findCustomer(tx, found.id) } };
  });

/** The customer as the caller sees them; 409 TAKEN when their reach still leaves them out. */
const foundCustomer = async (client: Db, id: string, field: 'primaryEmail' | 'primaryPhone') => {
  const [visible] = await client
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.id, id));

  if (!visible) {
    throw fail('TAKEN', 'A customer outside your reach has this email or phone', { field });
  }

  return findCustomer(client, id);
};

/**
 * The customer with this email or phone (also among their other emails and
 * phones), or a new one. Calls for the same email or phone run one at a time,
 * so two at once never make two customers. With only a name it creates one.
 * With `unitId`, or for a member whose role reaches only units, the customer
 * found is put in that unit as well and a new one starts there.
 */
export const findOrCreateCustomer = async (client: Db, input: Contact & { unitId?: string }) => {
  const email = input.primaryEmail ? normalizeEmail(input.primaryEmail) : null;
  const phone = input.primaryPhone ? normalizePhone(input.primaryPhone) : null;
  const unitIds = await placeOf(client, input.unitId);

  // Advisory locks span organisations, so the key names the organisation.
  const orgId = requestOrgId();

  await lockKeys(client, [
    ...(email ? [`customer:${orgId}:email:${email}`] : []),
    ...(phone ? [`customer:${orgId}:phone:${phone}`] : []),
  ]);

  // A name alone matches nobody: names repeat, so it always makes a new customer.
  const found = email || phone ? await findAnywhere(email, phone, unitIds) : null;

  if (found) {
    if (found.shared) {
      await contactUpdated(client, 'customer', found.shared.before, found.shared.after);
    }

    return {
      customer: await foundCustomer(client, found.id, email ? 'primaryEmail' : 'primaryPhone'),
      created: false,
    };
  }

  const lead = await planLeadOnCreate(client, {
    state: input.state ?? 'customer',
    source: input.source,
    sourceDetails: input.sourceDetails,
  });

  const row = oneRow(
    await client
      .insert(customers)
      .values({
        ...lead.set,
        id: newId(),
        unitIds: unitIds.length ? unitIds : undefined,
        state: input.state ?? 'customer',
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        primaryEmail: email,
        emails: email ? [email] : [],
        primaryPhone: phone,
        phones: phone ? [phone] : [],
        createdBy: callerUserId(),
      })
      .returning({ id: customers.id }),
  );

  await recordLeadSteps(client, 'customer', [{ id: row.id, steps: lead.steps }]);
  await contactCreated(client, 'customer', await findCustomer(client, row.id));

  return {
    customer: await findCustomer(client, row.id),
    created: true,
  };
};
