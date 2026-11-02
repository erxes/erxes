import { z } from 'zod';

const AUTHENTICATOR_CODE = /^\d{6}$/;
const RECOVERY_CODE = /^[a-z2-7]{4}-?[a-z2-7]{4}$/i;

export const twoFactorCodeSchema = (allowRecovery: boolean) =>
  z.object({
    code: z
      .string()
      .trim()
      .refine(
        (code) =>
          AUTHENTICATOR_CODE.test(code) ||
          (allowRecovery && RECOVERY_CODE.test(code)),
        allowRecovery
          ? 'Enter the 6-digit code or a recovery code'
          : 'Enter the 6-digit code',
      ),
  });

export type TTwoFactorCodeForm = z.infer<ReturnType<typeof twoFactorCodeSchema>>;
