import { InviteRole, NewPassword } from '@erxes/core-contract';
import { z } from 'zod';

/** One row per invitation. An empty password leaves the member invited until they set one. */
export const USER_SUBMIT_SCHEMA = z.object({
  entries: z
    .object({
      email: z
        .string({
          error: (issue) => (issue.input === undefined ? 'Required field' : undefined),
        })
        .trim()
        .check(z.email('Please fill a valid email address')),
      password: z.union([z.literal(''), NewPassword]),
      role: InviteRole,
    })
    .array(),
});

export type TUserForm = z.infer<typeof USER_SUBMIT_SCHEMA>;

export type IUserEntry = TUserForm['entries'][number];

export const INVITE_ROW_DEFAULTS: IUserEntry = { email: '', password: '', role: 'member' };
