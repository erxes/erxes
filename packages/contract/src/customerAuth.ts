import {
  CUSTOMER_LOGIN_KINDS,
  customerLogins,
  customerSessions,
  customers,
} from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { EmailAddress, Id, ImageAddress, isoDate, PhoneNumber } from './common';

/** Sign in with a code sent to an email address or a phone. */
export const CustomerLoginKind = z.enum(CUSTOMER_LOGIN_KINDS);

/** The fields a request sends along with the address. */
type AlongWith = NonNullable<Parameters<typeof z.object>[0]>;

/** An email address or phone, with more fields. */
const addressWith = <T extends AlongWith>(fields: T) =>
  z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('email'), value: EmailAddress, ...fields }),
    z.object({ kind: z.literal('phone'), value: PhoneNumber, ...fields }),
  ]);

/** The organisation's subdomain; defaults to the one in the address core is reached at. */
const organization = z.string().trim().toLowerCase().max(63).optional();

const Code = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'the 6-digit code');

/** What a signed-in customer sees and edits of themselves. */
export const CustomerProfile = createSelectSchema(customers, { id: Id, createdAt: isoDate }).pick({
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  /** `YYYY-MM-DD` */
  birthDate: true,
  primaryEmail: true,
  primaryPhone: true,
  createdAt: true,
});

export type CustomerProfile = z.infer<typeof CustomerProfile>;

const CustomerProfileFields = createUpdateSchema(customers, {
  firstName: (name) => name.trim().max(100),
  lastName: (name) => name.trim().max(100),
  avatarUrl: () => ImageAddress,
  birthDate: (date) => date.regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
}).pick({ firstName: true, lastName: true, avatarUrl: true, birthDate: true });

/** An email address or phone the customer signs in with. */
export const CustomerLogin = createSelectSchema(customerLogins, {
  id: Id,
  createdAt: isoDate,
  lastUsedAt: isoDate,
}).pick({ id: true, kind: true, value: true, createdAt: true, lastUsedAt: true });

export type CustomerLogin = z.infer<typeof CustomerLogin>;

/** Where the customer is signed in: core's sign-in page in a browser, or a plugin's app. */
export const CustomerSession = createSelectSchema(customerSessions, {
  id: Id,
  createdAt: isoDate,
  lastUsedAt: isoDate,
})
  .pick({
    id: true,
    /** The plugin whose app it is; null: the browser on the sign-in page. */
    clientId: true,
    userAgent: true,
    createdAt: true,
    lastUsedAt: true,
  })
  .extend({ current: z.boolean() });

export type CustomerSession = z.infer<typeof CustomerSession>;

const CodeSent = z.object({ expiresInSeconds: z.int() });

/**
 * Customers sign in with a one-time code (decision 42). Public: the sign-in
 * page calls these, then sends the browser back to `/customer-oauth/authorize`.
 */
export const customerAuthContract = {
  config: oc
    .route({
      method: 'GET',
      path: '/customer-auth/config',
      summary:
        'What the sign-in page shows: the organisation and the ways to sign in. 404 NOT_FOUND',
    })
    .input(z.object({ organization }))
    .output(
      z.object({
        organization: z.object({ name: z.string(), subdomain: z.string() }),
        kinds: z.array(CustomerLoginKind),
      }),
    ),
  sendCode: oc
    .route({
      method: 'POST',
      path: '/customer-auth/code',
      successStatus: 202,
      summary:
        'Send a sign-in code to an email address or phone; the same answer whether or not it has an account. 429 TOO_MANY_CODES',
    })
    .input(addressWith({ organization }))
    .output(CodeSent),
  signIn: oc
    .route({
      method: 'POST',
      path: '/customer-auth/sign-in',
      summary:
        'Sign in (or up) with the code; sets the customer cookie. 400 INVALID_CODE (wrong, used, expired or 5 tries)',
    })
    .input(addressWith({ organization, code: Code }))
    .output(z.object({ customer: CustomerProfile, created: z.boolean() })),
  signOut: oc
    .route({
      method: 'POST',
      path: '/customer-auth/sign-out',
      summary: "Sign out of the sign-in page's browser session; apps stay signed in",
    })
    .output(z.object({ ok: z.literal(true) })),
};

/** The signed-in customer (`Authorization: Bearer` with a customer access token). */
export const customerAccountContract = {
  me: oc
    .route({ method: 'GET', path: '/customer/me', summary: "The signed-in customer's profile" })
    .output(CustomerProfile),
  update: oc
    .route({ method: 'PATCH', path: '/customer/me', summary: 'Change name, picture or birth date' })
    .input(CustomerProfileFields)
    .output(CustomerProfile),
  logins: oc
    .route({ method: 'GET', path: '/customer/me/logins', summary: 'Addresses I sign in with' })
    .output(z.object({ data: z.array(CustomerLogin) })),
  addLogin: oc
    .route({
      method: 'POST',
      path: '/customer/me/logins',
      successStatus: 202,
      summary:
        'Send a code to a new address to sign in with. 409 LOGIN_TAKEN when it is already a login, 429 TOO_MANY_CODES',
    })
    .input(addressWith({}))
    .output(CodeSent),
  confirmLogin: oc
    .route({
      method: 'POST',
      path: '/customer/me/logins/confirm',
      successStatus: 201,
      summary: 'Add the address with its code. 400 INVALID_CODE, 409 LOGIN_TAKEN',
    })
    .input(addressWith({ code: Code }))
    .output(CustomerLogin),
  removeLogin: oc
    .route({
      method: 'DELETE',
      path: '/customer/me/logins/{id}',
      summary: 'Stop signing in with an address. 409 LAST_LOGIN',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  sessions: oc
    .route({ method: 'GET', path: '/customer/me/sessions', summary: 'Where I am signed in' })
    .output(z.object({ data: z.array(CustomerSession) })),
  revokeSession: oc
    .route({
      method: 'DELETE',
      path: '/customer/me/sessions/{id}',
      summary: 'Sign out one browser or app',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  signOutEverywhere: oc
    .route({
      method: 'POST',
      path: '/customer/me/sign-out-everywhere',
      summary: 'Sign out of every browser and app (access tokens end within 15 minutes)',
    })
    .output(z.object({ ok: z.literal(true) })),
};
