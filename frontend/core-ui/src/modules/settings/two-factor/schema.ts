import { z } from 'zod';

export const TWO_FACTOR_MODES = ['off', 'optional', 'required'] as const;

export const TWO_FACTOR_POLICY_SCHEMA = z.object({
  mode: z.enum(TWO_FACTOR_MODES),
  permissionGroupIds: z.array(z.string()),
});

export type TTwoFactorPolicyForm = z.infer<typeof TWO_FACTOR_POLICY_SCHEMA>;
