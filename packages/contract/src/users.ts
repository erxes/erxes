import { USER_STATUSES } from '@erxes/core-db/enums';
import { users } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
  CursorQuery,
  Id,
  IdList,
  PhoneNumber,
  QueryBoolean,
  cursorPageOf,
  ImageAddress,
  isoDate,
} from './common';
import { NewPassword, RoleKey, UserLinkName } from './values';

export const UserStatus = z.enum(USER_STATUSES);

export type UserStatus = z.infer<typeof UserStatus>;

export const UserLinks = z.record(z.string(), z.string());

export type UserLinks = z.infer<typeof UserLinks>;

/** A team member. Never carries credentials. */
export const User = createSelectSchema(users, {
  id: Id,
  email: z.email(),
  role: RoleKey,
  links: UserLinks,
  onboardedAt: isoDate,
  createdAt: isoDate,
  updatedAt: isoDate,
})
  .pick({
    id: true,
    email: true,
    username: true,
    /** Display name: first, middle and last name, or what was given at invite. */
    fullName: true,
    avatarUrl: true,
    role: true,
    status: true,
    firstName: true,
    middleName: true,
    lastName: true,
    shortName: true,
    employeeId: true,
    phone: true,
    /** `YYYY-MM-DD` */
    birthDate: true,
    /** `YYYY-MM-DD` */
    workStartedDate: true,
    description: true,
    links: true,
    /** Finished the welcome steps; null shows them at the next sign-in. */
    onboardedAt: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    /** Signs in with a second step (an authenticator app's code). */
    twoFactorEnabled: z.boolean(),
  });

export type User = z.infer<typeof User>;

/** A real calendar date, `YYYY-MM-DD` (2026-02-30 and 2026-99-99 are refused). */
export const DateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);

    // An overflowing day (02-30) comes back as another date; year 0 isn't a calendar year.
    return (
      !value.startsWith('0000') &&
      !Number.isNaN(date.getTime()) &&
      date.toISOString().startsWith(value)
    );
  }, 'not a real date');

const name = (value: z.ZodString) => value.trim().max(100);

/**
 * What a member's update may set. The names are never cleared; the profile
 * details (old erxes `users.details`) are, with `null`.
 */
const UserFields = createUpdateSchema(users, {
  fullName: z.string().trim().min(1).max(200).optional(),
  username: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-zA-Z0-9._-]+$/, 'letters, digits, dot, dash and underscore only')
    .optional(),
  firstName: name,
  middleName: name,
  lastName: name,
  shortName: name,
  employeeId: name,
  phone: () => PhoneNumber,
  birthDate: () => DateOnly,
  workStartedDate: () => DateOnly,
  description: (value) => value.trim().max(5000),
  /** Sets the given links; an empty string or `null` removes one. Others stay. */
  links: z.partialRecord(UserLinkName, z.string().trim().max(500).nullable()).optional(),
  email: (email) => email.trim().check(z.email()).max(254),
  avatarUrl: () => ImageAddress,
  role: () => RoleKey,
}).pick({
  fullName: true,
  username: true,
  firstName: true,
  middleName: true,
  lastName: true,
  shortName: true,
  employeeId: true,
  phone: true,
  birthDate: true,
  workStartedDate: true,
  description: true,
  links: true,
  email: true,
  avatarUrl: true,
  role: true,
});

const InviteEntry = z.object({
  email: z.string().trim().check(z.email()).max(254),
  role: RoleKey.refine(
    (role) => role !== 'owner',
    'invite as admin or member, then make them owner',
  ).default('member'),
  /** Given: the member can sign in at once (active). Otherwise they stay invited. */
  password: NewPassword.optional(),
  ...UserFields.pick({ fullName: true, username: true }).shape,
});

/** Something to change: at least one field besides `id`. */
const changes = (value: Record<string, unknown>) => Object.keys(value).some((key) => key !== 'id');

export const usersContract = {
  list: oc
    .route({
      method: 'GET',
      path: '/users',
      summary: 'Team members of the organisation, newest first',
    })
    .input(
      CursorQuery.extend({
        search: z.string().trim().max(100).optional(),
        status: UserStatus.optional(),
        /** `true`: invited and active members; `false`: disabled ones. */
        isActive: QueryBoolean.optional(),
        role: RoleKey.optional(),
        ids: IdList.optional(),
      }),
    )
    .output(cursorPageOf(User)),
  resendInvitation: oc
    .route({
      method: 'POST',
      path: '/users/{id}/invitation',
      summary: 'Email an invited member a new invitation link (earlier links stop working)',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  get: oc
    .route({ method: 'GET', path: '/users/{id}' })
    .input(z.object({ id: Id }))
    .output(User),
  invite: oc
    .route({
      method: 'POST',
      path: '/users',
      successStatus: 201,
      summary: 'Invite a team member (owners and admins)',
    })
    .input(InviteEntry)
    .output(User),
  inviteMany: oc
    .route({
      method: 'POST',
      path: '/users/invitations',
      successStatus: 201,
      summary: 'Invite several team members at once, all or none (owners and admins)',
    })
    .input(z.object({ entries: z.array(InviteEntry).min(1).max(50) }))
    .output(z.object({ data: z.array(User).max(50) })),
  update: oc
    .route({
      method: 'PATCH',
      path: '/users/{id}',
      summary:
        'Update a team member (self: own profile; owners/admins: anyone’s profile and role; only owners change an owner’s email)',
    })
    .input(UserFields.extend({ id: Id }).refine(changes, 'nothing to update'))
    .output(User),
  setPassword: oc
    .route({
      method: 'POST',
      path: '/users/{id}/password',
      summary:
        'Set another member’s password (owners and admins; an invited member becomes active)',
    })
    .input(z.object({ id: Id, password: NewPassword }))
    .output(User),
  disable: oc
    .route({ method: 'POST', path: '/users/{id}/disable' })
    .input(z.object({ id: Id }))
    .output(User),
  enable: oc
    .route({ method: 'POST', path: '/users/{id}/enable' })
    .input(z.object({ id: Id }))
    .output(User),
};
