import {
  type CUSTOMER_SOCIAL_PROVIDERS,
  type CustomerSignUpData,
  customerLogins,
  type Db,
  runAs,
  system,
  withOrg,
} from '@erxes/core-db';
import { SocialTokenError, type SocialIdentity } from '@erxes/plugin-sdk/integrations';
import { eq, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { normalizeEmail } from '~/lib/contacts';
import { logger } from '~/logger';
import { findOrCreateCustomer } from '~/modules/customers/findOrCreateCustomer';
import { accountOf, openSession, type SignInRequest } from './customerAuth.service';
import { checkSignUp } from './customerFields';
import { addLogin, findLogin, lockLogin, type Login } from './customerLogins';
import type { LivePortal } from './customerPortals';
import { fillEmpty } from './customerSignUp';
import { socialSignInOf } from './signInConnections';

const log = logger.child({ component: 'customer-social' });

type Provider = (typeof CUSTOMER_SOCIAL_PROVIDERS)[number];

const SERVICE = { google: 'Google', apple: 'Apple', facebook: 'Facebook' } as const;

interface SocialInput extends Partial<CustomerSignUpData> {
  provider: Provider;
  token: string;
  nonce?: string;
}

const connectionOf = (portal: LivePortal, provider: Provider) =>
  ({
    google: portal.googleConnectionId,
    apple: portal.appleConnectionId,
    facebook: portal.facebookConnectionId,
  })[provider];

/** Who the token is for, as the service vouches: asked before any transaction opens. */
const identify = async (portal: LivePortal, input: SocialInput) => {
  const connectionId = connectionOf(portal, input.provider);

  if (!connectionId) {
    throw fail(
      'SIGN_IN_UNAVAILABLE',
      `This portal doesn't sign in with ${SERVICE[input.provider]}`,
    );
  }

  const { socialSignIn, client } = await socialSignInOf(portal.orgId, connectionId);

  return socialSignIn
    .identify(client, {
      token: input.token,
      ...(input.nonce && { nonce: input.nonce }),
      // Apple's iOS apps sign in for their bundle ids.
      audiences: input.provider === 'apple' ? portal.iosBundleIds : [],
    })
    .catch((error: unknown) => {
      if (error instanceof SocialTokenError) throw fail('INVALID_SOCIAL_TOKEN', error.message);

      log.warn({ err: error, provider: input.provider }, 'social sign-in not checked');

      throw fail('SIGN_IN_UNAVAILABLE', `${SERVICE[input.provider]} didn't answer: try again`);
    });
};

const touch = (tx: Db, loginId: string) =>
  tx
    .update(customerLogins)
    .set({ lastUsedAt: sql`now()` })
    .where(eq(customerLogins.id, loginId));

/**
 * The first sign-in with this account: joins the portal's account with the email the service
 * checked, else makes the account (and the customer, found by that email when there is one)
 * with the sign-up fields checked.
 */
const firstSignIn = async (
  tx: Db,
  portal: LivePortal,
  social: Login,
  identity: SocialIdentity,
  input: SocialInput,
) => {
  const email = identity.emailVerified && identity.email ? normalizeEmail(identity.email) : null;
  const emailLogin: Login | null = email ? { kind: 'email', value: email } : null;

  if (emailLogin) {
    await lockLogin(tx, portal.id, emailLogin);

    const byEmail = await findLogin(tx, portal.id, emailLogin);

    if (byEmail) {
      const { id } = await addLogin(
        tx,
        { id: byEmail.accountId, portalId: portal.id, customerId: byEmail.customerId },
        social,
      );

      await touch(tx, id);

      return {
        accountId: byEmail.accountId,
        customerId: byEmail.customerId,
        signedUp: false,
        created: false,
      };
    }
  }

  const form = await checkSignUp(tx, {
    firstName: input.firstName ?? identity.firstName ?? '',
    lastName: input.lastName ?? identity.lastName,
    birthDate: input.birthDate,
    values: input.values,
  });

  const { customer, created } = await findOrCreateCustomer(tx, {
    ...(email && { primaryEmail: email }),
    source: 'sign_in',
  });

  await fillEmpty(tx, customer.id, form);

  const account = await accountOf(tx, portal.id, customer.id);
  const ids = { id: account.id, portalId: portal.id, customerId: customer.id };
  const { id } = await addLogin(tx, ids, social);

  await touch(tx, id);

  if (emailLogin) await addLogin(tx, ids, emailLogin);

  return { accountId: account.id, customerId: customer.id, signedUp: account.signedUp, created };
};

/**
 * Signs in with Google, Apple or Facebook: the service's account is the login. The first time
 * it joins or makes the portal's account (`firstSignIn`).
 */
export const signInWithSocial = async (input: SocialInput, request: SignInRequest) => {
  const { portal } = request;
  const identity = await identify(portal, input);
  const social: Login = { kind: input.provider, value: identity.subject };

  return withOrg(portal.orgId, (tx) =>
    runAs(system('customer social sign-in'), async () => {
      await lockLogin(tx, portal.id, social);

      const login = await findLogin(tx, portal.id, social);

      if (login) {
        await touch(tx, login.id);

        return openSession(tx, portal, input.provider, {
          accountId: login.accountId,
          customerId: login.customerId,
          signedUp: false,
          created: false,
        });
      }

      return openSession(
        tx,
        portal,
        input.provider,
        await firstSignIn(tx, portal, social, identity, input),
      );
    }),
  );
};
