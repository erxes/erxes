import { oc } from '@orpc/contract';
import { z } from 'zod';
import { Organization } from './organizations';
import { User } from './users';

export const Session = z.object({ user: User, organization: Organization });
export type Session = z.infer<typeof Session>;

/** At least 8 characters with a lower-case letter, an upper-case letter and a digit (as old erxes). */
export const NewPassword = z
  .string()
  .min(8, 'At least 8 characters')
  .max(200)
  .regex(/[a-z]/, 'Add a lower-case letter')
  .regex(/[A-Z]/, 'Add an upper-case letter')
  .regex(/\d/, 'Add a digit');

export const authContract = {
  setupStatus: oc
    .route({
      method: 'GET',
      path: '/setup',
      summary: 'Whether this installation still needs its first organisation and owner',
    })
    .output(z.object({ required: z.boolean() })),
  setup: oc
    .route({
      method: 'POST',
      path: '/setup',
      successStatus: 201,
      summary:
        'First run: create the organisation and its owner, and sign in. 409 SETUP_DONE once an organisation exists; 403 SETUP_DISABLED where organisations come from the SaaS side',
    })
    .input(
      z.object({
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
        email: z.string().trim().email().max(254),
        password: NewPassword,
      }),
    )
    .output(Session),
  signIn: oc
    .route({
      method: 'POST',
      path: '/auth/sign-in',
      summary: 'Sign in with email and password; sets the session cookie',
    })
    .input(
      z.object({
        email: z.string().trim().email().max(254),
        password: z.string().min(1).max(200),
        /** Needed only when the address does not name the organisation. */
        subdomain: z.string().trim().max(63).optional(),
      }),
    )
    .output(Session),
  signOut: oc
    .route({ method: 'POST', path: '/auth/sign-out', summary: 'Sign out; clears the session cookie' })
    .output(z.object({ ok: z.literal(true) })),
  me: oc
    .route({ method: 'GET', path: '/auth/me', summary: 'The signed-in team member and their organisation' })
    .output(Session),
  changePassword: oc
    .route({
      method: 'POST',
      path: '/auth/password',
      summary: 'Change my own password. 400 WRONG_PASSWORD when the current one is wrong; SAME_PASSWORD when unchanged',
    })
    .input(z.object({ currentPassword: z.string().min(1).max(200), newPassword: NewPassword }))
    .output(z.object({ ok: z.literal(true) })),
  signIns: oc
    .route({ method: 'GET', path: '/auth/sign-ins', summary: 'My recent sign-ins and failed attempts, newest first' })
    .output(
      z.object({
        data: z.array(
          z.object({
            id: z.string(),
            success: z.boolean(),
            ip: z.string().nullable(),
            userAgent: z.string().nullable(),
            createdAt: z.string().datetime(),
          }),
        ),
      }),
    ),
};
