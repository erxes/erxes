import { LANGUAGES } from '@erxes/core-db/enums';
import { z } from 'zod';
import { base } from './authBase';
import { twoFactorContract } from './authTwoFactor';
import { isoDate } from './common';
import { ERRORS } from './errors';
import { NewPassword, PluginName } from './values';
import { Organization, OrganizationRegion } from './organizations';
import { User } from './users';

export const Session = z.object({
  user: User,
  organization: Organization,
  /** What the member may do (actions); owners have every one. */
  permissions: z.array(z.string()),
  /** False until the member sets one: a SaaS owner arrives signed in from erxes.io without one. */
  hasPassword: z.boolean(),
});

export type Session = z.infer<typeof Session>;

/** A sign-in's answer: the session, or the second step two-factor members owe. */
const SignedIn = z.union([
  Session,
  /** Two-factor sign-in: send a code with this challenge to `/auth/sign-in/2fa` (5 minutes). */
  z.object({ twoFactorRequired: z.literal(true), challenge: z.string() }),
]);

/** Names the organisation where the address doesn't. */
const Subdomain = z.string().trim().max(63).optional();

const { EMAIL_REQUIRED, PLUGIN_UNREACHABLE, SIGN_IN_UNAVAILABLE } = ERRORS;

export const authContract = {
  setupStatus: base
    .route({
      method: 'GET',
      path: '/setup',
      summary: 'Check whether setup is needed',
      description: 'Whether this installation still needs its first organisation and owner',
    })
    .output(z.object({ required: z.boolean() })),
  setup: base
    .route({
      method: 'POST',
      path: '/setup',
      successStatus: 201,
      summary: 'Set up the first organisation',
      description:
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
      summary: 'Sign in with email and password',
      description: 'Sets the session cookie',
    })
    .input(
      z.object({
        email: z.string().trim().check(z.email()).max(254),
        password: z.string().min(1).max(200),
        /** Needed only when the address does not name the organisation. */
        subdomain: Subdomain,
      }),
    )
    .output(SignedIn),
  signInProviders: base
    .route({
      method: 'GET',
      path: '/auth/sign-in/providers',
      summary: 'List the ways to sign in besides email',
      description:
        "The organisation's sign-in providers, for the sign-in screen: plugins that check a member's login with another system (a company directory), each with the label to show. The organisation is the one `subdomain`, the address or DEFAULT_SUBDOMAIN names, else a self-hosted server's only one; none when that names none",
    })
    .input(z.object({ subdomain: Subdomain }))
    .output(z.object({ providers: z.array(z.object({ plugin: z.string(), label: z.string() })) })),
  signInWithProvider: base
    .errors({ EMAIL_REQUIRED, PLUGIN_UNREACHABLE, SIGN_IN_UNAVAILABLE })
    .route({
      method: 'POST',
      path: '/auth/sign-in/provider',
      summary: 'Sign in through a sign-in provider',
      description:
        "Sets the session cookie. The plugin named checks the login and password with its system and says who the member is; core signs them in, the first time as a new member. 401 INVALID_CREDENTIALS, 400 SIGN_IN_UNAVAILABLE when the plugin can't sign members in here, 400 EMAIL_REQUIRED or 409 TAKEN when a new member has no email or another member has it, 502 PLUGIN_UNREACHABLE",
    })
    .input(
      z.object({
        plugin: PluginName,
        /** What the member types to that system: a username or an email. */
        login: z.string().trim().min(1).max(200),
        password: z.string().min(1).max(200),
        subdomain: Subdomain,
      }),
    )
    .output(SignedIn),
  requestPasswordReset: base
    .route({
      method: 'POST',
      path: '/auth/password-reset',
      summary: 'Email a password reset link',
      description: 'Always answers ok: it never tells whether an email has an account',
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
      summary: 'Reset a password',
      description: "Set a new password with the emailed link's token; signs in",
    })
    .input(z.object({ token: z.string().min(10).max(300), password: NewPassword }))
    .output(Session),
  invitation: base
    .route({
      method: 'GET',
      path: '/auth/invitation',
      summary: 'Get an invitation',
      description: 'What an invitation link is for (organisation, email), to show before accepting',
    })
    .input(z.object({ token: z.string().min(10).max(300) }))
    .output(
      z.object({ organization: z.string(), email: z.string(), inviter: z.string().nullable() }),
    ),
  acceptInvitation: base
    .route({
      method: 'POST',
      path: '/auth/invitation/accept',
      summary: 'Accept an invitation',
      description: 'Accept an invitation: choose a password; signs in',
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
      summary: 'Sign in with a two-factor code',
      description: "The sign-in's second step: an authenticator code, or a recovery code",
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
  ...twoFactorContract,
  signOutEverywhere: base
    .route({
      method: 'POST',
      path: '/auth/sign-out-everywhere',
      summary: 'Sign out everywhere',
      description: 'End every session of the signed-in member, on every device',
    })
    .output(z.object({ ok: z.literal(true) })),
  signOut: base
    .route({
      method: 'POST',
      path: '/auth/sign-out',
      summary: 'Sign out',
      description: 'Sign out; clears the session cookie',
    })
    .output(z.object({ ok: z.literal(true) })),
  me: base
    .route({
      method: 'GET',
      path: '/auth/me',
      summary: 'Get the signed-in member',
      description: 'The signed-in team member and their organisation',
    })
    .output(Session),
  onboarded: base
    .route({
      method: 'POST',
      path: '/auth/onboarded',
      summary: 'Finish onboarding',
      description: 'The signed-in member finished the welcome steps (on every browser)',
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
      summary: 'Change my password',
      description:
        'Change my own password, or set my first one (no current one then). 400 WRONG_PASSWORD when the current one is wrong or missing; SAME_PASSWORD when unchanged',
    })
    .input(
      z.object({
        /** Left out by a member who has no password yet (`Session.hasPassword`). */
        currentPassword: z.string().min(1).max(200).optional(),
        newPassword: NewPassword,
      }),
    )
    .output(z.object({ ok: z.literal(true) })),
  signIns: base
    .route({
      method: 'GET',
      path: '/auth/sign-ins',
      summary: 'List my recent sign-ins',
      description: 'My 15 most recent sign-ins and failed attempts, newest first',
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
