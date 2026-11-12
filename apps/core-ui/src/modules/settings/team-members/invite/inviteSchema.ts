import { z } from 'zod';

/** Empty, or a password the API accepts (as sign-up). */
const password = z.union([
  z.literal(''),
  z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[a-z]/, 'Add a lower-case letter')
    .regex(/[A-Z]/, 'Add an upper-case letter')
    .regex(/\d/, 'Add a digit'),
]);

/** One row per invitation. */
export const USER_SUBMIT_SCHEMA = z.object({
  entries: z
    .object({
      email: z
        .string({ required_error: 'Required field' })
        .trim()
        .email({ message: 'Please fill a valid email address' }),
      password,
      role: z.enum(['member', 'admin']),
    })
    .array(),
});

export type TUserForm = z.infer<typeof USER_SUBMIT_SCHEMA>;

export type IUserEntry = TUserForm['entries'][number];

export const INVITE_ROW_DEFAULTS: IUserEntry = { email: '', password: '', role: 'member' };
