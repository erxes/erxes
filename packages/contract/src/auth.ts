import { LANGUAGES } from '@erxes/core-db/enums';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { z } from 'zod';
import { isoDate } from './common';
import { NewPassword } from './values';
import { Organization, OrganizationRegion } from './organizations';
import { User } from './users';

export const Session = z.object({
  user: User,
  organization: Organization,
  /** What the member may do (actions); owners have every one. */
  permissions: z.array(z.string()),
});

export type Session = z.infer<typeof Session>;

const {
  ALREADY_ENABLED,
  BEYOND_OWN_PERMISSIONS,
  BUILTIN_ROLE,
  CHALLENGE_EXPIRED,
  CROSS_SITE,
  FIXED_ROLE,
  INVALID_CREDENTIALS,
  INVALID_LINK,
  LIMIT_EXCEEDED,
  NOT_ENABLED,
  NOT_INVITED,
  NOT_SET_UP,
  ORGANIZATION_REQUIRED,
  OWNER_ONLY_PERMISSION,
  ROLE_IN_USE,
  ROLE_NOT_FOUND,
  SAME_PASSWORD,
  SETUP_DISABLED,
  SETUP_DONE,
  TOO_MANY_ATTEMPTS,
  UNKNOWN_PERMISSION,
  WRONG_CODE,
  WRONG_PASSWORD,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  ALREADY_ENABLED,
  BEYOND_OWN_PERMISSIONS,
  BUILTIN_ROLE,
  CHALLENGE_EXPIRED,
  CROSS_SITE,
  FIXED_ROLE,
  INVALID_CREDENTIALS,
  INVALID_LINK,
  LIMIT_EXCEEDED,
  NOT_ENABLED,
  NOT_INVITED,
  NOT_SET_UP,
  ORGANIZATION_REQUIRED,
  OWNER_ONLY_PERMISSION,
  ROLE_IN_USE,
  ROLE_NOT_FOUND,
  SAME_PASSWORD,
  SETUP_DISABLED,
  SETUP_DONE,
  TOO_MANY_ATTEMPTS,
  UNKNOWN_PERMISSION,
  WRONG_CODE,
  WRONG_PASSWORD,
});

export const authContract = {
  setupStatus: base
    .route({
      method: 'GET',
      path: '/setup',
      summary: 'Whether this installation still needs its first organisation and owner',
    })
    .output(z.object({ required: z.boolean() })),
  setup: base
    .route({
      method: 'POST',
      path: '/setup',
      successStatus: 201,
      summary:
        'First run: create the organisation and its owner, and sign in. 409 SETUP_DONE once an organisation exists; 403 SETUP_DISABLED where organisations come from the SaaS side',
    })
    .input(
      OrganizationRegion.extend({
        organizationName: z.string().trim().min(1).max(100),
        /** Defaults to one made from the name. */
        subdomain: z
          .string()
          .trim()
          .toLowerCase()
          .regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, 'letters, digits and dashes')
          .optional(),
        firstName: z.string().trim().min(1).max(100),
        lastName: z.string().trim().max(100).optional(),
        email: z.string().trim().check(z.email()).max(254),
        password: NewPassword,
      }),
    )
    .output(Session),
  signIn: base
    .route({
      method: 'POST',
      path: '/auth/sign-in',
      summary: 'Sign in with email and password; sets the session cookie',
    })
    .input(
      z.object({
        email: z.string().trim().check(z.email()).max(254),
        password: z.string().min(1).max(200),
        /** Needed only when the address does not name the organisation. */
        subdomain: z.string().trim().max(63).optional(),
      }),
    )
    .output(
      z.union([
        Session,
        /** Two-factor sign-in: send a code with this challenge to `/auth/sign-in/2fa` (5 minutes). */
        z.object({ twoFactorRequired: z.literal(true), challenge: z.string() }),
      ]),
    ),
  requestPasswordReset: base
    .route({
      method: 'POST',
      path: '/auth/password-reset',
      summary:
        'Email a password reset link. Always answers ok: it never tells whether an email has an account',
    })
    .input(
      z.object({
        email: z.string().trim().check(z.email()).max(254),
        subdomain: z.string().trim().max(63).optional(),
      }),
    )
    .output(z.object({ ok: z.literal(true) })),
  resetPassword: base
    .route({
      method: 'POST',
      path: '/auth/password-reset/confirm',
      summary: "Set a new password with the emailed link's token; signs in",
    })
    .input(z.object({ token: z.string().min(10).max(300), password: NewPassword }))
    .output(Session),
  invitation: base
    .route({
      method: 'GET',
      path: '/auth/invitation',
      summary: 'What an invitation link is for (organisation, email), to show before accepting',
    })
    .input(z.object({ token: z.string().min(10).max(300) }))
    .output(
      z.object({ organization: z.string(), email: z.string(), inviter: z.string().nullable() }),
    ),
  acceptInvitation: base
    .route({
      method: 'POST',
      path: '/auth/invitation/accept',
      summary: 'Accept an invitation: choose a password; signs in',
    })
    .input(
      z.object({
        token: z.string().min(10).max(300),
        password: NewPassword,
        firstName: z.string().trim().max(100).optional(),
        lastName: z.string().trim().max(100).optional(),
      }),
    )
    .output(Session),
  signInTwoFactor: base
    .route({
      method: 'POST',
      path: '/auth/sign-in/2fa',
      summary: "The sign-in's second step: an authenticator code, or a recovery code",
    })
    .input(
      z
        .object({
          challenge: z.string().min(10).max(2000),
          code: z
            .string()
            .trim()
            .regex(/^\d{6}$/)
            .optional(),
          recoveryCode: z.string().trim().min(8).max(40).optional(),
        })
        .refine((value) => Boolean(value.code || value.recoveryCode), 'a code or a recovery code'),
    )
    .output(Session),
  twoFactorSetup: base
    .route({
      method: 'POST',
      path: '/auth/2fa/setup',
      summary: 'Start turning on two-factor sign-in: a new secret for an authenticator app',
    })
    .output(z.object({ secret: z.string(), uri: z.string() })),
  twoFactorEnable: base
    .route({
      method: 'POST',
      path: '/auth/2fa/enable',
      summary: 'Confirm with a code from the app; returns recovery codes (shown once)',
    })
    .input(
      z.object({
        code: z
          .string()
          .trim()
          .regex(/^\d{6}$/),
      }),
    )
    .output(z.object({ recoveryCodes: z.array(z.string()) })),
  twoFactorDisable: base
    .route({
      method: 'POST',
      path: '/auth/2fa/disable',
      summary: 'Turn two-factor sign-in off (needs the password)',
    })
    .input(z.object({ password: z.string().min(1).max(200) }))
    .output(z.object({ ok: z.literal(true) })),
  twoFactorRecoveryCodes: base
    .route({
      method: 'POST',
      path: '/auth/2fa/recovery-codes',
      summary: 'New recovery codes (the old ones stop working; needs the password)',
    })
    .input(z.object({ password: z.string().min(1).max(200) }))
    .output(z.object({ recoveryCodes: z.array(z.string()) })),
  signOutEverywhere: base
    .route({
      method: 'POST',
      path: '/auth/sign-out-everywhere',
      summary: 'End every session of the signed-in member, on every device',
    })
    .output(z.object({ ok: z.literal(true) })),
  signOut: base
    .route({
      method: 'POST',
      path: '/auth/sign-out',
      summary: 'Sign out; clears the session cookie',
    })
    .output(z.object({ ok: z.literal(true) })),
  me: base
    .route({
      method: 'GET',
      path: '/auth/me',
      summary: 'The signed-in team member and their organisation',
    })
    .output(Session),
  onboarded: base
    .route({
      method: 'POST',
      path: '/auth/onboarded',
      summary: 'The signed-in member finished the welcome steps (on every browser)',
    })
    .input(
      z
        .object({
          /** Fill a fresh organisation with example contacts, notes and an automation (owners; once, while it has no contacts). */
          exampleData: z.boolean().optional(),
          /** The language of the example data: the member's UI language. */
          language: z.enum(LANGUAGES).optional(),
        })
        .optional(),
    )
    .output(Session),
  changePassword: base
    .route({
      method: 'POST',
      path: '/auth/password',
      summary:
        'Change my own password. 400 WRONG_PASSWORD when the current one is wrong; SAME_PASSWORD when unchanged',
    })
    .input(z.object({ currentPassword: z.string().min(1).max(200), newPassword: NewPassword }))
    .output(z.object({ ok: z.literal(true) })),
  signIns: base
    .route({
      method: 'GET',
      path: '/auth/sign-ins',
      summary: 'My 15 most recent sign-ins and failed attempts, newest first',
    })
    .output(
      z.object({
        data: z
          .array(
            z.object({
              id: z.string(),
              success: z.boolean(),
              ip: z.string().nullable(),
              userAgent: z.string().nullable(),
              createdAt: isoDate(),
            }),
          )
          .max(15),
      }),
    ),
};
