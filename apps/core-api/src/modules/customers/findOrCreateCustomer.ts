import type { CUSTOMER_STATES } from '@erxes/core-db/enums';
import { caller, customers, type Db, newId, requestOrgId } from '@erxes/core-db';
import { arrayContains, eq, or, sql } from 'drizzle-orm';
import { normalizeEmail, normalizePhone } from '~/lib/contacts';
import { lockKeys } from '~/lib/locks';
import { oneRow } from '~/lib/rows';
import { contactCreated } from '~/modules/activities/contactHistory';
import { planLeadOnCreate, recordLeadSteps } from '~/modules/leads/lifecycle';
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
 * The customer with this email or phone (also among their other emails and
 * phones), or a new one. Calls for the same email or phone run one at a time,
 * so two at once never make two customers.
 */
export const findOrCreateCustomer = async (client: Db, input: Contact) => {
  const email = input.primaryEmail ? normalizeEmail(input.primaryEmail) : null;
  const phone = input.primaryPhone ? normalizePhone(input.primaryPhone) : null;

  // Advisory locks span organisations, so the key names the organisation.
  const orgId = requestOrgId();

  await lockKeys(client, [
    ...(email ? [`customer:${orgId}:email:${email}`] : []),
    ...(phone ? [`customer:${orgId}:phone:${phone}`] : []),
  ]);

  const found = await findByContact(client, email, phone);

  if (found)
    return {
      customer: await findCustomer(client, found.id),
      created: false,
    };

  const lead = await planLeadOnCreate(client, {
    state: input.state ?? 'customer',
    source: input.source,
    sourceDetails: input.sourceDetails,
  });

  const who = caller();

  const row = oneRow(
    await client
      .insert(customers)
      .values({
        ...lead.set,
        id: newId(),
        state: input.state ?? 'customer',
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        primaryEmail: email,
        emails: email ? [email] : [],
        primaryPhone: phone,
        phones: phone ? [phone] : [],
        createdBy: who.type === 'user' ? who.userId : null,
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
