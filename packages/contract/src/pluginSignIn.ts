import { z } from 'zod';

/** What core POSTs to a sign-in provider's `<api.url>/auth/sign-in` (`manifest.signIn`): what the member typed. */
export const PluginSignInRequest = z.object({
  /** A username or an email, as the member typed it. */
  login: z.string(),
  password: z.string(),
});

export type PluginSignInRequest = z.infer<typeof PluginSignInRequest>;

/**
 * A sign-in provider's 200 answer when the login and password are right (401 when they aren't):
 * who the member is in its system. Core signs in the member it linked to `subject`; the first
 * time, the member with this email when `linkByEmail`, else a new member.
 */
export const PluginSignInIdentity = z.object({
  /** Their id in that system, which never changes (an LDAP `entryUUID`, not the username). */
  subject: z.string().trim().min(1).max(256),
  /** A new member needs one. */
  email: z.string().trim().toLowerCase().check(z.email()).max(254).optional(),
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  /**
   * The first time, sign in the member who has this email instead of adding one. Set it only
   * when that system proves the email is theirs: whoever it vouches for gets that account.
   * Owners are never matched by email.
   */
  linkByEmail: z.boolean().optional(),
});

export type PluginSignInIdentity = z.infer<typeof PluginSignInIdentity>;
