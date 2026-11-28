import { isEmptyValue } from '@erxes/core-contract';
import type { CustomerSignUpData, Db } from '@erxes/core-db';
import { customerLogins, runAs, system, withOrg } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { requestInfo } from '~/http/requestContext';
import { findCustomer } from '~/modules/customers/customerRows';
import { updateCustomer } from '~/modules/customers/customers.service';
import { findOrCreateCustomer } from '~/modules/customers/findOrCreateCustomer';
import { allValues } from '~/modules/dataExtensions/hostValues.service';
import { accountOf, openSession, type SignInRequest } from './customerAuth.service';
import { issueCode, proveCode } from './customerCodeReplies';
import { type Address, addressOf, invalidCode, type PhoneMethod } from './customerCodes';
import { checkSignUp, customerFieldsOf } from './customerFields';
import { addLogin, findLogin, lockLogin } from './customerLogins';

/** The fields the portal's organisation lets customers fill in, for its forms. */
export const signUpFields = async (request: SignInRequest) => {
  const { portal } = request;

  return withOrg(portal.orgId, async (tx) => ({ data: await customerFieldsOf(tx) }));
};

/**
 * Checks a sign-up form and sends a code to confirm the address, the form kept with it. An
 * address that already has an account gets a code too, the same answer: confirming signs it in.
 */
export const sendSignUpCode = async (
  input: Address & CustomerSignUpData & { method?: PhoneMethod },
  request: SignInRequest,
) => {
  const { portal } = request;
  const signUp = await withOrg(portal.orgId, (tx) => checkSignUp(tx, input));
  const { ip } = requestInfo();

  return issueCode(portal, addressOf(input), 'sign_up', async () => ({ signUp, ip }), input.method);
};

/** What the form adds to a customer erxes already had: only what is still empty, staff's data kept. */
export const fillEmpty = async (tx: Db, customerId: string, form: CustomerSignUpData) => {
  const current = await findCustomer(tx, customerId);
  const kept = await allValues(tx, 'core.customer', customerId);

  const values = Object.fromEntries(
    Object.entries(form.values ?? {}).filter(([key]) => isEmptyValue(kept[key])),
  );

  const changes = {
    ...(!current.firstName && { firstName: form.firstName }),
    ...(!current.lastName && form.lastName && { lastName: form.lastName }),
    ...(!current.birthDate && form.birthDate && { birthDate: form.birthDate }),
    ...(Object.keys(values).length && { values }),
  };

  if (Object.keys(changes).length) await updateCustomer(tx, customerId, changes);
};

/**
 * Confirms a sign-up with its code: the customer (found by the address, else new), their account
 * on the portal, its first login and a session. An address that already had an account signs in.
 */
export const confirmSignUp = async (input: Address & { code: string }, request: SignInRequest) => {
  const { portal } = request;
  const address = addressOf(input);

  const used = await proveCode(portal, address, 'sign_up', input.code);

  if (!used.signUp) throw invalidCode();

  const form = used.signUp;

  return withOrg(portal.orgId, (tx) =>
    runAs(system('customer sign-up'), async () => {
      await lockLogin(tx, portal.id, address);

      const login = await findLogin(tx, portal.id, address);

      if (login) {
        await tx
          .update(customerLogins)
          .set({ lastUsedAt: sql`now()` })
          .where(eq(customerLogins.id, login.id));

        return openSession(tx, portal, address.kind, {
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

      const account = await accountOf(tx, portal.id, customer.id);

      const saved = await addLogin(
        tx,
        { id: account.id, portalId: portal.id, customerId: customer.id },
        address,
      );

      await tx
        .update(customerLogins)
        .set({ lastUsedAt: sql`now()` })
        .where(eq(customerLogins.id, saved.id));

      return openSession(tx, portal, address.kind, {
        accountId: account.id,
        customerId: customer.id,
        signedUp: account.signedUp,
        created,
      });
    }),
  );
};
