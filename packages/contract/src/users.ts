import { oc } from '@orpc/contract';
import { z } from 'zod';
import { CursorQuery, Id, IdList, cursorPageOf } from './common';

export const UserRole = z.enum(['owner', 'admin', 'member']);
export const UserStatus = z.enum(['invited', 'active', 'disabled']);
export type UserRole = z.infer<typeof UserRole>;
export type UserStatus = z.infer<typeof UserStatus>;

/** A team member. Never carries credentials. */
export const User = z.object({
  id: Id,
  email: z.string().email(),
  username: z.string().nullable(),
  fullName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: UserRole,
  status: UserStatus,
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

/** Something to change: at least one field besides `id`. */
const changes = (value: Record<string, unknown>) => Object.keys(value).some((key) => key !== 'id');

export const usersContract = {
  list: oc
    .route({ method: 'GET', path: '/users', summary: 'Team members of the organisation, newest first' })
    .input(
      CursorQuery.extend({
        search: z.string().trim().max(100).optional(),
        status: UserStatus.optional(),
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
    .input(
      z.object({
        email: z.string().trim().email().max(254),
        role: UserRole.exclude(['owner']).default('member'),
        ...NameFields,
      }),
    )
    .output(User),
  update: oc
    .route({
      method: 'PATCH',
      path: '/users/{id}',
      summary: 'Update a team member (self: name and avatar; owners/admins: also role)',
    })
    .input(
      z
        .object({
          id: Id,
          ...NameFields,
          avatarUrl: z.string().url().max(1000).nullable().optional(),
          role: UserRole.optional(),
        })
        .refine(changes, 'nothing to update'),
    )
    .output(User),
  disable: oc.route({ method: 'POST', path: '/users/{id}/disable' }).input(z.object({ id: Id })).output(User),
  enable: oc.route({ method: 'POST', path: '/users/{id}/enable' }).input(z.object({ id: Id })).output(User),
};
