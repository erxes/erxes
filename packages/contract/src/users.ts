import { USER_STATUSES } from '@erxes/core-db/enums';
import { users } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
  CursorQuery,
  DESCRIPTION_MAX,
  Id,
  IdList,
  PhoneNumber,
  QueryBoolean,
  cursorPageOf,
  ImageAddress,
  isoDate,
} from './common';
import { MemberId } from './records';
import { PermissionAction } from './roles';
import { InviteRole, NewPassword, RoleKey, UserLinkName } from './values';

export const UserStatus = z.enum(USER_STATUSES);

export type UserStatus = z.infer<typeof UserStatus>;

export const UserLinks = z.record(z.string(), z.string());

export type UserLinks = z.infer<typeof UserLinks>;

/** A team member. Never carries credentials. */
export const User = createSelectSchema(users, {
  id: MemberId,
  email: z.email().nullable(),
  role: RoleKey,
  links: UserLinks,
  onboardedAt: isoDate,
  totpEnabledAt: isoDate,
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  id: true,
  /** How they sign in; may be empty for a member who doesn't. */
  email: true,
  /** Signs in to erxes. Off for people on the team without an account (they use a plugin's own app, or nothing): no seat, no sign-in. */
  canSignIn: true,
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
  /** Signs in with a second step (an authenticator app's code) since then; null when off. */
  totpEnabledAt: true,
  createdAt: true,
  updatedAt: true,
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

/** Where a member signs in and gets email. */
const Email = z.string().trim().check(z.email()).max(254);

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
  description: (value) => value.trim().max(DESCRIPTION_MAX),
  /** Sets the given links; an empty string or `null` removes one. Others stay. */
  links: z.partialRecord(UserLinkName, z.string().trim().max(500).nullable()).optional(),
  email: () => Email.nullish(),
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
  email: Email,
  role: InviteRole.default('member'),
  /** Given: the member can sign in at once (active). Otherwise they stay invited. */
  password: NewPassword.optional(),
  ...UserFields.pick({ fullName: true, username: true }).shape,
});

/** Someone on the team who doesn't sign in: their name, and optionally how to reach them. */
const NewMember = UserFields.pick({
  fullName: true,
  firstName: true,
  middleName: true,
  lastName: true,
  shortName: true,
  employeeId: true,
  phone: true,
  email: true,
  birthDate: true,
  workStartedDate: true,
  description: true,
  role: true,
}).required({ fullName: true });

/** Something to change: at least one field besides `id`. */
const changes = (value: Record<string, unknown>) => Object.keys(value).some((key) => key !== 'id');

const {
  BEYOND_OWN_PERMISSIONS,
  BUILTIN_ROLE,
  FIXED_ROLE,
  INVALID_LINK,
  INVALID_RECIPIENT,
  LAST_OWNER,
  LIMIT_EXCEEDED,
  NOT_INVITED,
  OWNER_ONLY,
  OWNER_ONLY_PERMISSION,
  OWNER_SIGNS_IN,
  OWN_ACCOUNT,
  OWN_ROLE,
  ROLE_IN_USE,
  ROLE_NOT_FOUND,
  UNKNOWN_PERMISSION,
  EMAIL_REQUIRED,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  BEYOND_OWN_PERMISSIONS,
  BUILTIN_ROLE,
  FIXED_ROLE,
  INVALID_LINK,
  INVALID_RECIPIENT,
  LAST_OWNER,
  LIMIT_EXCEEDED,
  NOT_INVITED,
  OWNER_ONLY,
  OWNER_ONLY_PERMISSION,
  OWNER_SIGNS_IN,
  OWN_ACCOUNT,
  OWN_ROLE,
  ROLE_IN_USE,
  ROLE_NOT_FOUND,
  UNKNOWN_PERMISSION,
  EMAIL_REQUIRED,
});

export const usersContract = {
  list: base
    .route({
      method: 'GET',
      path: '/users',
      summary: 'List team members',
      description: 'Team members of the organisation, newest first',
    })
    .input(
      CursorQuery.extend({
        search: z.string().trim().max(100).optional(),
        status: UserStatus.optional(),
        /** `true`: invited and active members; `false`: disabled ones. */
        isActive: QueryBoolean.optional(),
        role: RoleKey.optional(),
        /** Only the members whose role allows this action (`hr.leave.approve`); owners always do. */
        permission: PermissionAction.optional(),
        /** `false`: only the members who don't sign in. */
        canSignIn: QueryBoolean.optional(),
        ids: IdList.optional(),
        /** The team members list's filter bar: JSON of a condition group on `subject.<field>` paths (role, status, dates…). */
        filter: z.string().max(20_000).optional(),
      }),
    )
    .output(cursorPageOf(User)),
  resendInvitation: base
    .route({
      method: 'POST',
      path: '/users/{id}/invitation',
      summary: 'Resend an invitation',
      description: 'Email an invited member a new invitation link (earlier links stop working)',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  get: base
    .route({ method: 'GET', path: '/users/{id}', summary: 'Get a team member' })
    .input(z.object({ id: Id }))
    .output(User),
  invite: base
    .route({
      method: 'POST',
      path: '/users',
      successStatus: 201,
      summary: 'Invite a team member',
      description: 'Invite a team member (owners and admins)',
    })
    .input(InviteEntry)
    .output(User),
  inviteMany: base
    .route({
      method: 'POST',
      path: '/users/invitations',
      successStatus: 201,
      summary: 'Invite team members',
      description: 'Invite several team members at once, all or none (owners and admins)',
    })
    .input(z.object({ entries: z.array(InviteEntry).min(1).max(50) }))
    .output(z.object({ data: z.array(User).max(50) })),
  add: base
    .route({
      method: 'POST',
      path: '/users/without-sign-in',
      successStatus: 201,
      summary: 'Add a member who doesn’t sign in',
      description:
        'Add someone to the team who doesn’t sign in (no seat): a worker who uses a plugin’s own app, such as HR’s. Members with team.invite; plugins with users:write. 409 TAKEN when the email is a member’s',
    })
    .input(NewMember)
    .output(User),
  allowSignIn: base
    .route({
      method: 'POST',
      path: '/users/{id}/sign-in',
      summary: 'Let a member sign in',
      description:
        'Let a member who doesn’t sign in join: they are invited at their email (or the one given). 400 EMAIL_REQUIRED without one',
    })
    .input(z.object({ id: Id, email: Email.optional() }))
    .output(User),
  stopSignIn: base
    .route({
      method: 'DELETE',
      path: '/users/{id}/sign-in',
      summary: 'Stop a member signing in',
      description:
        'Keep a member on the team without sign-in: their sessions, password and API keys stop working, and they no longer take a seat. 409 OWNER_SIGNS_IN for an owner',
    })
    .input(z.object({ id: Id }))
    .output(User),
  update: base
    .route({
      method: 'PATCH',
      path: '/users/{id}',
      summary: 'Change a team member',
      description:
        'Update a team member (self: own profile; owners/admins: anyone’s profile and role; only owners change an owner’s email). Plugins with users:write change the profile of members who don’t sign in',
    })
    .input(UserFields.extend({ id: Id }).refine(changes, 'nothing to update'))
    .output(User),
  setPassword: base
    .route({
      method: 'POST',
      path: '/users/{id}/password',
      summary: 'Set a member’s password',
      description:
        'Set another member’s password (owners and admins; an invited member becomes active)',
    })
    .input(z.object({ id: Id, password: NewPassword }))
    .output(User),
  disable: base
    .route({
      method: 'POST',
      path: '/users/{id}/disable',
      summary: 'Disable a member',
      description: 'Plugins with users:write disable and enable members who don’t sign in',
    })
    .input(z.object({ id: Id }))
    .output(User),
  enable: base
    .route({
      method: 'POST',
      path: '/users/{id}/enable',
      summary: 'Enable a member',
      description: 'Plugins with users:write disable and enable members who don’t sign in',
    })
    .input(z.object({ id: Id }))
    .output(User),
};
