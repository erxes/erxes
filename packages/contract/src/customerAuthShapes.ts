import { PORTAL_PHONE_METHODS, PORTAL_PHONE_SIGN_IN } from '@erxes/core-db/enums';
import { customerLogins, customerSessions, customers } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { CustomFields, EmailAddress, Id, ImageAddress, isoDate, PhoneNumber } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { Field } from './fields';

// What customers' sign-in (`customerAuth.ts`) and account (`customerAccount.ts`) procedures share.

/** The fields a request sends along with the address. */
type AlongWith = NonNullable<Parameters<typeof z.object>[0]>;

/** An email address or phone, with more fields. */
export const addressWith = <T extends AlongWith>(fields: T) =>
  z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('email'), value: EmailAddress, ...fields }),
    z.object({ kind: z.literal('phone'), value: PhoneNumber, ...fields }),
  ]);

/**
 * How a phone proves itself, when the portal offers both (`phoneMethods`): `code` texts it a
 * code, `reply` has the customer text one. Left out: `reply` when the portal has it. Emails ignore it.
 */
export const PhoneMethod = z.enum(PORTAL_PHONE_METHODS);

/** The portal signing in (Settings › Portals shows its id); it names the organisation too. */
export const portal = Id;

export const Code = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'the 6-digit code');

/** What a signed-in customer sees and edits of themselves. */
export const CustomerProfile = createSelectSchema(customers, { id: Id, createdAt: isoDate })
  .pick({
    id: true,
    firstName: true,
    lastName: true,
    avatarUrl: true,
    /** `YYYY-MM-DD` */
    birthDate: true,
    primaryEmail: true,
    primaryPhone: true,
    createdAt: true,
  })
  .extend({
    /** Values of the fields customers fill in (`GET /customer-auth/fields`), by field id. */
    customFields: CustomFields,
  });

export type CustomerProfile = z.infer<typeof CustomerProfile>;

export const CustomerProfileFields = createUpdateSchema(customers, {
  firstName: (name) => name.trim().max(100),
  lastName: (name) => name.trim().max(100),
  avatarUrl: () => ImageAddress,
  birthDate: (date) => date.regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
}).pick({ firstName: true, lastName: true, avatarUrl: true, birthDate: true });

/** A field customers fill in themselves, as a sign-up or profile form shows it. */
export const CustomerField = Field.pick({
  id: true,
  code: true,
  label: true,
  description: true,
  type: true,
  validation: true,
  options: true,
  /** Sign-up needs a value. */
  isRequired: true,
});

export type CustomerField = z.infer<typeof CustomerField>;

/** A new customer's sign-up form: their name, and the fields customers may fill. */
export const SignUpForm = {
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional(),
  /** `YYYY-MM-DD` */
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
    .optional(),
  /** Values of `GET /customer-auth/fields`, by field id. */
  customFields: CustomFields.optional(),
};

/** What the customer signs in with: an email, a phone, or Google, Apple or Facebook. */
export const CustomerLogin = createSelectSchema(customerLogins, {
  id: Id,
  createdAt: isoDate,
  lastUsedAt: isoDate,
}).pick({ id: true, kind: true, value: true, createdAt: true, lastUsedAt: true });

export type CustomerLogin = z.infer<typeof CustomerLogin>;

/** Where the account is signed in on its portal: one row per device or browser. */
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

/**
 * On a portal with verify.mn the customer texts the code instead of getting it: show
 * `instruction`, or open `smsUri`, then confirm with the same code once they sent it.
 */
export const CodeReply = z.object({
  /** The number to text: `144773`. */
  to: z.string(),
  /** What to text: the code. */
  text: z.string(),
  /** `sms:144773?body=482916`, opens the phone's messages with the text filled in. */
  smsUri: z.string(),
  /** Says which phone to send it from. */
  instruction: z.string(),
});

export type CodeReply = z.infer<typeof CodeReply>;

export const CodeSent = z.object({
  expiresInSeconds: z.int(),
  /** Null: the code went to the address. */
  reply: CodeReply.nullable(),
});

/** How the portal lets customers sign in, for its sign-in screen and the SDKs it starts. */
export const PortalSignIn = z.object({
  name: z.string(),
  email: z.boolean(),
  /** `code`: a texted code; `reply`: the customer texts one (verify.mn); `reply` when both are on. */
  phone: z.enum(PORTAL_PHONE_SIGN_IN),
  /** Every way a phone can prove itself here, for the screen to offer the customer a choice. */
  phoneMethods: z.array(z.enum(PORTAL_PHONE_METHODS)),
  /** Google's web client id, for Google Identity Services on the web; null: off. */
  googleClientId: z.string().nullable(),
  /** Apple's Services ID, for Sign in with Apple on the web; null: off. */
  appleServicesId: z.string().nullable(),
  /** Facebook's App ID, for the Facebook SDK; null: off. */
  facebookAppId: z.string().nullable(),
});

export type PortalSignIn = z.infer<typeof PortalSignIn>;

export const RefreshToken = z.string().max(200);

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

const {
  CODE_PENDING,
  INVALID_CODE,
  INVALID_FIELD,
  INVALID_SOCIAL_TOKEN,
  INVALID_TOKEN,
  LAST_LOGIN,
  NO_ACCOUNT,
  ORIGIN_NOT_ALLOWED,
  SIGN_IN_UNAVAILABLE,
  TOO_MANY_CODES,
  UNKNOWN_PORTAL,
} = ERRORS;

/** What customers' procedures answer with besides the common errors. */
export const customerBase = oc.errors({
  ...COMMON_ERRORS,
  CODE_PENDING,
  INVALID_CODE,
  INVALID_FIELD,
  INVALID_SOCIAL_TOKEN,
  INVALID_TOKEN,
  LAST_LOGIN,
  NO_ACCOUNT,
  ORIGIN_NOT_ALLOWED,
  SIGN_IN_UNAVAILABLE,
  TOO_MANY_CODES,
  UNKNOWN_PORTAL,
});

/** Tokens for a signed-in account, its customer, and whether erxes made the customer just now. */
export const SignedIn = CustomerTokens.extend({ customer: CustomerProfile, created: z.boolean() });
