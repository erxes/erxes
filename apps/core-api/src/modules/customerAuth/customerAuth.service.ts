import type { CustomerLogin, CustomerProfile, CustomerSession } from '@erxes/core-contract';
import {
  CUSTOMER_LOGIN_KINDS,
  customerLogins,
  customers,
  customerSessions,
  type Db,
  newId,
  organizations,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, asc, count, desc, eq, gt, isNull, sql } from 'drizzle-orm';
import { config } from '~/config';
import { type CustomerCaller, systemCaller } from '~/http/auth';
import { HttpError, notFound, pgConstraint } from '~/http/errors';
import { requestInfo } from '~/http/requestContext';
import { lockKey } from '~/lib/locks';
import { contactUpdated } from '~/modules/activities/contactHistory';
import { subdomainFromHost } from '~/modules/auth/auth.service';
import { findCustomer } from '~/modules/customers/customerRows';
import { findOrCreateCustomer } from '~/modules/customers/findOrCreateCustomer';
import { publishCoreEvents } from '~/modules/events/events.service';
import { type Address, addressOf, invalidCode, sendCode, useCode } from './customerCodes';
import { createSession, revokeSessionToken } from './customerSessions';

/**
 * The organisation a customer signs in to: the one named, else the one in the
 * address core is reached at, else DEFAULT_SUBDOMAIN.
 */
export const organizationOf = async (subdomain: string | undefined, host: string | undefined) => {
  const name = subdomain || subdomainFromHost(host) || config.auth.defaultSubdomain;

  const [row] = name
    ? await withSystem('customer sign-in organisation', (tx) =>
        tx
          .select({
            id: organizations.id,
            name: organizations.name,
            subdomain: organizations.subdomain,
          })
          .from(organizations)
          .where(sql`lower(${organizations.subdomain}) = ${name.toLowerCase()}`)
          .limit(1),
      )
    : [];

  if (!row) throw notFound('Organisation');

  return row;
};

export const signInConfig = async (input: { organization?: string }, host?: string) => {
  const organization = await organizationOf(input.organization, host);

  return {
    organization: { name: organization.name, subdomain: organization.subdomain },
    kinds: [...CUSTOMER_LOGIN_KINDS],
  };
};

const profileOf = async (client: Db, orgId: string, id: string): Promise<CustomerProfile> => {
  const row = await findCustomer(client, orgId, id);

  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    avatarUrl: row.avatarUrl,
    birthDate: row.birthDate,
    primaryEmail: row.primaryEmail,
    primaryPhone: row.primaryPhone,
    createdAt: row.createdAt.toISOString(),
  };
};

const toLoginDto = (row: typeof customerLogins.$inferSelect): CustomerLogin => ({
  id: row.id,
  kind: row.kind,
  value: row.value,
  createdAt: row.createdAt.toISOString(),
  lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
});

const lockLogin = (tx: Db, orgId: string, address: Address) =>
  lockKey(tx, `customer-login:${orgId}:${address.kind}:${address.value}`);

const findLogin = (tx: Db, orgId: string, address: Address) =>
  tx
    .select()
    .from(customerLogins)
    .where(
      and(
        eq(customerLogins.orgId, orgId),
        eq(customerLogins.kind, address.kind),
        eq(customerLogins.value, address.value),
      ),
    )
    .limit(1)
    .then(([row]) => row);

const loginTaken = () =>
  new HttpError(409, 'LOGIN_TAKEN', 'Someone already signs in with this address');

/** Adds a proven address as a login, and to the customer's emails or phones. */
const addLogin = async (tx: Db, orgId: string, customerId: string, address: Address) => {
  const [row] = await tx
    .insert(customerLogins)
    .values({ id: newId(), orgId, customerId, kind: address.kind, value: address.value })
    .returning();

  if (!row) throw new Error('the login was not saved');

  const list = address.kind === 'email' ? customers.emails : customers.phones;
  const primary = address.kind === 'email' ? customers.primaryEmail : customers.primaryPhone;

  await tx
    .update(customers)
    .set(
      address.kind === 'email'
        ? {
            emails: sql`case when ${address.value} = any(${list}) then ${list} else array_append(${list}, ${address.value}) end`,
            primaryEmail: sql`coalesce(${primary}, ${address.value})`,
          }
        : {
            phones: sql`case when ${address.value} = any(${list}) then ${list} else array_append(${list}, ${address.value}) end`,
            primaryPhone: sql`coalesce(${primary}, ${address.value})`,
          },
    )
    .where(and(eq(customers.orgId, orgId), eq(customers.id, customerId)));

  return row;
};

/**
 * The customer who signs in with this proven address: its login's, else the
 * customer who already has the address (it becomes their login), else a new one.
 */
const customerForLogin = async (tx: Db, orgId: string, address: Address) => {
  await lockLogin(tx, orgId, address);

  const login = await findLogin(tx, orgId, address);

  if (login) {
    await tx
      .update(customerLogins)
      .set({ lastUsedAt: sql`now()` })
      .where(eq(customerLogins.id, login.id));

    return { customerId: login.customerId, created: false, signedUp: false };
  }

  const { customer, created } = await findOrCreateCustomer(tx, systemCaller(orgId), {
    ...(address.kind === 'email'
      ? { primaryEmail: address.value }
      : { primaryPhone: address.value }),
    source: 'sign_in',
  });

  const [existing] = await tx
    .select({ logins: count() })
    .from(customerLogins)
    .where(and(eq(customerLogins.orgId, orgId), eq(customerLogins.customerId, customer.id)));

  const saved = await addLogin(tx, orgId, customer.id, address);

  await tx
    .update(customerLogins)
    .set({ lastUsedAt: sql`now()` })
    .where(eq(customerLogins.id, saved.id));

  return { customerId: customer.id, created, signedUp: !existing?.logins };
};

/** Sends a sign-in code; the answer is the same whether or not the address has an account. */
export const sendSignInCode = async (
  input: Address & { organization?: string },
  host: string | undefined,
) => {
  const organization = await organizationOf(input.organization, host);

  return withOrg(organization.id, (tx) =>
    sendCode(tx, organization, addressOf(input), 'sign_in', { ip: requestInfo().ip }),
  );
};

/**
 * Signs in (or up) with a code: the browser on the sign-in page gets a session
 * (any earlier one there ends). Returns the session token for the cookie.
 */
export const signInWithCode = async (
  input: Address & { organization?: string; code: string },
  host: string | undefined,
  previous: string | undefined,
) => {
  const organization = await organizationOf(input.organization, host);
  const address = addressOf(input);

  // Its own transaction: a wrong try counts even though this call fails.
  const valid = await withOrg(organization.id, (tx) =>
    useCode(tx, organization.id, address, 'sign_in', input.code),
  );

  if (!valid) throw invalidCode();

  await revokeSessionToken(previous, null);

  return withOrg(organization.id, async (tx) => {
    const { customerId, created, signedUp } = await customerForLogin(tx, organization.id, address);

    const { ip, userAgent } = requestInfo();

    const session = await createSession(tx, {
      orgId: organization.id,
      customerId,
      clientId: null,
      userAgent,
      ip,
    });

    const subject = { type: 'customer' as const, id: customerId };

    await publishCoreEvents(tx, systemCaller(organization.id), [
      ...(signedUp
        ? [{ type: 'core.customer.signed_up', subject, payload: { kind: address.kind } }]
        : []),
      { type: 'core.customer.signed_in', subject, payload: { kind: address.kind } },
    ]);

    return {
      customer: await profileOf(tx, organization.id, customerId),
      created,
      token: session.token,
    };
  });
};

// The signed-in customer (`/customer/me`).

export const myProfile = (me: CustomerCaller) =>
  withOrg(me.orgId, (tx) => profileOf(tx, me.orgId, me.customerId));

export const updateMyProfile = (
  me: CustomerCaller,
  changes: Partial<Pick<CustomerProfile, 'firstName' | 'lastName' | 'avatarUrl' | 'birthDate'>>,
) =>
  withOrg(me.orgId, async (tx) => {
    const before = await findCustomer(tx, me.orgId, me.customerId);

    await tx
      .update(customers)
      .set({ ...changes, updatedAt: sql`now()` })
      .where(and(eq(customers.orgId, me.orgId), eq(customers.id, me.customerId)));

    const after = await findCustomer(tx, me.orgId, me.customerId);

    await contactUpdated(tx, systemCaller(me.orgId), 'customer', before, after);

    return profileOf(tx, me.orgId, me.customerId);
  });

export const myLogins = (me: CustomerCaller) =>
  withOrg(me.orgId, async (tx) => ({
    data: (
      await tx
        .select()
        .from(customerLogins)
        .where(
          and(eq(customerLogins.orgId, me.orgId), eq(customerLogins.customerId, me.customerId)),
        )
        .orderBy(asc(customerLogins.createdAt))
    ).map(toLoginDto),
  }));

/** Sends a code to a new address; refused when it already signs someone in. */
export const sendAddLoginCode = (me: CustomerCaller, input: Address) =>
  withOrg(me.orgId, async (tx) => {
    const address = addressOf(input);

    const [organization] = await tx
      .select({ id: organizations.id, name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, me.orgId))
      .limit(1);

    if (!organization) throw notFound('Organisation');

    if (await findLogin(tx, me.orgId, address)) throw loginTaken();

    return sendCode(tx, organization, address, 'add_login', {
      customerId: me.customerId,
      ip: requestInfo().ip,
    });
  });

export const confirmAddLogin = async (me: CustomerCaller, input: Address & { code: string }) => {
  const address = addressOf(input);

  const valid = await withOrg(me.orgId, (tx) =>
    useCode(tx, me.orgId, address, 'add_login', input.code, me.customerId),
  );

  if (!valid) throw invalidCode();

  return withOrg(me.orgId, async (tx) => {
    await lockLogin(tx, me.orgId, address);

    if (await findLogin(tx, me.orgId, address)) throw loginTaken();

    // Another customer's primary email or phone can't become this one's.
    const row = await addLogin(tx, me.orgId, me.customerId, address).catch((error: unknown) => {
      throw pgConstraint(error)?.includes('primary') ? loginTaken() : error;
    });

    return toLoginDto(row);
  });
};

export const removeMyLogin = (me: CustomerCaller, id: string) =>
  withOrg(me.orgId, async (tx) => {
    // One removal at a time per customer: two at once can't remove the last two.
    await lockKey(tx, `customer-logins:${me.orgId}:${me.customerId}`);

    const mine = await tx
      .select({ id: customerLogins.id })
      .from(customerLogins)
      .where(and(eq(customerLogins.orgId, me.orgId), eq(customerLogins.customerId, me.customerId)));

    if (!mine.some((login) => login.id === id)) throw notFound('Login');

    if (mine.length === 1) {
      throw new HttpError(409, 'LAST_LOGIN', 'Add another address before removing your last one');
    }

    await tx.delete(customerLogins).where(eq(customerLogins.id, id));

    return { ok: true as const };
  });

const activeSessions = (me: CustomerCaller) =>
  and(
    eq(customerSessions.orgId, me.orgId),
    eq(customerSessions.customerId, me.customerId),
    isNull(customerSessions.revokedAt),
    gt(customerSessions.expiresAt, sql`now()`),
  );

export const mySessions = (me: CustomerCaller) =>
  withOrg(me.orgId, async (tx) => ({
    data: (
      await tx
        .select()
        .from(customerSessions)
        .where(activeSessions(me))
        .orderBy(desc(customerSessions.lastUsedAt))
    ).map((row): CustomerSession => ({
      id: row.id,
      clientId: row.clientId,
      userAgent: row.userAgent,
      createdAt: row.createdAt.toISOString(),
      lastUsedAt: row.lastUsedAt.toISOString(),
      current: row.id === me.sessionId,
    })),
  }));

export const revokeMySession = (me: CustomerCaller, id: string) =>
  withOrg(me.orgId, async (tx) => {
    const [revoked] = await tx
      .update(customerSessions)
      .set({ revokedAt: sql`now()` })
      .where(and(activeSessions(me), eq(customerSessions.id, id)))
      .returning({ id: customerSessions.id });

    if (!revoked) throw notFound('Session');

    return { ok: true as const };
  });

export const signOutEverywhere = (me: CustomerCaller) =>
  withOrg(me.orgId, async (tx) => {
    await tx
      .update(customerSessions)
      .set({ revokedAt: sql`now()` })
      .where(activeSessions(me));

    return { ok: true as const };
  });
