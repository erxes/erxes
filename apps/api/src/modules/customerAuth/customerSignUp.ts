import type { CustomValue, CustomerSignUpData, Db } from '@erxes/core-db';
import { customerLogins, runAs, system, withOrg } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { requestInfo } from '~/http/requestContext';
import { findCustomer } from '~/modules/customers/customerRows';
import { updateCustomer } from '~/modules/customers/customers.service';
import { findOrCreateCustomer } from '~/modules/customers/findOrCreateCustomer';
import { accountOf, openSession, type SignInRequest } from './customerAuth.service';
import { type Address, addressOf, invalidCode, sendCode, useCode } from './customerCodes';
import { checkSignUp, customerFieldsOf } from './customerFields';
import { addLogin, findLogin, lockLogin } from './customerLogins';
import { accountBlocked } from './customerSessions';
import { websiteFor } from './customerWebsites';

/** The fields the website's organisation lets customers fill in, for its forms. */
export const signUpFields = async (input: { website: string }, request: SignInRequest) => {
  const website = await websiteFor(input.website, request.origin);

  return withOrg(website.orgId, async (tx) => ({ data: await customerFieldsOf(tx) }));
};

/**
 * Checks a sign-up form and sends a code to confirm the address, the form kept with it. An
 * address that already has an account gets a code too, the same answer: confirming signs it in.
 */
export const sendSignUpCode = async (
  input: Address & CustomerSignUpData & { website: string },
  request: SignInRequest,
) => {
  const website = await websiteFor(input.website, request.origin);

  return withOrg(website.orgId, async (tx) =>
    sendCode(tx, website, addressOf(input), 'sign_up', {
      signUp: await checkSignUp(tx, input),
      ip: requestInfo().ip,
    }),
  );
};

/** What the form adds to a customer erxes already had: only what is still empty, staff's data kept. */
const fillEmpty = async (tx: Db, customerId: string, form: CustomerSignUpData) => {
  const current = await findCustomer(tx, customerId);

  const customFields: Record<string, CustomValue> = Object.fromEntries(
    Object.entries(form.customFields ?? {}).filter(([id]) => !(id in current.customFields)),
  );

  const changes = {
    ...(!current.firstName && { firstName: form.firstName }),
    ...(!current.lastName && form.lastName && { lastName: form.lastName }),
    ...(!current.birthDate && form.birthDate && { birthDate: form.birthDate }),
    ...(Object.keys(customFields).length && { customFields }),
  };

  if (Object.keys(changes).length) await updateCustomer(tx, customerId, changes);
};

/**
 * Confirms a sign-up with its code: the customer (found by the address, else new), their account
 * on the website, its first login and a session. An address that already had an account signs in.
 */
export const confirmSignUp = async (
  input: Address & { website: string; code: string },
  request: SignInRequest,
) => {
  const website = await websiteFor(input.website, request.origin);
  const address = addressOf(input);

  // Its own transaction: a wrong try counts even though this call fails.
  const used = await withOrg(website.orgId, (tx) =>
    useCode(tx, website.id, address, 'sign_up', input.code),
  );

  if (!used?.signUp) throw invalidCode();

  const form = used.signUp;

  return withOrg(website.orgId, (tx) =>
    runAs(system('customer sign-up'), async () => {
      await lockLogin(tx, website.id, address);

      const login = await findLogin(tx, website.id, address);

      if (login) {
        if (login.status === 'blocked') throw accountBlocked();

        await tx
          .update(customerLogins)
          .set({ lastUsedAt: sql`now()` })
          .where(eq(customerLogins.id, login.id));

        return openSession(tx, website, address, {
          accountId: login.accountId,
          customerId: login.customerId,
          signedUp: false,
          created: false,
        });
      }

      const { customer, created } = await findOrCreateCustomer(tx, {
        ...(address.kind === 'email'
          ? { primaryEmail: address.value }
          : { primaryPhone: address.value }),
        source: 'sign_in',
      });

      await fillEmpty(tx, customer.id, form);

      const account = await accountOf(tx, website.id, customer.id);

      if (account.status === 'blocked') throw accountBlocked();

      const saved = await addLogin(
        tx,
        { id: account.id, websiteId: website.id, customerId: customer.id },
        address,
      );

      await tx
        .update(customerLogins)
        .set({ lastUsedAt: sql`now()` })
        .where(eq(customerLogins.id, saved.id));

      return openSession(tx, website, address, {
        accountId: account.id,
        customerId: customer.id,
        signedUp: account.signedUp,
        created,
      });
    }),
  );
};
