import type { coreContract, PluginSignInIdentity } from '@erxes/core-contract';
import {
  type Db,
  newId,
  organizations,
  runAs,
  system,
  userIdentities,
  users,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import type { InferContractRouterInputs } from '@orpc/contract';
import { and, eq, ne, sql } from 'drizzle-orm';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { recordAudit } from '~/modules/audit/audit.service';
import { profileChanges } from '~/modules/users/userProfile';
import { getSession, recordSignedIn, subdomainFromHost } from './auth.service';
import { askProvider, providersOf } from './signInProviders';
import { assertNotLockedOut, twoFactorChallenge } from './twoFactor.service';

type Inputs = InferContractRouterInputs<typeof coreContract>['auth'];

/**
 * The organisation a sign-in is for: named by the request, then the address, then
 * DEFAULT_SUBDOMAIN; with none of them, a self-hosted server's only organisation.
 */
const organizationOf = async (subdomain: string | undefined, host: string | undefined) => {
  const named =
    subdomain?.trim().toLowerCase() || subdomainFromHost(host) || config.auth.defaultSubdomain;

  if (!named && config.saas.enabled) return undefined;

  const rows = await withSystem('sign-in discovery', (tx) =>
    tx
      .select({ id: organizations.id })
      .from(organizations)
      .where(named ? sql`lower(${organizations.subdomain}) = ${named}` : undefined)
      .limit(2),
  );

  return rows.length === 1 ? rows[0]?.id : undefined;
};

/** The sign-in screen's other ways in: the organisation's sign-in providers, by label. */
export const listSignInProviders = async (input: Inputs['signInProviders'], host?: string) => {
  const orgId = await organizationOf(input.subdomain, host);

  const providers = orgId ? await providersOf(orgId) : [];

  return { providers: providers.map(({ plugin, label }) => ({ plugin, label })) };
};

/** The member with the identity's email, when the provider vouches for it: never an owner. */
const memberWithEmail = async (tx: Db, identity: PluginSignInIdentity) => {
  if (!identity.linkByEmail || !identity.email) return undefined;

  const [user] = await tx
    .select()
    .from(users)
    .where(
      and(
        sql`lower(${users.email}) = ${identity.email}`,
        ne(users.role, 'owner'),
        eq(users.isSupport, false),
        eq(users.canSignIn, true),
      ),
    )
    .limit(1);

  return user;
};

/** A new active member, the first time someone signs in through the provider. */
const addMember = async (tx: Db, provider: string, identity: PluginSignInIdentity) => {
  const { email } = identity;

  if (!email) throw fail('EMAIL_REQUIRED', 'Your account there has no email: erxes needs one');

  const [user] = await tx
    .insert(users)
    .values({
      ...profileChanges({ firstName: identity.firstName, lastName: identity.lastName }),
      id: newId(),
      email,
      status: 'active',
    })
    .onConflictDoNothing()
    .returning();

  if (!user) {
    throw fail('TAKEN', `${email} belongs to a member here: sign in with its password`, {
      field: 'email',
    });
  }

  await runAs(system('sign-in'), () =>
    recordAudit(tx, {
      action: 'user.added',
      targetType: 'user',
      targetId: user.id,
      targetLabel: email,
      metadata: { role: user.role, provider },
    }),
  );

  return user;
};

/** The member linked to the identity; the first time, the member with its email or a new one, linked now. */
const memberFor = async (tx: Db, provider: string, identity: PluginSignInIdentity) => {
  const [linked] = await tx
    .select({ user: users })
    .from(userIdentities)
    .innerJoin(users, eq(users.id, userIdentities.userId))
    .where(and(eq(userIdentities.provider, provider), eq(userIdentities.subject, identity.subject)))
    .limit(1);

  if (linked) return linked.user;

  const user = (await memberWithEmail(tx, identity)) ?? (await addMember(tx, provider, identity));

  await tx
    .insert(userIdentities)
    .values({ id: newId(), userId: user.id, provider, subject: identity.subject });

  return user;
};

/** A refused sign-in goes in the organisation's audit log, the member's when known. */
const recordFailure = (
  orgId: string,
  failure: { provider: string; login: string; reason: string; userId?: string },
) =>
  withOrg(orgId, (tx) =>
    runAs(system('sign-in'), () =>
      recordAudit(tx, {
        action: 'auth.sign_in_failed',
        targetType: 'user',
        targetId: failure.userId,
        targetLabel: failure.login,
        metadata: { reason: failure.reason, provider: failure.provider },
      }),
    ),
  );

/**
 * Signs a member in through a sign-in provider: the plugin checks the login and password with its
 * system and says who they are, and core signs in the member linked to them, linking or adding
 * one the first time. Two-factor members still owe the second step.
 */
export const signInWithProvider = async (input: Inputs['signInWithProvider'], host?: string) => {
  const orgId = await organizationOf(input.subdomain, host);

  if (!orgId) throw fail('ORGANIZATION_REQUIRED', 'Sign in at your organisation address');

  const provider = (await providersOf(orgId)).find(({ plugin }) => plugin === input.plugin);

  if (!provider) throw fail('SIGN_IN_UNAVAILABLE', `${input.plugin} doesn't sign members in here`);

  const failure = { provider: provider.plugin, login: input.login };

  const identity = await askProvider(orgId, provider, {
    login: input.login,
    password: input.password,
  });

  if (!identity) {
    await recordFailure(orgId, { ...failure, reason: 'wrong password' });

    throw fail('INVALID_CREDENTIALS', 'Wrong login or password');
  }

  const user = await withOrg(orgId, (tx) => memberFor(tx, provider.plugin, identity));

  await assertNotLockedOut(orgId, user.id);

  if (user.status !== 'active' || !user.canSignIn) {
    const reason = user.canSignIn ? `account ${user.status}` : 'sign-in stopped';

    await recordFailure(orgId, { ...failure, reason, userId: user.id });

    throw fail('INVALID_CREDENTIALS', 'Wrong login or password');
  }

  if (user.totpEnabledAt) {
    return {
      twoFactorRequired: true as const,
      challenge: await twoFactorChallenge(orgId, user.id),
    };
  }

  await recordSignedIn(user, { provider: provider.plugin });

  return getSession(orgId, user.id);
};
