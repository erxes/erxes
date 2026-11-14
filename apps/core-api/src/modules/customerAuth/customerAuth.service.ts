import type { CustomerProfile, CustomerTokens } from '@erxes/core-contract';
import {
  caller,
  customerLogins,
  customers,
  customerSessions,
  type Db,
  newId,
  organizations,
  requestOrgId,
  runAs,
  system,
  withOrg,
} from '@erxes/core-db';
import { and, asc, count, desc, eq, gt, isNull, sql } from 'drizzle-orm';
import { HttpError, notFound, pgConstraint } from '~/http/errors';
import { requestInfo } from '~/http/requestContext';
import { wholeList } from '~/lib/keyset';
import { lockKeys } from '~/lib/locks';
import { contactUpdated } from '~/modules/activities/contactHistory';
import { findCustomer } from '~/modules/customers/customerRows';
import { findOrCreateCustomer } from '~/modules/customers/findOrCreateCustomer';
import { publishCoreEvents } from '~/modules/events/events.service';
import { type AppRequest, appServes, customerAppFor } from './customerApps';
import { type Address, addressOf, invalidCode, sendCode, useCode } from './customerCodes';
import { createSession, revokeSessionToken, rotateSession, sessionOf } from './customerSessions';

/** Which app signs in, and to which organisation (a subdomain, for apps without one in core's address). */
interface AppInput {
  clientId: string;
  organization?: string;
}

/** One sign-up per address at a time (advisory locks span organisations). */
const lockLogin = (tx: Db, address: Address) =>
  lockKeys(tx, [`customer-login:${requestOrgId()}:${address.kind}:${address.value}`]);

const findLogin = (tx: Db, address: Address) =>
  tx
    .select()
    .from(customerLogins)
    .where(and(eq(customerLogins.kind, address.kind), eq(customerLogins.value, address.value)))
    .limit(1)
    .then(([row]) => row);

const loginTaken = () =>
  new HttpError(409, 'LOGIN_TAKEN', 'Someone already signs in with this address');

/** Adds a proven address as a login, and to the customer's emails or phones. */
const addLogin = async (tx: Db, customerId: string, address: Address) => {
  const [row] = await tx
    .insert(customerLogins)
    .values({ id: newId(), customerId, kind: address.kind, value: address.value })
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
    .where(eq(customers.id, customerId));

  return row;
};

/**
 * The customer who signs in with this proven address: its login's, else the
 * customer who already has the address (it becomes their login), else a new one.
 */
const customerForLogin = async (tx: Db, address: Address) => {
  await lockLogin(tx, address);

  const login = await findLogin(tx, address);

  if (login) {
    await tx
      .update(customerLogins)
      .set({ lastUsedAt: sql`now()` })
      .where(eq(customerLogins.id, login.id));

    return { customerId: login.customerId, created: false, signedUp: false };
  }

  const { customer, created } = await findOrCreateCustomer(tx, {
    ...(address.kind === 'email'
      ? { primaryEmail: address.value }
      : { primaryPhone: address.value }),
    source: 'sign_in',
  });

  const [existing] = await tx
    .select({ logins: count() })
    .from(customerLogins)
    .where(eq(customerLogins.customerId, customer.id));

  const saved = await addLogin(tx, customer.id, address);

  await tx
    .update(customerLogins)
    .set({ lastUsedAt: sql`now()` })
    .where(eq(customerLogins.id, saved.id));

  return { customerId: customer.id, created, signedUp: !existing?.logins };
};

/** Sends a sign-in code; the answer is the same whether or not the address has an account. */
export const sendSignInCode = async (input: Address & AppInput, request: AppRequest) => {
  const { organization } = await customerAppFor(input, request);

  return withOrg(organization.id, (tx) =>
    sendCode(tx, organization, addressOf(input), 'sign_in', { ip: requestInfo().ip }),
  );
};

/** Signs in (or up) with a code: a new session in the app, and its tokens. */
export const signInWithCode = async (
  input: Address & AppInput & { code: string },
  request: AppRequest,
) => {
  const { clientId, organization } = await customerAppFor(input, request);
  const address = addressOf(input);

  // Its own transaction: a wrong try counts even though this call fails.
  const valid = await withOrg(organization.id, (tx) => useCode(tx, address, 'sign_in', input.code));

  if (!valid) throw invalidCode();

  // Core signs the customer in (or up) on its own: nobody is signed in yet.
  return withOrg(organization.id, (tx) =>
    runAs(system('customer sign-in'), async () => {
      const { customerId, created, signedUp } = await customerForLogin(tx, address);

      const { ip, userAgent } = requestInfo();

      const tokens = await createSession(tx, {
        orgId: organization.id,
        customerId,
        clientId,
        userAgent,
        ip,
      });

      const subject = { type: 'customer' as const, id: customerId };
      const payload = { kind: address.kind, app: clientId };

      await publishCoreEvents(tx, [
        ...(signedUp ? [{ type: 'core.customer.signed_up', subject, payload }] : []),
        { type: 'core.customer.signed_in', subject, payload },
      ]);

      return { ...tokens, customer: await findCustomer(tx, customerId), created };
    }),
  );
};

const invalidToken = () =>
  new HttpError(401, 'INVALID_TOKEN', 'The refresh token is not valid: sign in again');

/** New tokens for the app's refresh token, while the app still serves the organisation. */
export const refreshTokens = async (
  input: { clientId: string; refreshToken: string },
  request: AppRequest,
): Promise<CustomerTokens> => {
  const found = await sessionOf(input.refreshToken);

  if (
    !found ||
    found.row.clientId !== input.clientId ||
    !(await appServes(found.row.clientId, found.row.orgId, request.origin))
  ) {
    throw invalidToken();
  }

  const tokens = await rotateSession(found);

  if (!tokens) throw invalidToken();

  return tokens;
};

export const signOut = async (refreshToken: string) => {
  await revokeSessionToken(refreshToken);

  return { ok: true as const };
};

// The signed-in customer (`caller('customer')`), in their organisation's scope.

export const myProfile = () =>
  withOrg(requestOrgId(), (tx) => findCustomer(tx, caller('customer').customerId));

export const updateMyProfile = (
  changes: Partial<Pick<CustomerProfile, 'firstName' | 'lastName' | 'avatarUrl' | 'birthDate'>>,
) =>
  withOrg(requestOrgId(), async (tx) => {
    const { customerId } = caller('customer');
    const before = await findCustomer(tx, customerId);

    await tx
      .update(customers)
      .set({ ...changes, updatedAt: sql`now()` })
      .where(eq(customers.id, customerId));

    const after = await findCustomer(tx, customerId);

    await contactUpdated(tx, 'customer', before, after);

    return after;
  });

export const myLogins = () =>
  withOrg(requestOrgId(), async (tx) => ({
    data: await wholeList((limit) =>
      tx
        .select()
        .from(customerLogins)
        .where(eq(customerLogins.customerId, caller('customer').customerId))
        .orderBy(asc(customerLogins.createdAt))
        .limit(limit),
    ),
  }));

/** Sends a code to a new address; refused when it already signs someone in. */
export const sendAddLoginCode = (input: Address) =>
  withOrg(requestOrgId(), async (tx) => {
    const address = addressOf(input);

    const [organization] = await tx
      .select({ id: organizations.id, name: organizations.name })
      .from(organizations)
      .limit(1);

    if (!organization) throw notFound('Organisation');

    if (await findLogin(tx, address)) throw loginTaken();

    return sendCode(tx, organization, address, 'add_login', {
      customerId: caller('customer').customerId,
      ip: requestInfo().ip,
    });
  });

export const confirmAddLogin = async (input: Address & { code: string }) => {
  const { customerId } = caller('customer');
  const address = addressOf(input);

  const valid = await withOrg(requestOrgId(), (tx) =>
    useCode(tx, address, 'add_login', input.code, customerId),
  );

  if (!valid) throw invalidCode();

  return withOrg(requestOrgId(), async (tx) => {
    await lockLogin(tx, address);

    if (await findLogin(tx, address)) throw loginTaken();

    // Another customer's primary email or phone can't become this one's.
    return addLogin(tx, customerId, address).catch((error: unknown) => {
      throw pgConstraint(error)?.includes('primary') ? loginTaken() : error;
    });
  });
};

export const removeMyLogin = (id: string) =>
  withOrg(requestOrgId(), async (tx) => {
    const { customerId } = caller('customer');

    // One removal at a time per customer: two at once can't remove the last two.
    await lockKeys(tx, [`customer-logins:${requestOrgId()}:${customerId}`]);

    const mine = await tx
      .select({ id: customerLogins.id })
      .from(customerLogins)
      .where(eq(customerLogins.customerId, customerId));

    if (!mine.some((login) => login.id === id)) throw notFound('Login');

    if (mine.length === 1) {
      throw new HttpError(409, 'LAST_LOGIN', 'Add another address before removing your last one');
    }

    await tx.delete(customerLogins).where(eq(customerLogins.id, id));

    return { ok: true as const };
  });

/** The signed-in customer's live sessions. */
const activeSessions = () =>
  and(
    eq(customerSessions.customerId, caller('customer').customerId),
    isNull(customerSessions.revokedAt),
    gt(customerSessions.expiresAt, sql`now()`),
  );

export const mySessions = () =>
  withOrg(requestOrgId(), async (tx) => ({
    data: (
      await wholeList((limit) =>
        tx
          .select()
          .from(customerSessions)
          .where(activeSessions())
          .orderBy(desc(customerSessions.lastUsedAt))
          .limit(limit),
      )
    ).map((row) => ({ ...row, current: row.id === caller('customer').sessionId })),
  }));

export const revokeMySession = (id: string) =>
  withOrg(requestOrgId(), async (tx) => {
    const [revoked] = await tx
      .update(customerSessions)
      .set({ revokedAt: sql`now()` })
      .where(and(activeSessions(), eq(customerSessions.id, id)))
      .returning({ id: customerSessions.id });

    if (!revoked) throw notFound('Session');

    return { ok: true as const };
  });

export const signOutEverywhere = () =>
  withOrg(requestOrgId(), async (tx) => {
    await tx
      .update(customerSessions)
      .set({ revokedAt: sql`now()` })
      .where(activeSessions());

    return { ok: true as const };
  });
