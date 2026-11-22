import { customerLogins, customerSessions, customers } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { EmailAddress, Id, ImageAddress, isoDate, PhoneNumber, listOf } from './common';

/** The fields a request sends along with the address. */
type AlongWith = NonNullable<Parameters<typeof z.object>[0]>;

/** An email address or phone, with more fields. */
const addressWith = <T extends AlongWith>(fields: T) =>
  z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('email'), value: EmailAddress, ...fields }),
    z.object({ kind: z.literal('phone'), value: PhoneNumber, ...fields }),
  ]);

/** The website signing in (`websites.save` gives its id); it names the organisation too. */
const website = Id;

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

/** Where the account is signed in on its website: one row per device or browser. */
export const CustomerSession = createSelectSchema(customerSessions, {
  id: Id,
  createdAt: isoDate,
  lastUsedAt: isoDate,
})
  .pick({
    id: true,
    userAgent: true,
    createdAt: true,
    lastUsedAt: true,
  })
  .extend({ current: z.boolean() });

export type CustomerSession = z.infer<typeof CustomerSession>;

const CodeSent = z.object({ expiresInSeconds: z.int() });

const RefreshToken = z.string().max(200);

/** The app's tokens: a 15-minute access token and a refresh token that rotates on each use. */
export const CustomerTokens = z.object({
  /** `Authorization: Bearer` for core's `/customer/*` and every plugin's `/customer/*`. */
  accessToken: z.string(),
  /** Trade it at `/customer-auth/refresh`; it lasts 90 days from its last use. */
  refreshToken: z.string(),
  /** Seconds the access token works. */
  expiresIn: z.int(),
});

export type CustomerTokens = z.infer<typeof CustomerTokens>;

/**
 * Customers sign in to a website with a one-time code (decision 42): the
 * website's own form calls these. Public; browsers only from the website's origins.
 */
const {
  ACCOUNT_BLOCKED,
  INVALID_CODE,
  INVALID_TOKEN,
  LAST_LOGIN,
  ORIGIN_NOT_ALLOWED,
  SIGN_IN_UNAVAILABLE,
  TOO_MANY_CODES,
  UNKNOWN_WEBSITE,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  ACCOUNT_BLOCKED,
  INVALID_CODE,
  INVALID_TOKEN,
  LAST_LOGIN,
  ORIGIN_NOT_ALLOWED,
  SIGN_IN_UNAVAILABLE,
  TOO_MANY_CODES,
  UNKNOWN_WEBSITE,
});

export const customerAuthContract = {
  sendCode: base
    .route({
      method: 'POST',
      path: '/customer-auth/code',
      successStatus: 202,
      summary:
        'Send a code for signing in to the website to an email address or phone; the same answer whether or not it has an account. 400 UNKNOWN_WEBSITE, 400 SIGN_IN_UNAVAILABLE (no SMS provider for phones), 403 ORIGIN_NOT_ALLOWED, 429 TOO_MANY_CODES',
    })
    .input(addressWith({ website }))
    .output(CodeSent),
  signIn: base
    .route({
      method: 'POST',
      path: '/customer-auth/sign-in',
      summary:
        'Sign in (or up) to the website with the code and get its tokens. 400 INVALID_CODE (wrong, used, expired or 5 tries), 400 UNKNOWN_WEBSITE, 403 ACCOUNT_BLOCKED, 403 ORIGIN_NOT_ALLOWED',
    })
    .input(addressWith({ website, code: Code }))
    .output(CustomerTokens.extend({ customer: CustomerProfile, created: z.boolean() })),
  refresh: base
    .route({
      method: 'POST',
      path: '/customer-auth/refresh',
      summary:
        'New tokens for a refresh token; the old one stops working, and using it again ends the session. 401 INVALID_TOKEN, 403 ACCOUNT_BLOCKED, 403 ORIGIN_NOT_ALLOWED',
    })
    .input(z.object({ refreshToken: RefreshToken }))
    .output(CustomerTokens),
  signOut: base
    .route({
      method: 'POST',
      path: '/customer-auth/sign-out',
      summary: "End the refresh token's session; the answer is ok either way",
    })
    .input(z.object({ refreshToken: RefreshToken }))
    .output(z.object({ ok: z.literal(true) })),
};

/** The signed-in customer (`Authorization: Bearer` with a customer access token). */
export const customerAccountContract = {
  me: base
    .route({ method: 'GET', path: '/customer/me', summary: "The signed-in customer's profile" })
    .output(CustomerProfile),
  update: base
    .route({ method: 'PATCH', path: '/customer/me', summary: 'Change name, picture or birth date' })
    .input(CustomerProfileFields)
    .output(CustomerProfile),
  logins: base
    .route({ method: 'GET', path: '/customer/me/logins', summary: 'Addresses I sign in with' })
    .output(listOf(CustomerLogin)),
  addLogin: base
    .route({
      method: 'POST',
      path: '/customer/me/logins',
      successStatus: 202,
      summary:
        'Send a code to a new address to sign in to this website with; the same answer when the address is taken. 400 SIGN_IN_UNAVAILABLE, 429 TOO_MANY_CODES',
    })
    .input(addressWith({}))
    .output(CodeSent),
  confirmLogin: base
    .route({
      method: 'POST',
      path: '/customer/me/logins/confirm',
      successStatus: 201,
      summary: 'Add the address with its code. 400 INVALID_CODE, 409 TAKEN',
    })
    .input(addressWith({ code: Code }))
    .output(CustomerLogin),
  removeLogin: base
    .route({
      method: 'DELETE',
      path: '/customer/me/logins/{id}',
      summary: 'Stop signing in with an address. 409 LAST_LOGIN',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  sessions: base
    .route({ method: 'GET', path: '/customer/me/sessions', summary: 'Where I am signed in' })
    .output(listOf(CustomerSession)),
  revokeSession: base
    .route({
      method: 'DELETE',
      path: '/customer/me/sessions/{id}',
      summary: 'Sign out one device or browser',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  signOutEverywhere: base
    .route({
      method: 'POST',
      path: '/customer/me/sign-out-everywhere',
      summary: 'Sign out of this website everywhere (access tokens end within 15 minutes)',
    })
    .output(z.object({ ok: z.literal(true) })),
};
