import { customerLogins, customerSessions, customers } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { EmailAddress, Id, ImageAddress, isoDate, PhoneNumber, listOf } from './common';
import { PluginName } from './plugins';

/** The fields a request sends along with the address. */
type AlongWith = NonNullable<Parameters<typeof z.object>[0]>;

/** An email address or phone, with more fields. */
const addressWith = <T extends AlongWith>(fields: T) =>
  z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('email'), value: EmailAddress, ...fields }),
    z.object({ kind: z.literal('phone'), value: PhoneNumber, ...fields }),
  ]);

/**
 * The organisation's subdomain, for apps that reach core at an address without
 * one (mobile apps); the subdomain in core's address wins.
 */
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

/** Where the customer is signed in: one row per sign-in to an app. */
export const CustomerSession = createSelectSchema(customerSessions, {
  id: Id,
  createdAt: isoDate,
  lastUsedAt: isoDate,
})
  .pick({
    id: true,
    /** The plugin whose app it is. */
    clientId: true,
    userAgent: true,
    createdAt: true,
    lastUsedAt: true,
  })
  .extend({ current: z.boolean() });

export type CustomerSession = z.infer<typeof CustomerSession>;

const CodeSent = z.object({ expiresInSeconds: z.int() });

/** The plugin whose customer app calls: its name, with `customerApp` in its manifest. */
const clientId = PluginName;

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
 * Customers sign in to a plugin's app with a one-time code (decision 42): the
 * app's own form calls these. Public; browsers only from the app's origins.
 */
const {
  INVALID_CODE,
  INVALID_CREDENTIALS,
  INVALID_TOKEN,
  LAST_LOGIN,
  NOTHING_TO_RETRY,
  ORGANIZATION_REQUIRED,
  ORIGIN_NOT_ALLOWED,
  SUBJECT_REQUIRED,
  TOO_MANY_ATTEMPTS,
  TOO_MANY_CODES,
  UNKNOWN_APP,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  INVALID_CODE,
  INVALID_CREDENTIALS,
  INVALID_TOKEN,
  LAST_LOGIN,
  NOTHING_TO_RETRY,
  ORGANIZATION_REQUIRED,
  ORIGIN_NOT_ALLOWED,
  SUBJECT_REQUIRED,
  TOO_MANY_ATTEMPTS,
  TOO_MANY_CODES,
  UNKNOWN_APP,
});

export const customerAuthContract = {
  sendCode: base
    .route({
      method: 'POST',
      path: '/customer-auth/code',
      successStatus: 202,
      summary:
        'Send a sign-in code to an email address or phone; the same answer whether or not it has an account. 400 UNKNOWN_APP, 403 ORIGIN_NOT_ALLOWED, 429 TOO_MANY_CODES',
    })
    .input(addressWith({ clientId, organization }))
    .output(CodeSent),
  signIn: base
    .route({
      method: 'POST',
      path: '/customer-auth/sign-in',
      summary:
        "Sign in (or up) with the code and get the app's tokens. 400 INVALID_CODE (wrong, used, expired or 5 tries), 400 UNKNOWN_APP, 403 ORIGIN_NOT_ALLOWED",
    })
    .input(addressWith({ clientId, organization, code: Code }))
    .output(CustomerTokens.extend({ customer: CustomerProfile, created: z.boolean() })),
  refresh: base
    .route({
      method: 'POST',
      path: '/customer-auth/refresh',
      summary:
        'New tokens for a refresh token; the old one stops working, and using it again ends the session. 401 INVALID_TOKEN, 403 ORIGIN_NOT_ALLOWED',
    })
    .input(z.object({ clientId, refreshToken: RefreshToken }))
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
        'Send a code to a new address to sign in with. 409 LOGIN_TAKEN when it is already a login, 429 TOO_MANY_CODES',
    })
    .input(addressWith({}))
    .output(CodeSent),
  confirmLogin: base
    .route({
      method: 'POST',
      path: '/customer/me/logins/confirm',
      successStatus: 201,
      summary: 'Add the address with its code. 400 INVALID_CODE, 409 LOGIN_TAKEN',
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
      summary: 'Sign out one app',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  signOutEverywhere: base
    .route({
      method: 'POST',
      path: '/customer/me/sign-out-everywhere',
      summary: 'Sign out of every app (access tokens end within 15 minutes)',
    })
    .output(z.object({ ok: z.literal(true) })),
};
