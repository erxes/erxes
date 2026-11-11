import { oc } from '@orpc/contract';
import { z } from 'zod';
import { CursorQuery, Id, IdList, PhoneNumber, cursorPageOf, text, ImageAddress } from './common';

export const UserRole = z.enum(['owner', 'admin', 'member']);
export const UserStatus = z.enum(['invited', 'active', 'disabled']);
export type UserRole = z.infer<typeof UserRole>;
export type UserStatus = z.infer<typeof UserStatus>;

/** Social links a member can show (old erxes `users.links`). */
export const USER_LINK_NAMES = ['facebook', 'twitter', 'website', 'discord', 'github', 'instagram'] as const;
export const UserLinkName = z.enum(USER_LINK_NAMES);
export type UserLinkName = z.infer<typeof UserLinkName>;
export const UserLinks = z.record(z.string(), z.string());
export type UserLinks = z.infer<typeof UserLinks>;

/** A team member. Never carries credentials. */
export const User = z.object({
  id: Id,
  email: z.string().email(),
  username: z.string().nullable(),
  /** Display name: first, middle and last name, or what was given at invite. */
  fullName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: UserRole,
  status: UserStatus,
  firstName: z.string().nullable(),
  middleName: z.string().nullable(),
  lastName: z.string().nullable(),
  shortName: z.string().nullable(),
  employeeId: z.string().nullable(),
  phone: z.string().nullable(),
  /** `YYYY-MM-DD` */
  birthDate: z.string().nullable(),
  /** `YYYY-MM-DD` */
  workStartedDate: z.string().nullable(),
  description: z.string().nullable(),
  links: UserLinks,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type User = z.infer<typeof User>;

const NameFields = {
  fullName: z.string().trim().min(1).max(200).optional(),
  username: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-zA-Z0-9._-]+$/, 'letters, digits, dot, dash and underscore only')
    .optional(),
};

/** A real calendar date, `YYYY-MM-DD` (2026-02-30 and 2026-99-99 are refused). */
export const DateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number) as [number, number, number];
    const date = new Date(Date.UTC(year, month - 1, day));

    return year >= 1 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }, 'not a real date');

/** Profile details (old erxes `users.details`); `null` clears one. */
const DetailFields = {
  firstName: text(100),
  middleName: text(100),
  lastName: text(100),
  shortName: text(100),
  employeeId: text(100),
  phone: PhoneNumber.nullable().optional(),
  birthDate: DateOnly.nullable().optional(),
  workStartedDate: DateOnly.nullable().optional(),
  description: text(5000),
  /** Sets the given links; an empty string or `null` removes one. Others stay. */
  links: z.record(UserLinkName, z.string().trim().max(500).nullable()).optional(),
};

/** As sign-up (`NewPassword` in auth.ts, which imports this file). */
const MemberPassword = z
  .string()
  .min(8, 'At least 8 characters')
  .max(200)
  .regex(/[a-z]/, 'Add a lower-case letter')
  .regex(/[A-Z]/, 'Add an upper-case letter')
  .regex(/\d/, 'Add a digit');

/** `true`/`false` from a query string, or a boolean from a typed client. */
const QueryBoolean = z.union([z.boolean(), z.enum(['true', 'false']).transform((value) => value === 'true')]);

const InviteEntry = z.object({
  email: z.string().trim().email().max(254),
  role: UserRole.exclude(['owner']).default('member'),
  /** Given: the member can sign in at once (active). Otherwise they stay invited. */
  password: MemberPassword.optional(),
  ...NameFields,
});

/** Something to change: at least one field besides `id`. */
const changes = (value: Record<string, unknown>) => Object.keys(value).some((key) => key !== 'id');

export const usersContract = {
  list: oc
    .route({ method: 'GET', path: '/users', summary: 'Team members of the organisation, newest first' })
    .input(
      CursorQuery.extend({
        search: z.string().trim().max(100).optional(),
        status: UserStatus.optional(),
        /** `true`: invited and active members; `false`: disabled ones. */
        isActive: QueryBoolean.optional(),
        role: UserRole.optional(),
        ids: IdList.optional(),
      }),
    )
    .output(cursorPageOf(User)),
  get: oc.route({ method: 'GET', path: '/users/{id}' }).input(z.object({ id: Id })).output(User),
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
    .output(z.object({ data: z.array(User) })),
  update: oc
    .route({
      method: 'PATCH',
      path: '/users/{id}',
      summary:
        'Update a team member (self: own profile; owners/admins: anyone’s profile and role; only owners change an owner’s email)',
    })
    .input(
      z
        .object({
          id: Id,
          ...NameFields,
          ...DetailFields,
          email: z.string().trim().email().max(254).optional(),
          avatarUrl: ImageAddress.nullable().optional(),
          role: UserRole.optional(),
        })
        .refine(changes, 'nothing to update'),
    )
    .output(User),
  setPassword: oc
    .route({
      method: 'POST',
      path: '/users/{id}/password',
      summary: 'Set another member’s password (owners and admins; an invited member becomes active)',
    })
    .input(z.object({ id: Id, password: MemberPassword }))
    .output(User),
  disable: oc.route({ method: 'POST', path: '/users/{id}/disable' }).input(z.object({ id: Id })).output(User),
  enable: oc.route({ method: 'POST', path: '/users/{id}/enable' }).input(z.object({ id: Id })).output(User),
};
