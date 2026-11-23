import { z } from 'zod';
import { base } from './authBase';

/** Turning two-factor sign-in on and off for the signed-in member. */
export const twoFactorContract = {
  twoFactorSetup: base
    .route({
      method: 'POST',
      path: '/auth/2fa/setup',
      summary: 'Start two-factor setup',
      description: 'Start turning on two-factor sign-in: a new secret for an authenticator app',
    })
    .output(z.object({ secret: z.string(), uri: z.string() })),
  twoFactorEnable: base
    .route({
      method: 'POST',
      path: '/auth/2fa/enable',
      summary: 'Turn on two-factor sign-in',
      description: 'Confirm with a code from the app; returns recovery codes (shown once)',
    })
    .input(
      z.object({
        code: z
          .string()
          .trim()
          .regex(/^\d{6}$/),
      }),
    )
    .output(z.object({ recoveryCodes: z.array(z.string()) })),
  twoFactorDisable: base
    .route({
      method: 'POST',
      path: '/auth/2fa/disable',
      summary: 'Turn off two-factor sign-in',
      description: 'Turn two-factor sign-in off (needs the password)',
    })
    .input(z.object({ password: z.string().min(1).max(200) }))
    .output(z.object({ ok: z.literal(true) })),
  twoFactorRecoveryCodes: base
    .route({
      method: 'POST',
      path: '/auth/2fa/recovery-codes',
      summary: 'New recovery codes',
      description: 'New recovery codes (the old ones stop working; needs the password)',
    })
    .input(z.object({ password: z.string().min(1).max(200) }))
    .output(z.object({ recoveryCodes: z.array(z.string()) })),
};
